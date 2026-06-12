import type { StorySummary } from "@/features/stories/types";

/** Một mục trong tủ sách: truyện + tiến độ đọc gần nhất */
export interface BookmarkItem {
  story: StorySummary;
  /** Chương đã đọc gần nhất (null = mới đánh dấu, chưa đọc) */
  lastReadChapterNumber: number | null;
  lastReadChapterTitle?: string | null;
  lastReadAt: string | null;
  /** Chương mới nhất hiện có */
  latestChapterNumber: number | null;
  /** Thời điểm thêm vào tủ sách */
  createdAt: string;
}

export interface ReadingProgress {
  chapterNumber: number;
  chapterTitle?: string;
  lastReadAt: string;
}
