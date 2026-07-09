import type { StorySummary } from "@/features/stories/types";

/** Một mục trong tủ sách: truyện + tiến độ đọc gần nhất */
export interface BookmarkItem {
  storyCoverImageUrl: string | null;
  storyId: string;
  storySlug: string;
  storyStatus: "Publishing" | "Completed" | "Paused";
  storyTitle: string;
  totalChapters: number;
  lastChapterAt: string | null;
  lastReadChapter: ChapterProgressItem | null;
  authorName: string;
  storyCategories: Array<{ id: string; name: string; slug: string }>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  bookmarkedAt: string;
}

export interface ReadingProgress {
  chapterNumber: number;
  chapterTitle?: string;
  lastReadAt: string;
}

export type BookmarkToggleResult = {
  isBookmarked: boolean;
  storyId: string;
};

export type ChapterProgressItem = {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  lastReadAt: string;
};
