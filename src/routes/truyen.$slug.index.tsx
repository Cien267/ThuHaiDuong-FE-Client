import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { STORIES, STATUS_LABEL, COUNTRY_LABEL, formatViews } from "@/features/stories/mock-data";
import { storyQuery, chaptersQuery } from "@/features/stories/api";
import { addBookmark, bookmarkStatusQuery, removeBookmark } from "@/features/library/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Star,
  Eye,
  Bookmark,
  BookmarkCheck,
  Clock,
  ListOrdered,
  Search,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { GlobalAffiliate, PopupAffiliate, SidebarAffiliate } from "@/features/affiliate/components";

export const Route = createFileRoute("/truyen/$slug/")({
  head: ({ params }) => {
    const story = STORIES.find((s) => s.slug === params.slug);
    const title = story ? `${story.title} — ${story.authorName}` : "Truyện";
    const desc = story?.description?.slice(0, 160) ?? "Đọc truyện online.";
    return {
      meta: [
        { title: `${title} | Thu Hải Đường` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(story?.coverImageUrl ? [{ property: "og:image", content: story.coverImageUrl }] : []),
      ],
    };
  },
  notFoundComponent: NotFoundView,
  component: StoryDetailPage,
});

const CHAPTERS_PER_PAGE = 50;

function NotFoundView() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="container mx-auto flex-1 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy truyện</h1>
        <Link to="/truyen" className="text-primary underline">
          ← Quay lại danh sách
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}

function StoryDetailPage() {
  const { slug } = Route.useParams();
  const storyQ = useQuery(storyQuery(slug));
  const chaptersQ = useQuery(chaptersQuery(slug));

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  if (storyQ.isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <div className="container mx-auto flex-1 px-4 py-8">
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="aspect-[5/7] w-full max-w-[220px] animate-pulse rounded-lg bg-muted/60" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted/60" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted/60" />
              <div className="h-24 animate-pulse rounded bg-muted/50" />
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (storyQ.isError) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <div className="container mx-auto flex-1 px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Không tải được truyện</h1>
          <p className="mt-2 text-muted-foreground">{(storyQ.error as Error)?.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => storyQ.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const story = storyQ.data;
  if (!story) return <NotFoundView />;

  const allChapters = chaptersQ.data ?? [];

  const filtered = keyword
    ? allChapters.filter(
        (c) =>
          c.title.toLowerCase().includes(keyword.toLowerCase()) ||
          String(c.number).includes(keyword),
      )
    : allChapters;
  const ordered = order === "asc" ? filtered : [...filtered].reverse();
  const totalPages = Math.max(1, Math.ceil(ordered.length / CHAPTERS_PER_PAGE));
  const pageItems = ordered.slice((page - 1) * CHAPTERS_PER_PAGE, page * CHAPTERS_PER_PAGE);

  const firstChapter = allChapters[0];
  const latestChapter = allChapters[allChapters.length - 1];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <GlobalAffiliate storyId={story.id} />
      <main className="flex-1">
        {/* Header section */}
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/20">
          <div className="container mx-auto px-4 py-8">
            <nav className="mb-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Trang chủ
              </Link>
              <span className="mx-2">/</span>
              <Link to="/truyen" className="hover:text-foreground">
                Truyện
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{story.title}</span>
            </nav>
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <img
                src={story.coverImageUrl ?? ""}
                alt={story.title}
                className="aspect-[5/7] w-full max-w-[220px] rounded-lg border border-border object-cover shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{story.title}</h1>
                <p className="mt-2 text-muted-foreground">
                  Tác giả: <span className="text-foreground">{story.authorName}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {story.categories.map((c) => (
                    <Badge key={c.id} variant="secondary">
                      {c.name}
                    </Badge>
                  ))}
                  <Badge variant="greenShiny">{STATUS_LABEL[story.status]}</Badge>
                  <Badge variant="outline">{COUNTRY_LABEL[story.country] ?? story.country}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat
                    icon={<Eye className="h-4 w-4" />}
                    label="Lượt đọc"
                    value={formatViews(story.totalViews)}
                  />
                  <Stat
                    icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                    label="Đánh giá"
                    value={`${story.averageRating} (${story.ratingCount})`}
                  />
                  <Stat
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Số chương"
                    value={String(story.totalChapters)}
                  />
                  <Stat
                    icon={<Clock className="h-4 w-4" />}
                    label="Cập nhật"
                    value={new Date(story.lastChapterAt ?? Date.now()).toLocaleDateString("vi-VN")}
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {firstChapter && (
                    <Button variant="greenShiny" asChild>
                      <Link
                        to="/truyen/$slug/chuong-{$number}"
                        params={{ slug: story.slug, number: String(firstChapter.number) }}
                      >
                        <BookOpen className="mr-2 h-4 w-4" /> Đọc từ đầu
                      </Link>
                    </Button>
                  )}
                  {latestChapter && (
                    <Button asChild variant="secondary">
                      <Link
                        to="/truyen/$slug/chuong-{$number}"
                        params={{ slug: story.slug, number: String(latestChapter.number) }}
                      >
                        Chương mới nhất <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <BookmarkButton slug={story.slug} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description + sidebar (sidebar chỉ hiển thị trên md+) */}
        <section className="container mx-auto grid gap-8 px-4 py-8 md:grid-cols-[1fr_280px]">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Giới thiệu</h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">
              {story.description}
            </p>
          </div>
          <SidebarAffiliate storyId={story.id} />
        </section>

        {/* Chapter list */}
        <section className="container mx-auto px-4 pb-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ListOrdered className="h-5 w-5" /> Danh sách chương ({allChapters.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm chương..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  className="w-56 pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
              >
                Sắp xếp: {order === "asc" ? "Cũ → Mới" : "Mới → Cũ"}
              </Button>
            </div>
          </div>

          {chaptersQ.isPending ? (
            <div className="grid gap-1 rounded-lg border border-border bg-card p-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="h-9 animate-pulse rounded bg-muted/50" />
              ))}
            </div>
          ) : chaptersQ.isError ? (
            <div className="rounded-lg border border-dashed border-destructive/50 bg-card py-10 text-center">
              <p className="text-muted-foreground">Không tải được danh sách chương.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => chaptersQ.refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
              </Button>
            </div>
          ) : (
            <div className="grid gap-1 rounded-lg border border-border bg-card p-2 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((ch) => (
                <Link
                  key={ch.number}
                  to="/truyen/$slug/chuong-{$number}"
                  params={{ slug: story.slug, number: String(ch.number) }}
                  className="flex items-center justify-between rounded px-3 py-2 text-sm hover:bg-accent"
                >
                  <span className="truncate">{ch.title}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {new Date(ch.publishedAt).toLocaleDateString("vi-VN")}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
      <PopupAffiliate storyId={story.id} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function BookmarkButton({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const { data: marked } = useQuery(bookmarkStatusQuery(slug));
  const mut = useMutation({
    mutationFn: () => (marked ? removeBookmark(slug) : addBookmark(slug)),
    onSuccess: () => {
      toast.success(marked ? "Đã xoá khỏi tủ sách" : "Đã thêm vào tủ sách");
      qc.invalidateQueries({ queryKey: ["bookmark", slug] });
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (e: Error) => toast.error(e.message || "Thao tác thất bại"),
  });
  return (
    <Button
      variant={marked ? "secondary" : "outline"}
      onClick={() => mut.mutate()}
      disabled={mut.isPending}
    >
      {marked ? (
        <>
          <BookmarkCheck className="mr-2 h-4 w-4" /> Đã đánh dấu
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" /> Đánh dấu
        </>
      )}
    </Button>
  );
}
