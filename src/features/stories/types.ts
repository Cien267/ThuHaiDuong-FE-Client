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
