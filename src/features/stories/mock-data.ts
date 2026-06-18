import type { StorySummary, CategoryNode } from "./types";

export const CATEGORIES: CategoryNode[] = [
  { id: "c1", name: "Ngôn tình", slug: "ngon-tinh" },
  { id: "c2", name: "Kiếm hiệp", slug: "kiem-hiep" },
  { id: "c3", name: "Tiên hiệp", slug: "tien-hiep" },
  { id: "c4", name: "Đô thị", slug: "do-thi" },
  { id: "c5", name: "Huyền huyễn", slug: "huyen-huyen" },
  { id: "c6", name: "Xuyên không", slug: "xuyen-khong" },
  { id: "c7", name: "Trinh thám", slug: "trinh-tham" },
  { id: "c8", name: "Quân sự", slug: "quan-su" },
  { id: "c9", name: "Lịch sử", slug: "lich-su" },
  { id: "c10", name: "Khoa huyễn", slug: "khoa-huyen" },
];

const cover = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/300/420`;

const titles = [
  "Đấu Phá Thương Khung",
  "Phàm Nhân Tu Tiên Truyện",
  "Tiên Nghịch",
  "Đế Bá",
  "Vũ Động Càn Khôn",
  "Thần Mộ",
  "Cực Phẩm Gia Đinh",
  "Trọng Sinh Chi Đô Thị Cuồng Tiên",
  "Ngạo Thế Đan Thần",
  "Đại Chúa Tể",
  "Hoàn Mỹ Thế Giới",
  "Già Thiên",
  "Thánh Khư",
  "Tuyệt Thế Võ Thần",
  "Linh Vũ Thiên Hạ",
  "Vô Thượng Sát Thần",
  "Ngã Dục Phong Thiên",
  "Tu La Vũ Thần",
  "Nhất Niệm Vĩnh Hằng",
  "Mãng Hoang Kỷ",
  "Yêu Thần Ký",
  "Trạch Thiên Ký",
  "Vạn Cổ Đệ Nhất Đế",
  "Đan Vũ Càn Khôn",
];

const authors = [
  "Thiên Tằm Thổ Đậu",
  "Vong Ngữ",
  "Nhĩ Căn",
  "Yếm Bút Tiêu Sinh",
  "Thần Đông",
  "Thần Cơ",
  "Cao Lâu Đại Hạ",
  "Cảnh Bạch",
  "Ngã Cật Tây Hồng Thị",
];

const descriptions = [
  "Một thiên tài tu luyện bị phế bỏ kinh mạch, nhờ kỳ ngộ mà nghịch thiên thay đổi vận mệnh, từng bước đi lên đỉnh cao võ đạo.",
  "Thiếu niên nghèo khó vô tình nhập môn tu tiên, dùng tư chất bình phàm mà vượt qua vô số thiên kiêu, đi đến tận cùng đại đạo.",
  "Trọng sinh trở về một đời trước, lần này hắn quyết không để người thân chịu khổ, ôm trọn mỹ nhân và bước lên đỉnh nhân sinh.",
  "Cổ địa khai mở, vạn tộc tranh phong. Thiếu niên ôm theo một mảnh thần bia, đạp lên xương trắng anh hùng để thành đế.",
  "Hệ thống ký sinh, đô thị tu chân. Từ một học sinh tầm thường, hắn trở thành chí tôn không thể đụng tới.",
];

export const STORIES: StorySummary[] = Array.from({ length: 48 }, (_, i) => {
  const title =
    titles[i % titles.length] + (i >= titles.length ? ` ${Math.floor(i / titles.length) + 1}` : "");
  const author = authors[i % authors.length];
  const cat1 = CATEGORIES[i % CATEGORIES.length];
  const cat2 = CATEGORIES[(i + 3) % CATEGORIES.length];
  const status: StorySummary["status"] =
    i % 7 === 0 ? "Completed" : i % 11 === 0 ? "Paused" : "Publishing";
  const country: StorySummary["country"] = (["CN", "CN", "CN", "VN", "KR", "JP"] as const)[i % 6];
  return {
    id: `s${i + 1}`,
    title,
    slug: `truyen-${i + 1}`,
    authorName: author,
    authorSlug: author.toLowerCase().replace(/\s+/g, "-"),
    coverImageUrl: cover(title + i),
    description: descriptions[i % descriptions.length],
    status,
    storyType: status === "Completed" ? "Completed" : "Serial",
    country,
    totalChapters: 100 + ((i * 37) % 2400),
    totalViews: 10_000 + ((i * 991_337) % 5_000_000),
    averageRating: Math.round((3.5 + ((i * 13) % 15) / 10) * 10) / 10,
    ratingCount: 50 + ((i * 17) % 5000),
    lastChapterAt: new Date(Date.now() - i * 3600_000 * 5).toISOString(),
    categories: [cat1, cat2].filter((v, idx, arr) => arr.findIndex((x) => x.id === v.id) === idx),
    tags: [],
  };
});

export function filterStories(opts: {
  keyword?: string;
  categorySlug?: string;
  country?: string;
  storyType?: string;
  sortBy?: string;
  sortDesc?: boolean;
}) {
  let items = STORIES.filter((s) => s.status !== "Paused");
  if (opts.keyword) {
    const k = opts.keyword.toLowerCase();
    items = items.filter(
      (s) => s.title.toLowerCase().includes(k) || s.authorName.toLowerCase().includes(k),
    );
  }
  if (opts.categorySlug) {
    items = items.filter((s) => s.categories.some((c) => c.slug === opts.categorySlug));
  }
  if (opts.country) items = items.filter((s) => s.country === opts.country);
  if (opts.storyType) items = items.filter((s) => s.storyType === opts.storyType);

  const desc = opts.sortDesc ?? true;
  const sortBy = opts.sortBy ?? "LastChapterAt";
  items = [...items].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "TotalViews":
        cmp = a.totalViews - b.totalViews;
        break;
      case "AverageRating":
        cmp = a.averageRating - b.averageRating;
        break;
      case "Title":
        cmp = a.title.localeCompare(b.title, "vi");
        break;
      case "LastChapterAt":
      default:
        cmp = (a.lastChapterAt ?? null).localeCompare(b.lastChapterAt ?? null);
    }
    return desc ? -cmp : cmp;
  });
  return items;
}

export function formatViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export const COUNTRY_LABEL: Record<string, string> = {
  CN: "Trung Quốc",
  VN: "Việt Nam",
  KR: "Hàn Quốc",
  JP: "Nhật Bản",
};

export const STATUS_LABEL: Record<StorySummary["status"], string> = {
  Publishing: "Đang ra",
  Completed: "Hoàn thành",
  Paused: "Tạm ngưng",
};
