import { queryOptions } from "@tanstack/react-query";
import { api, isBackendUnavailable, tokenStorage } from "@/lib/api/client";
import { STORIES } from "@/features/stories/mock-data";
import type { StorySummary } from "@/features/stories/types";
import type { BookmarkItem, BookmarkToggleResult, ReadingProgress } from "./types";

export const isAuthenticated = (): boolean => {
  return Boolean(tokenStorage.getAccess());
};

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
  try {
    const { data } = await api.get("/bookmarks", { params: { page: 1, pageSize: 200 } });
    const body = unwrap<BookmarkItem[] | { items: BookmarkItem[] }>(data);
    return Array.isArray(body) ? body : (body.items ?? []);
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
    return [];
  }
}

export async function toggleBookmark(storyId: string): Promise<BookmarkToggleResult> {
  try {
    const { data } = await api.post(`/bookmarks/${storyId}/toggle`, {});
    return unwrap<BookmarkToggleResult>(data);
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
    return { isBookmarked: false, storyId };
  }
}

export async function isBookmarked(storySlug: string): Promise<boolean> {
  try {
    const { data } = await api.get(`/bookmarks/${storySlug}`);
    return Boolean(unwrap(data));
  } catch (err) {
    if (!isBackendUnavailable(err)) return false;
    return false;
  }
}

// ====== Reading progress ======

/** Ghi nhận tiến độ — chỉ tiến lên, backend là nguồn sự thật. Best-effort. */
export async function updateProgress(
  storyId: string,
  chapterNumber: number,
  chapterId?: string,
): Promise<void> {
  if (!isAuthenticated()) return;
  try {
    await api.put(`/reading-progress`, {
      storyId: storyId,
      chapterId: chapterId,
      chapterNumber: chapterNumber,
    });
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
