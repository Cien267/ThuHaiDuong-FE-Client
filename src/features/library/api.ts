import { queryOptions } from "@tanstack/react-query";
import { api, isBackendUnavailable, tokenStorage } from "@/lib/api/client";
import { STORIES } from "@/features/stories/mock-data";
import type { StorySummary } from "@/features/stories/types";
import type { BookmarkItem, ReadingProgress } from "./types";

/**
 * Tủ sách & tiến độ đọc.
 *
 * Chiến lược lưu trữ:
 *   1. Nếu user đã đăng nhập VÀ backend phản hồi ⇒ dùng API thật.
 *   2. Nếu không (guest hoặc backend offline) ⇒ fallback localStorage để
 *      vẫn dùng được khi đọc ẩn danh — đúng tinh thần "auth là tuỳ chọn".
 */

const BOOKMARKS_KEY = "library:bookmarks:v1";
const PROGRESS_KEY = "library:progress:v1";

interface LocalBookmark {
  storySlug: string;
  createdAt: string;
}
type LocalBookmarks = Record<string, LocalBookmark>;
type LocalProgress = Record<string, ReadingProgress>;

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Báo cho các tab/component khác đang lắng nghe
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    /* quota / privacy mode — bỏ qua */
  }
}

function isAuthenticated(): boolean {
  return Boolean(tokenStorage.getAccess());
}

/** Lấy truyện theo slug từ API; fallback dữ liệu mẫu nếu lỗi mạng. */
async function resolveStory(slug: string): Promise<StorySummary | null> {
  try {
    const { data } = await api.get(`/stories/${slug}`);
    return data as StorySummary;
  } catch (err) {
    if (isBackendUnavailable(err)) {
      return STORIES.find((s) => s.slug === slug) ?? null;
    }
    return null;
  }
}

function unwrap<T>(data: unknown): T {
  if (data && typeof data === "object" && "data" in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }
  return data as T;
}

// ====== Bookmark ======

export async function fetchBookmarks(): Promise<BookmarkItem[]> {
  if (isAuthenticated()) {
    try {
      const { data } = await api.get("/bookmarks", { params: { page: 1, pageSize: 200 } });
      const body = unwrap<BookmarkItem[] | { items: BookmarkItem[] }>(data);
      return Array.isArray(body) ? body : (body.items ?? []);
    } catch (err) {
      if (!isBackendUnavailable(err)) throw err;
      // fall through → local
    }
  }
  // Guest / offline: ghép local bookmark với story + progress
  const bookmarks = readLocal<LocalBookmarks>(BOOKMARKS_KEY, {});
  const progress = readLocal<LocalProgress>(PROGRESS_KEY, {});
  const slugs = Object.keys(bookmarks);
  const stories = await Promise.all(slugs.map(resolveStory));
  return slugs
    .map((slug, i) => {
      const story = stories[i];
      if (!story) return null;
      const pg = progress[slug];
      const item: BookmarkItem = {
        story,
        lastReadChapterNumber: pg?.chapterNumber ?? null,
        lastReadChapterTitle: pg?.chapterTitle ?? null,
        lastReadAt: pg?.lastReadAt ?? null,
        latestChapterNumber: story.totalChapters || null,
        createdAt: bookmarks[slug].createdAt,
      };
      return item;
    })
    .filter((x): x is BookmarkItem => x !== null)
    .sort((a, b) => {
      const ax = a.lastReadAt ?? a.createdAt;
      const bx = b.lastReadAt ?? b.createdAt;
      return bx.localeCompare(ax);
    });
}

export async function addBookmark(storySlug: string): Promise<void> {
  if (isAuthenticated()) {
    try {
      await api.post("/bookmarks", { storySlug });
      return;
    } catch (err) {
      if (!isBackendUnavailable(err)) throw err;
    }
  }
  const bookmarks = readLocal<LocalBookmarks>(BOOKMARKS_KEY, {});
  if (!bookmarks[storySlug]) {
    bookmarks[storySlug] = { storySlug, createdAt: new Date().toISOString() };
    writeLocal(BOOKMARKS_KEY, bookmarks);
  }
}

export async function removeBookmark(storySlug: string): Promise<void> {
  if (isAuthenticated()) {
    try {
      await api.delete(`/bookmarks/${storySlug}`);
      return;
    } catch (err) {
      if (!isBackendUnavailable(err)) throw err;
    }
  }
  const bookmarks = readLocal<LocalBookmarks>(BOOKMARKS_KEY, {});
  delete bookmarks[storySlug];
  writeLocal(BOOKMARKS_KEY, bookmarks);
}

export async function isBookmarked(storySlug: string): Promise<boolean> {
  if (isAuthenticated()) {
    try {
      const { data } = await api.get(`/bookmarks/${storySlug}`);
      return Boolean(unwrap(data));
    } catch (err) {
      if (!isBackendUnavailable(err)) return false;
    }
  }
  const bookmarks = readLocal<LocalBookmarks>(BOOKMARKS_KEY, {});
  return Boolean(bookmarks[storySlug]);
}

// ====== Reading progress ======

/** Ghi nhận tiến độ — chỉ tiến lên, backend là nguồn sự thật. Best-effort. */
export async function updateProgress(
  storySlug: string,
  chapterNumber: number,
  chapterTitle?: string,
): Promise<void> {
  // Luôn cập nhật local trước (để Tủ sách phản ánh tức thì)
  const progress = readLocal<LocalProgress>(PROGRESS_KEY, {});
  const prev = progress[storySlug];
  if (!prev || chapterNumber > prev.chapterNumber) {
    progress[storySlug] = {
      chapterNumber,
      chapterTitle,
      lastReadAt: new Date().toISOString(),
    };
    writeLocal(PROGRESS_KEY, progress);
  }
  if (!isAuthenticated()) return;
  try {
    await api.post(`/stories/${storySlug}/progress`, { chapterNumber });
  } catch {
    /* best-effort — backend sẽ tự enforce chỉ-tiến-lên */
  }
}

// ====== Query options ======

export const bookmarksQuery = () =>
  queryOptions({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    staleTime: 30_000,
  });

export const bookmarkStatusQuery = (slug: string) =>
  queryOptions({
    queryKey: ["bookmark", slug],
    queryFn: () => isBookmarked(slug),
    staleTime: 30_000,
  });
