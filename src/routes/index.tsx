import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Sparkles, Trophy, Clock } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StoryCard, StoryCardCompact } from "@/features/stories/components/StoryCard";
import { CATEGORIES } from "@/features/stories/mock-data";
import { storiesQuery } from "@/features/stories/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Truyện Việt — Đọc truyện online ngôn tình, kiếm hiệp, tiên hiệp" },
      {
        name: "description",
        content:
          "Đọc truyện online miễn phí: ngôn tình, kiếm hiệp, tiên hiệp, đô thị, huyền huyễn. Cập nhật chương mới mỗi ngày.",
      },
      { property: "og:title", content: "Truyện Việt — Đọc truyện online" },
      {
        property: "og:description",
        content: "Nền tảng đọc truyện online với hàng nghìn bộ truyện đa dạng thể loại.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const hotQ = useQuery(storiesQuery({ sortBy: "TotalViews", sortDesc: true, page: 1, pageSize: 6 }));
  const newestQ = useQuery(storiesQuery({ sortBy: "LastChapterAt", sortDesc: true, page: 1, pageSize: 8 }));
  const completedQ = useQuery(storiesQuery({ storyType: "Completed", page: 1, pageSize: 6 }));
  const topQ = useQuery(storiesQuery({ sortBy: "TotalViews", sortDesc: true, page: 1, pageSize: 10 }));
  const serialQ = useQuery(storiesQuery({ storyType: "Serial", page: 1, pageSize: 1 }));

  const hot = hotQ.data?.items ?? [];
  const newest = newestQ.data?.items ?? [];
  const completed = completedQ.data?.items ?? [];
  const topRank = topQ.data?.items ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Đắm chìm trong thế giới truyện
            </h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Hàng nghìn bộ truyện ngôn tình, kiếm hiệp, tiên hiệp và đô thị. Đọc miễn phí, cập nhật liên tục.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/truyen">Khám phá ngay</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/truyen" search={{ sortBy: "TotalViews", sortDesc: true }}>
                  Bảng xếp hạng
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto flex flex-wrap gap-2 px-4 py-4">
          {CATEGORIES.map(c => (
            <Link
              key={c.id}
              to="/truyen"
              search={{ categorySlug: c.slug }}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {/* Hot */}
            <Section title="Truyện hot" icon={<Flame className="h-5 w-5 text-orange-500" />} href="/truyen" hrefSearch={{ sortBy: "TotalViews", sortDesc: true }}>
              {hotQ.isPending ? (
                <CardSkeletons count={6} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {hot.map(s => <StoryCard key={s.id} story={s} />)}
                </div>
              )}
            </Section>

            {/* Newest */}
            <Section title="Mới cập nhật" icon={<Clock className="h-5 w-5 text-blue-500" />} href="/truyen" hrefSearch={{ sortBy: "LastChapterAt", sortDesc: true }}>
              {newestQ.isPending ? (
                <CardSkeletons count={8} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {newest.map(s => <StoryCard key={s.id} story={s} />)}
                </div>
              )}
            </Section>

            {/* Completed */}
            <Section title="Truyện hoàn thành" icon={<Sparkles className="h-5 w-5 text-emerald-500" />} href="/truyen" hrefSearch={{ storyType: "Completed" }}>
              {completedQ.isPending ? (
                <CardSkeletons count={6} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {completed.map(s => <StoryCard key={s.id} story={s} />)}
                </div>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold">Top lượt đọc</h2>
              </div>
              <div className="p-2">
                {topQ.isPending ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded-md bg-muted/60" />
                    ))}
                  </div>
                ) : (
                  topRank.map((s, i) => (
                    <StoryCardCompact key={s.id} story={s} rank={i + 1} />
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-base font-bold">Thống kê</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Tổng truyện</dt><dd className="font-medium">{(topQ.data?.totalCount ?? 0).toLocaleString("vi-VN")}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Thể loại</dt><dd className="font-medium">{CATEGORIES.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Đang ra</dt><dd className="font-medium">{(serialQ.data?.totalCount ?? 0).toLocaleString("vi-VN")}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function CardSkeletons({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-lg border border-border bg-muted/50" />
      ))}
    </div>
  );
}

function Section({
  title,
  icon,
  href,
  hrefSearch,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  hrefSearch?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          {icon} {title}
        </h2>
        <Link
          to={href as "/truyen"}
          search={hrefSearch as never}
          className="text-sm text-primary hover:underline"
        >
          Xem tất cả →
        </Link>
      </div>
      {children}
    </section>
  );
}
