import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Star,
  MessageCircle,
  Send,
  RefreshCw,
  Reply,
  ThumbsUp,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createRating, createComment, commentsQuery } from "@/features/stories/api";
import type { Rating, Comment } from "@/features/stories/types";
import { useAuthStore } from "@/features/auth/store";

interface StoryReviewsProps {
  storyId: string;
  storySlug: string;
  averageRating: number;
  ratingCount: number;
}

export function StoryReviews({
  storyId,
  storySlug,
  averageRating,
  ratingCount,
}: StoryReviewsProps) {
  return (
    <section className="container mx-auto px-4 pb-12 space-y-8">
      <RatingBlock
        storyId={storyId}
        storySlug={storySlug}
        averageRating={averageRating}
        ratingCount={ratingCount}
      />
      <CommentBlock storyId={storyId} />
    </section>
  );
}

/* ---------------- Rating ---------------- */

function RatingBlock({
  storyId,
  storySlug,
  averageRating,
  ratingCount,
}: {
  storyId: string;
  storySlug: string;
  averageRating: number;
  ratingCount: number;
}) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [hoverStar, setHoverStar] = useState(0);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  const submitMut = useMutation({
    mutationFn: () => createRating({ storyId, score, comment: comment || undefined }),
    onSuccess: () => {
      toast.success("Đã gửi đánh giá");
      setScore(0);
      setComment("");
      qc.invalidateQueries({ queryKey: ["ratings", storyId] });
      qc.invalidateQueries({ queryKey: ["story", storySlug] });
    },
    onError: (e: Error) => toast.error(e.message || "Gửi đánh giá thất bại"),
  });

  return (
    <div className="bg-card">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Star className="h-5 w-5" /> Đánh giá ({ratingCount})
      </h2>
      {user ? (
        <div>
          <div className="mb-3 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1;
              const active = (hoverStar || score) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  onMouseEnter={() => setHoverStar(value)}
                  onMouseLeave={() => setHoverStar(0)}
                  aria-label={`${value} sao`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <Button
            variant="greenShiny"
            disabled={score === 0 || submitMut.isPending}
            onClick={() => submitMut.mutate()}
          >
            <Send className="mr-2 h-4 w-4" /> Gửi đánh giá
          </Button>
        </div>
      ) : (
        <p className="mb-8 rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Đăng nhập để đánh giá truyện này.
        </p>
      )}
    </div>
  );
}

/* ---------------- Comment ---------------- */

function CommentBlock({ storyId }: { storyId: string }) {
  const commentsQ = useQuery(commentsQuery(storyId));
  const comments = commentsQ.data?.items ?? [];

  return (
    <div className="bg-card">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <MessageCircle className="h-5 w-5" /> Bình luận ({comments.length})
      </h2>

      <CommentForm storyId={storyId} />

      {commentsQ.isPending ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted/50" />
          ))}
        </div>
      ) : commentsQ.isError ? (
        <div className="mt-6 rounded-md border border-dashed border-destructive/50 py-8 text-center">
          <p className="text-muted-foreground">Không tải được bình luận.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => commentsQ.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-6 py-6 text-center text-sm text-muted-foreground">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {comments
            .filter((c) => !c.parentCommentId && !c.isHidden)
            .map((c) => (
              <CommentItem key={c.id} comment={c} storyId={storyId} />
            ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  storyId,
  parentCommentId,
  onDone,
}: {
  storyId: string;
  parentCommentId?: string;
  onDone?: () => void;
}) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      createComment({
        storyId,
        parentCommentId,
        content,
        guestName: user ? undefined : guestName,
        guestEmail: user ? undefined : guestEmail,
      }),
    onSuccess: () => {
      toast.success(parentCommentId ? "Đã trả lời bình luận" : "Đã gửi bình luận");
      setContent("");
      setGuestName("");
      setGuestEmail("");
      qc.invalidateQueries({ queryKey: ["comments", storyId] });
      onDone?.();
    },
    onError: (e: Error) => toast.error(e.message || "Gửi bình luận thất bại"),
  });

  return (
    <div className={parentCommentId ? "mt-3" : ""}>
      {!user && (
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Tên của bạn"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            maxLength={100}
          />
          <Input
            placeholder="Email (không bắt buộc)"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            maxLength={256}
          />
        </div>
      )}
      <Textarea
        placeholder={parentCommentId ? "Viết trả lời..." : "Viết bình luận..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mb-3 min-h-[70px]"
        maxLength={5000}
      />
      <div className="flex gap-2">
        <Button
          size={parentCommentId ? "sm" : "default"}
          variant="greenShiny"
          disabled={!content.trim() || (!user && !guestName.trim()) || mut.isPending}
          onClick={() => mut.mutate()}
        >
          <Send className="mr-2 h-4 w-4" /> Gửi
        </Button>
        {parentCommentId && (
          <Button size="sm" variant="outline" onClick={onDone}>
            Huỷ
          </Button>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, storyId }: { comment: Comment; storyId: string }) {
  const [replying, setReplying] = useState(false);
  const name = comment.author.isGuest
    ? comment.author.guestName || "Khách"
    : comment.author.userName;

  return (
    <div className="border-b border-border pb-5 last:border-0 last:pb-0">
      <div className="flex gap-3">
        {comment.author.avatar ? (
          <img
            src={comment.author.avatar}
            alt={name ?? ""}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{name}</span>
            {comment.author.isGuest && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Khách
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{comment.content}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" /> {comment.likeCount}
            </span>
            <button
              className="flex items-center gap-1 hover:text-foreground"
              onClick={() => setReplying((v) => !v)}
            >
              <Reply className="h-3.5 w-3.5" /> Trả lời
            </button>
          </div>

          {replying && (
            <CommentForm
              storyId={storyId}
              parentCommentId={comment.id}
              onDone={() => setReplying(false)}
            />
          )}

          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
              {comment.replies
                .filter((r) => !r.isHidden)
                .map((r) => (
                  <CommentItem key={r.id} comment={r} storyId={storyId} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
