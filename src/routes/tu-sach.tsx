import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, BookmarkX, Library, Clock, ChevronRight, RefreshCw, Inbox } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookmarksQuery, removeBookmark } from "@/features/library/api";
import { useAuthStore } from "@/features/auth/store";
import type { BookmarkItem } from "@/features/library/types";

export const Route = createFileRoute("/tu-sach")({
  head: () => ({
    meta: [
      { title: "Tủ sách của bạn — Thu Hải Đường" },
      {
        name: "description",
        content: "Danh sách truyện đã đánh dấu và tiếp tục đọc theo tiến độ.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const status = useAuthStore((s) => s.status);
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(bookmarksQuery());

  const items = data ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <Library className="h-6 w-6 text-primary" /> Tủ sách của bạn
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {status === "authenticated"
                ? "Truyện bạn đã đánh dấu, sắp xếp theo lần đọc gần nhất."
                : "Đang xem ở chế độ khách — tủ sách lưu trên thiết bị này. Đăng nhập để đồng bộ trên mọi thiết bị."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </header>

        {status !== "authenticated" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-card/50 p-4">
            <p className="text-sm text-muted-foreground">
              Đăng nhập để đồng bộ tủ sách & lịch sử đọc giữa các thiết bị.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/dang-nhap" search={{ redirect: "/tu-sach" }}>
                  Đăng nhập
                </Link>
              </Button>
              <Button variant="greenShiny" asChild size="sm">
                <Link to="/dang-ky">Đăng ký</Link>
              </Button>
            </div>
          </div>
        )}

        {isPending ? (
          <SkeletonGrid />
        ) : isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <BookmarkCard key={item.story.slug} item={item} />
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function BookmarkCard({ item }: { item: BookmarkItem }) {
  const qc = useQueryClient();
  const { story, lastReadChapterNumber, lastReadChapterTitle, lastReadAt, latestChapterNumber } =
    item;
  const total = latestChapterNumber ?? story.totalChapters ?? 0;
  const current = lastReadChapterNumber ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const nextChapter = lastReadChapterNumber
    ? Math.min(lastReadChapterNumber + 1, Math.max(total, lastReadChapterNumber + 1))
    : 1;
  const hasUnread = total > 0 && current < total;

  const removeMut = useMutation({
    mutationFn: () => removeBookmark(story.slug),
    onSuccess: () => {
      toast.success("Đã xoá khỏi tủ sách");
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      qc.invalidateQueries({ queryKey: ["bookmark", story.slug] });
    },
    onError: (e: Error) => toast.error(e.message || "Xoá thất bại"),
  });

  return (
    <li className="flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50">
      <Link
        to="/truyen/$slug"
        params={{ slug: story.slug }}
        className="shrink-0"
        aria-label={story.title}
      >
        <img
          src={story.coverImageUrl ?? ""}
          alt={story.title}
          className="h-32 w-24 rounded-md border border-border object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          to="/truyen/$slug"
          params={{ slug: story.slug }}
          className="line-clamp-2 font-semibold leading-snug hover:text-primary"
        >
          {story.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{story.authorName}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {story.categories.slice(0, 2).map((c) => (
            <Badge key={c.id} variant="secondary" className="text-[10px]">
              {c.name}
            </Badge>
          ))}
          {hasUnread && <Badge className="text-[10px]">+{total - current} chương mới</Badge>}
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          {lastReadChapterNumber ? (
            <span className="line-clamp-1">
              Đang đọc:{" "}
              <span className="text-foreground">
                Chương {lastReadChapterNumber}
                {lastReadChapterTitle ? ` — ${lastReadChapterTitle}` : ""}
              </span>
            </span>
          ) : (
            <span>Chưa bắt đầu đọc</span>
          )}
          {lastReadAt && (
            <span className="mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {new Date(lastReadAt).toLocaleString("vi-VN")}
            </span>
          )}
        </div>

        {total > 0 && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {current}/{total} chương ({pct}%)
            </p>
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-3">
          <Button variant="greenShiny" asChild size="sm" className="flex-1">
            <Link
              to="/truyen/$slug/chuong-{$number}"
              params={{ slug: story.slug, number: String(nextChapter) }}
            >
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {lastReadChapterNumber ? "Tiếp tục đọc" : "Đọc từ đầu"}
              <ChevronRight className="ml-auto h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeMut.mutate()}
            disabled={removeMut.isPending}
            aria-label="Xoá khỏi tủ sách"
          >
            <BookmarkX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-border bg-card p-3">
          <div className="h-32 w-24 animate-pulse rounded-md bg-muted/60" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted/50" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted/40" />
            <div className="h-8 w-full animate-pulse rounded bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
      <Inbox className="mx-auto h-10 w-10 text-muted-foreground/60" />
      <h2 className="mt-3 text-lg font-semibold">Tủ sách trống</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Khám phá truyện và bấm <span className="font-medium text-foreground">"Đánh dấu"</span> để
        thêm vào tủ sách.
      </p>
      <Button variant="greenShiny" asChild className="mt-4">
        <Link to="/truyen">Khám phá truyện</Link>
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-destructive/50 bg-card py-12 text-center">
      <p className="text-sm text-muted-foreground">Không tải được tủ sách. {message}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
      </Button>
    </div>
  );
}
