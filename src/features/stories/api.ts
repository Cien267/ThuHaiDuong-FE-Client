import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api, ApiRequestError, isBackendUnavailable } from "@/lib/api/client";
import type { StorySummary, Rating, CreateRatingInput, Comment, CreateCommentInput } from "./types";
import type { ChapterDetail, ChapterSummary } from "./chapters";
import type { CategorySummary } from "./categories";
import { STORIES, filterStories } from "./mock-data";
import { getChapter, getChaptersForStory } from "./chapters";
import { TagSummary } from "./tags";

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
  tagSlug?: string;
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
    const { data } = await api.get("/stories", {
      params: cleanParams({ ...params, page, pageSize }),
    });
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

export async function fetchCategories(): Promise<CategorySummary[]> {
  try {
    const { data } = await api.get("/categories/tree");
    return data as CategorySummary[];
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
    warnFallback();
    return [];
  }
}

export async function fetchTags(): Promise<TagSummary[]> {
  try {
    const { data } = await api.get("/tags");
    return data as TagSummary[];
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
    warnFallback();
    return [];
  }
}

export async function fetchStory(slug: string): Promise<StorySummary | null> {
  try {
    const { data } = await api.get(`/stories/${slug}`);
    return data as StorySummary;
  } catch (err) {
    if (isBackendUnavailable(err)) {
      warnFallback();
      return STORIES.find((s) => s.slug === slug) ?? null;
    }
    if (err instanceof ApiRequestError && err.statusCode === 404) return null;
    throw err;
  }
}

export async function fetchChapters(storyId: string): Promise<ChapterSummary[]> {
  try {
    const { data } = await api.get(`/stories/${storyId}/chapters`, {
      params: { page: 1, pageSize: 10_000 },
    });
    return normalizePaged<ChapterSummary>(data, 1, 10_000).items;
  } catch (err) {
    if (isBackendUnavailable(err)) {
      warnFallback();
      return getChaptersForStory(storyId);
    }
    if (err instanceof ApiRequestError && err.statusCode === 404) return [];
    throw err;
  }
}

export async function fetchComments(
  storyId: string,
  chapterId?: string | null,
): Promise<PagedResult<Comment>> {
  try {
    const { data } = await api.get(`/comments`, {
      params: { storyId, chapterId },
    });
    return normalizePaged<Comment>(data, 1, 10_000);
  } catch (err) {
    if (isBackendUnavailable(err)) {
      warnFallback();
      return { items: [], page: 1, pageSize: 10_000, totalCount: 0, totalPages: 1 };
    }
    throw err;
  }
}

export async function fetchChapter(storyId: string, number: number): Promise<ChapterDetail | null> {
  try {
    const { data } = await api.get(`/stories/${storyId}/chapters/${number}`);
    return data as ChapterDetail;
  } catch (err) {
    if (isBackendUnavailable(err)) {
      warnFallback();
      return getChapter(storyId, number);
    }
    if (err instanceof ApiRequestError && err.statusCode === 404) return null;
    throw err;
  }
}

export function createRating(input: CreateRatingInput) {
  return api.post<Rating>("/ratings", input);
}

export function createComment(input: CreateCommentInput) {
  return api.post<Comment>("/comments", input);
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

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

export const tagsQuery = () =>
  queryOptions({
    queryKey: ["tags"],
    queryFn: () => fetchTags(),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

export const chaptersQuery = (storyId: string) =>
  queryOptions({
    queryKey: ["chapters", storyId],
    queryFn: () => fetchChapters(storyId),
    staleTime: 60_000,
  });

export const chapterQuery = (storyId: string, number: number) =>
  queryOptions({
    queryKey: ["chapter", storyId, number],
    queryFn: () => fetchChapter(storyId, number),
    staleTime: 5 * 60_000,
  });

export const commentsQuery = (storyId: string, chapterId?: string | null) =>
  queryOptions({
    queryKey: ["comments", storyId, chapterId ?? "story"],
    queryFn: () => fetchComments(storyId, chapterId),
    staleTime: 60_000,
  });
