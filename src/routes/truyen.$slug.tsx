import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { STORIES, STATUS_LABEL, formatViews } from "@/features/stories/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Eye, Bookmark } from "lucide-react";

export const Route = createFileRoute("/truyen/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Truyện ${params.slug} — Truyện Việt` },
      { name: "description", content: "Đọc truyện online miễn phí." },
    ],
  }),
  component: StoryDetailStub,
});

function StoryDetailStub() {
  const { slug } = Route.useParams();
  const story = STORIES.find(s => s.slug === slug) ?? STORIES[0];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <img src={story.coverImageUrl ?? ""} alt={story.title} className="h-auto w-full rounded-lg border border-border" />
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{story.title}</h1>
            <p className="mt-1 text-muted-foreground">Tác giả: {story.authorName}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {story.categories.map(c => (
                <Badge key={c.id} variant="secondary">{c.name}</Badge>
              ))}
              <Badge>{STATUS_LABEL[story.status]}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {formatViews(story.totalViews)}</span>
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {story.averageRating} ({story.ratingCount})</span>
              <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {story.totalChapters} chương</span>
            </div>
            <p className="mt-4 text-foreground/90">{story.description}</p>
            <div className="mt-6 flex gap-3">
              <Button><BookOpen className="mr-2 h-4 w-4" /> Đọc từ đầu</Button>
              <Button variant="outline"><Bookmark className="mr-2 h-4 w-4" /> Đánh dấu</Button>
            </div>
            <p className="mt-6 rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Chi tiết truyện, danh sách chương, đánh giá và bình luận sẽ được hoàn thiện ở bước tiếp theo. <Link to="/truyen" className="text-primary underline">← Quay lại danh sách</Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
