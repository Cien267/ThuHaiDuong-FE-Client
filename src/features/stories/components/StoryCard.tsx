import { Link } from "@tanstack/react-router";
import { Eye, Star, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatViews, STATUS_LABEL } from "../mock-data";
import type { StorySummary } from "../types";

export function StoryCard({ story }: { story: StorySummary }) {
  return (
    <Link
      to="/truyen/$slug"
      params={{ slug: story.slug }}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-emerald-500/40 hover:shadow-md"
    >
      <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {story.coverImageUrl && (
          <img
            src={story.coverImageUrl}
            alt={story.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
          {story.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{story.authorName}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{story.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" /> {formatViews(story.totalViews)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {story.averageRating}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {story.totalChapters}
          </span>
          <Badge
            variant={story.status === "Completed" ? "secondary" : "default"}
            className="ml-auto text-[10px]"
          >
            {STATUS_LABEL[story.status]}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

export function StoryCardCompact({ story, rank }: { story: StorySummary; rank?: number }) {
  return (
    <Link
      to="/truyen/$slug"
      params={{ slug: story.slug }}
      className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
    >
      {rank !== undefined && (
        <span
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold ${
            rank <= 3 ? "bg-orange-400 text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {rank}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
          {story.title}
        </p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{story.authorName}</p>
      </div>
      <span className="flex-shrink-0 text-xs text-muted-foreground">
        {formatViews(story.totalViews)}
      </span>
    </Link>
  );
}
