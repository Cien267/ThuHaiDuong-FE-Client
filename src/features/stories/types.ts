export interface StorySummary {
  id: string;
  title: string;
  slug: string;
  authorName: string;
  authorSlug: string;
  coverImageUrl: string | null;
  description: string;
  status: "Publishing" | "Completed" | "Paused";
  storyType: "Serial" | "Completed";
  country: "CN" | "VN" | "KR" | "JP";
  totalChapters: number;
  totalViews: number;
  averageRating: number;
  ratingCount: number;
  lastChapterAt: string | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
}

export interface Rating {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  score: number; // 1-5
  comment?: string | null;
  createdAt: string;
}

export interface CreateRatingInput {
  storyId: string;
  score: number;
  comment?: string;
}

export interface CommentAuthorInfo {
  userId?: string | null;
  userName?: string | null;
  avatar?: string | null;
  guestName?: string | null;
  isGuest: boolean;
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId?: string | null;
  parentCommentId?: string | null;
  content: string;
  likeCount: number;
  isHidden: boolean;
  author: CommentAuthorInfo;
  replies: Comment[];
  createdAt: string;
}

export interface CreateCommentInput {
  storyId: string;
  chapterId?: string | null;
  parentCommentId?: string | null;
  content: string;
  guestName?: string;
  guestEmail?: string;
}
