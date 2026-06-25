import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StoryCard } from "@/features/stories/components/StoryCard";
import { COUNTRY_LABEL } from "@/features/stories/mock-data";
import { storiesQuery, categoriesQuery, tagsQuery } from "@/features/stories/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, RefreshCw } from "lucide-react";
import { flattenCategories } from "@/features/stories/categories";

const searchSchema = z.object({
  keyword: fallback(z.string(), "").default(""),
  categorySlug: fallback(z.string(), "").default(""),
  country: fallback(z.string(), "").default(""),
  storyType: fallback(z.enum(["Serial", "Completed", ""]), "").default(""),
  sortBy: fallback(
    z.enum(["LastChapterAt", "TotalViews", "AverageRating", "Title"]),
    "LastChapterAt",
  ).default("LastChapterAt"),
  sortDesc: fallback(z.boolean(), true).default(true),
  page: fallback(z.number().int().min(1), 1).default(1),
});

const PAGE_SIZE = 12;

export const Route = createFileRoute("/truyen/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Danh sách truyện — Thu Hải Đường" },
      {
        name: "description",
        content:
          "Duyệt toàn bộ truyện theo thể loại, quốc gia, trạng thái. Lọc và sắp xếp theo ý thích.",
      },
    ],
    links: [{ rel: "canonical", href: "/truyen" }],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/truyen/" });

  const listQ = useQuery(
    storiesQuery({
      keyword: search.keyword || undefined,
      categorySlug: search.categorySlug || undefined,
      tagSlug: search.tagSlug || undefined,
      country: search.country || undefined,
      storyType: search.storyType || undefined,
      sortBy: search.sortBy,
      sortDesc: search.sortDesc,
      page: search.page,
      pageSize: PAGE_SIZE,
    }),
  );

  const categoriesQ = useQuery(categoriesQuery());
  const flatCategories = flattenCategories(categoriesQ.data ?? []);

  const tagsQ = useQuery(tagsQuery());
  const tags = tagsQ.data ?? [];

  const items = listQ.data?.items ?? [];
  const totalCount = listQ.data?.totalCount ?? 0;
  const totalPages = listQ.data?.totalPages ?? 1;
  const page = Math.min(search.page, totalPages);

  const setSearch = (updates: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...updates, page: 1 }) });

  const hasFilters = !!(
    search.keyword ||
    search.categorySlug ||
    search.country ||
    search.storyType
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <div className="container mx-auto flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Danh sách truyện</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {listQ.isPending ? (
              "Đang tải..."
            ) : (
              <>
                Tìm thấy <span className="font-medium text-foreground">{totalCount}</span> truyện
              </>
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Filters */}
          <aside className="space-y-5 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-20 lg:self-start">
            <div>
              <label className="mb-2 block text-sm font-semibold">Từ khóa</label>
              <Input
                defaultValue={search.keyword}
                placeholder="Tên truyện hoặc tác giả"
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    setSearch({ keyword: (e.target as HTMLInputElement).value });
                }}
              />
            </div>

            <FilterGroup label="Thể loại">
              <SelectChip
                active={!search.categorySlug}
                onClick={() => setSearch({ categorySlug: "" })}
              >
                Tất cả
              </SelectChip>
              {flatCategories.map((c) => (
                <SelectChip
                  key={c.id}
                  active={search.categorySlug === c.slug}
                  onClick={() => setSearch({ categorySlug: c.slug })}
                >
                  {c.name}
                </SelectChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Quốc gia">
              <SelectChip active={!search.country} onClick={() => setSearch({ country: "" })}>
                Tất cả
              </SelectChip>
              {Object.entries(COUNTRY_LABEL).map(([code, label]) => (
                <SelectChip
                  key={code}
                  active={search.country === code}
                  onClick={() => setSearch({ country: code })}
                >
                  {label}
                </SelectChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Trạng thái">
              <SelectChip active={!search.storyType} onClick={() => setSearch({ storyType: "" })}>
                Tất cả
              </SelectChip>
              <SelectChip
                active={search.storyType === "Serial"}
                onClick={() => setSearch({ storyType: "Serial" })}
              >
                Đang ra
              </SelectChip>
              <SelectChip
                active={search.storyType === "Completed"}
                onClick={() => setSearch({ storyType: "Completed" })}
              >
                Hoàn thành
              </SelectChip>
            </FilterGroup>

            <FilterGroup label="Thẻ">
              <SelectChip active={!search.tagSlug} onClick={() => setSearch({ tagSlug: "" })}>
                Tất cả
              </SelectChip>
              {tags.map((tag) => (
                <SelectChip
                  key={tag.id}
                  active={search.tagSlug === tag.slug}
                  onClick={() => setSearch({ tagSlug: tag.slug })}
                >
                  {tag.name}
                </SelectChip>
              ))}
            </FilterGroup>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() =>
                  navigate({
                    search: {
                      keyword: "",
                      categorySlug: "",
                      country: "",
                      storyType: "",
                      sortBy: "LastChapterAt",
                      sortDesc: true,
                      page: 1,
                    },
                  })
                }
              >
                <X className="mr-1 h-4 w-4" /> Xóa bộ lọc
              </Button>
            )}
          </aside>

          {/* Results */}
          <div>
            {/* Sort bar */}
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
              <span className="px-2 text-sm text-muted-foreground">Sắp xếp:</span>
              {[
                { v: "LastChapterAt", l: "Mới nhất" },
                { v: "TotalViews", l: "Lượt đọc" },
                { v: "AverageRating", l: "Đánh giá" },
                { v: "Title", l: "Tên A-Z" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() =>
                    setSearch({
                      sortBy: opt.v as typeof search.sortBy,
                      sortDesc: opt.v !== "Title",
                    })
                  }
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    search.sortBy === opt.v
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-accent"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>

            {listQ.isPending ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <div
                    key={i}
                    className="h-44 animate-pulse rounded-lg border border-border bg-muted/50"
                  />
                ))}
              </div>
            ) : listQ.isError ? (
              <div className="rounded-lg border border-dashed border-destructive/50 bg-card py-20 text-center">
                <p className="text-base text-muted-foreground">
                  Không tải được danh sách truyện. {(listQ.error as Error)?.message}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => listQ.refetch()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card py-20 text-center">
                <p className="text-base text-muted-foreground">
                  Không tìm thấy truyện nào phù hợp.
                </p>
              </div>
            ) : (
              <div className={`grid gap-4 sm:grid-cols-2 ${listQ.isFetching ? "opacity-70" : ""}`}>
                {items.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                <Link
                  to="/truyen"
                  search={(prev: typeof search) => ({ ...prev, page: Math.max(1, page - 1) })}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={page === 1}
                >
                  ← Trước
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 text-muted-foreground">…</span>
                      )}
                      <Link
                        to="/truyen"
                        search={(prev: typeof search) => ({ ...prev, page: p })}
                        className={`min-w-[40px] rounded-md px-3 py-2 text-center text-sm ${
                          p === page
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card hover:bg-accent"
                        }`}
                      >
                        {p}
                      </Link>
                    </span>
                  ))}
                <Link
                  to="/truyen"
                  search={(prev: typeof search) => ({
                    ...prev,
                    page: Math.min(totalPages, page + 1),
                  })}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={page === totalPages}
                >
                  Sau →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function SelectChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground/80 hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}
