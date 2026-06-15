import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { affiliateLinksQuery, buildClickUrl, pickByPlacement } from "./api";
import type { AffiliateLink } from "./types";

interface Ctx {
  storyId?: string | null;
  chapterId?: string | null;
}

/** Anchor chuẩn cho mọi link affiliate: mở tab mới, rel an toàn, có nhãn quảng cáo */
function AdAnchor({
  link,
  chapterId,
  className,
  children,
  ariaLabel,
}: {
  link: AffiliateLink;
  chapterId?: string | null;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={buildClickUrl(link.redirectUrl, chapterId)}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      aria-label={ariaLabel ?? link.title}
      className={className}
    >
      {children}
    </a>
  );
}

function AdLabel({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400 ${className}`}
    >
      Tài trợ
    </span>
  );
}

/* ============================ IN-CHAPTER ============================ */
export function InChapterAffiliate({ storyId, chapterId }: Ctx) {
  const { data } = useQuery(affiliateLinksQuery({ storyId, chapterId }));
  const link = pickByPlacement(data, "in-chapter");
  if (!link) return null;

  return (
    <aside className="my-8 rounded-lg border border-border bg-card p-4 not-prose">
      <div className="mb-2 flex items-center justify-between">
        <AdLabel />
        <span className="text-[10px] opacity-60">Quảng cáo</span>
      </div>
      <AdAnchor link={link} chapterId={chapterId} className="block group">
        <div className="flex gap-4">
          {link.imageUrl && (
            <img
              src={link.imageUrl}
              alt=""
              loading="lazy"
              className="h-20 w-20 shrink-0 rounded object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-snug group-hover:text-primary">{link.title}</h3>
            {link.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{link.description}</p>
            )}
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
              {link.ctaText || "Tìm hiểu thêm"} <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </AdAnchor>
    </aside>
  );
}

/* ============================ SIDEBAR ============================ */
/** Chỉ hiển thị trên md+; mobile không có sidebar → ẩn hoàn toàn */
export function SidebarAffiliate({ storyId, chapterId }: Ctx) {
  const { data } = useQuery(affiliateLinksQuery({ storyId, chapterId }));
  const link = pickByPlacement(data, "sidebar");
  if (!link) return null;

  return (
    <aside className="hidden md:block rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <AdLabel />
      </div>
      <AdAnchor link={link} chapterId={chapterId} className="block group">
        {link.imageUrl && (
          <img
            src={link.imageUrl}
            alt=""
            loading="lazy"
            className="mb-2 aspect-video w-full rounded object-cover"
          />
        )}
        <h3 className="text-sm font-semibold leading-snug group-hover:text-primary">
          {link.title}
        </h3>
        {link.description && (
          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{link.description}</p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
          {link.ctaText || "Xem ngay"} <ExternalLink className="h-3 w-3" />
        </span>
      </AdAnchor>
    </aside>
  );
}

/* ============================ GLOBAL BANNER ============================ */
function dismissKey(id: string) {
  return `aff:dismiss:global:${id}`;
}

export function GlobalAffiliate({ storyId, chapterId }: Ctx) {
  const { data } = useQuery(affiliateLinksQuery({ storyId, chapterId }));
  const link = pickByPlacement(data, "global");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!link) return;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(dismissKey(link.id))) setDismissed(true);
    } catch {
      /* ignore */
    }
  }, [link]);

  if (!link || dismissed) return null;

  const close = () => {
    try {
      sessionStorage.setItem(dismissKey(link.id), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="border-b border-amber-400/30 bg-amber-50 dark:bg-amber-950/30">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2">
        <AdLabel className="shrink-0" />
        <AdAnchor
          link={link}
          chapterId={chapterId}
          className="flex min-w-0 flex-1 items-center gap-2 text-sm hover:underline"
        >
          <span className="truncate font-medium">{link.title}</span>
          {link.description && (
            <span className="hidden truncate text-muted-foreground sm:inline">
              — {link.description}
            </span>
          )}
        </AdAnchor>
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          aria-label="Đóng quảng cáo"
          className="h-7 w-7 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ============================ POPUP ============================ */
const POPUP_DELAY_MS = 30_000;
function popupShownKey(id: string) {
  return `aff:shown:popup:${id}`;
}

export function PopupAffiliate({ storyId, chapterId }: Ctx) {
  const { data } = useQuery(affiliateLinksQuery({ storyId, chapterId }));
  const link = pickByPlacement(data, "popup");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!link) return;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(popupShownKey(link.id))) return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(popupShownKey(link.id), "1");
      } catch {
        /* ignore */
      }
      setOpen(true);
    }, POPUP_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [link]);

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="px-5 pt-5">
          <AdLabel />
        </div>
        {link.imageUrl && (
          <img
            src={link.imageUrl}
            alt=""
            loading="lazy"
            className="mt-3 aspect-video w-full object-cover"
          />
        )}
        <div className="space-y-3 p-5">
          <DialogTitle className="text-lg">{link.title}</DialogTitle>
          {link.description ? (
            <DialogDescription>{link.description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{link.title}</DialogDescription>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Để sau
            </Button>
            <Button variant="greenShiny" asChild>
              <AdAnchor link={link} chapterId={chapterId}>
                {link.ctaText || "Tìm hiểu thêm"} <ExternalLink className="ml-1 h-4 w-4" />
              </AdAnchor>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
