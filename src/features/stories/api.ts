import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api, ApiRequestError, isBackendUnavailable } from "@/lib/api/client";
import type { StorySummary } from "./types";
import type { ChapterDetail, ChapterSummary } from "./chapters";
import { STORIES, filterStories } from "./mock-data";
import { getChapter, getChaptersForStory } from "./chapters";

// ====== Kiểu dữ liệu ======

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StoryListParams {
  keyword?: string;
  categorySlug?: string;
  country?: string;
  storyType?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

// ====== Fallback dữ liệu mẫu khi backend không chạy ======

let warnedFallback = false;
function warnFallback() {
  if (!warnedFallback) {
    console.warn(
      "[api] Không kết nối được backend (" +
        (import.meta.env.VITE_API_BASE_URL || "/api → http://localhost:5129") +
        ") — đang hiển thị dữ liệu mẫu.",
    );
    warnedFallback = true;
  }
}

// Chấp nhận cả mảng thuần lẫn envelope { items / data, totalCount / total, ... }
function normalizePaged<T>(data: unknown, page: number, pageSize: number): PagedResult<T> {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      page,
      pageSize,
      totalCount: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / pageSize)),
    };
  }
  const d = (data ?? {}) as Partial<PagedResult<T>> & { data?: T[]; total?: number };
  const items = d.items ?? d.data ?? [];
  const ps = d.pageSize ?? pageSize;
  const totalCount = d.totalCount ?? d.total ?? items.length;
  return {
    items,
    page: d.page ?? page,
    pageSize: ps,
    totalCount,
    totalPages: d.totalPages ?? Math.max(1, Math.ceil(totalCount / ps)),
  };
}

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null),
  );
}

// ====== API truyện ======

export async function fetchStories(params: StoryListParams): Promise<PagedResult<StorySummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  try {
    const { data } = await api.get("/stories", { params: cleanParams({ ...params, page, pageSize }) });
    return normalizePaged<StorySummary>(data, page, pageSize);
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
    warnFallback();
    const all = filterStories(params);
    return {
      items: all.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalCount: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
    };
  }
}

export async function fetchStory(slug: string): Promise<StorySummary | null> {
  try {
    const { data } = await api.get(`/stories/${slug}`);
    return data as StorySummary;
  } catch (err) {
    if (err instanceof ApiRequestError && err.statusCode === 404) return null;
    if (!isBackendUnavailable(err)) throw err;
    warnFallback();
    return STORIES.find(s => s.slug === slug) ?? null;
  }
}

export async function fetchChapters(storySlug: string): Promise<ChapterSummary[]> {
  try {
    const { data } = await api.get(`/stories/${storySlug}/chapters`, {
      params: { page: 1, pageSize: 10_000 },
    });
    return normalizePaged<ChapterSummary>(data, 1, 10_000).items;
  } catch (err) {
    if (err instanceof ApiRequestError && err.statusCode === 404) return [];
    if (!isBackendUnavailable(err)) throw err;
    warnFallback();
    return getChaptersForStory(storySlug);
  }
}

export async function fetchChapter(storySlug: string, number: number): Promise<ChapterDetail | null> {
  try {
    const { data } = await api.get(`/stories/${storySlug}/chapters/${number}`);
    return data as ChapterDetail;
  } catch (err) {
    if (err instanceof ApiRequestError && err.statusCode === 404) return null;
    if (!isBackendUnavailable(err)) throw err;
    warnFallback();
    return getChapter(storySlug, number);
  }
}

// ====== Query options (TanStack Query) ======

export const storiesQuery = (params: StoryListParams) =>
  queryOptions({
    queryKey: ["stories", params],
    queryFn: () => fetchStories(params),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

export const storyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["story", slug],
    queryFn: () => fetchStory(slug),
    staleTime: 60_000,
  });

export const chaptersQuery = (storySlug: string) =>
  queryOptions({
    queryKey: ["chapters", storySlug],
    queryFn: () => fetchChapters(storySlug),
    staleTime: 60_000,
  });

export const chapterQuery = (storySlug: string, number: number) =>
  queryOptions({
    queryKey: ["chapter", storySlug, number],
    queryFn: () => fetchChapter(storySlug, number),
    staleTime: 5 * 60_000,
  });
