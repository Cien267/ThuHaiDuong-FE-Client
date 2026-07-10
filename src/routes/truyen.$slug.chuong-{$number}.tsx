import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { ChapterSummary, getChapter } from "@/features/stories/chapters";
import { chapterQuery, chaptersQuery, storyQuery } from "@/features/stories/api";
import { updateProgress } from "@/features/library/api";
import { sanitizeChapterHtml } from "@/features/reader/sanitize";
import {
  useReaderSettings,
  FONT_FAMILY_CLASS,
  THEME_CLASS,
  type ReaderSettings,
} from "@/features/reader/reader-settings";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Settings2, List, Home, ArrowUp, RefreshCw } from "lucide-react";
import {
  GlobalAffiliate,
  InChapterAffiliate,
  PopupAffiliate,
} from "@/features/affiliate/components";
import { trackChapterView, getSessionId } from "@/features/analytics/api";

export const Route = createFileRoute("/truyen/$slug/chuong-{$number}")({
  head: ({ params }) => {
    const ch = getChapter(params.slug, Number(params.number));
    const title = ch ? `${ch.title} - ${ch.storyTitle}` : "Đọc chương";
    return {
      meta: [
        { title: `${title} | Thu Hải Đường` },
        {
          name: "description",
          content: ch
            ? `${ch.storyTitle} — ${ch.title}. Đọc online miễn phí.`
            : "Đọc truyện online.",
        },
      ],
    };
  },
  notFoundComponent: NotFoundView,
  component: ChapterReaderPage,
});

function NotFoundView() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Không tìm thấy chương</h1>
      <Link to="/" className="text-primary underline">
        ← Về trang chủ
      </Link>
    </div>
  );
}

function ChapterReaderPage() {
  const { slug, number } = Route.useParams();
  const num = Number(number);
  const validNumber = Number.isFinite(num) && num >= 1;

  const navigate = useNavigate();
  const [settings, setSettings] = useReaderSettings();
  const storyQ = useQuery(storyQuery(slug));
  const storyId = storyQ.data?.id ?? "";

  const chapterQ = useQuery({
    ...chapterQuery(storyId ?? "", num),
    enabled: validNumber && !!storyId,
  });

  const chaptersQ = useQuery(chaptersQuery(storyId ?? ""));
  const chapters = chaptersQ.data ?? [];

  const chapter = chapterQ.data ?? null;

  const chapterId = chapter?.id ?? "";

  const sanitized = useMemo(() => (chapter ? sanitizeChapterHtml(chapter.content) : ""), [chapter]);

  // Ghi nhận tiến độ đọc (forward-only, best-effort) + tracking view
  useEffect(() => {
    if (chapter) void updateProgress(storyId, chapter.chapterNumber, chapter.id);
  }, [slug, chapter]);

  useEffect(() => {
    if (!chapter?.id || !storyId) return;

    void trackChapterView({
      chapterId: chapter.id,
      storyId,
      sessionId: getSessionId(),
    });
  }, [storyId, chapter?.id]);

  const goTo = (n: number | null) => {
    if (n == null) return;
    navigate({ to: "/truyen/$slug/chuong-{$number}", params: { slug, number: String(n) } });
    window.scrollTo({ top: 0 });
  };

  // Arrow keys: ← prev, → next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(chapter?.prevChapter?.chapterNumber ?? null);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(chapter?.nextChapter?.chapterNumber ?? null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!validNumber) return <NotFoundView />;

  if (chapterQ.isPending) {
    return (
      <div className={`min-h-screen ${THEME_CLASS[settings.theme]}`}>
        <main className="px-4 py-16">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="mx-auto h-8 w-2/3 animate-pulse rounded bg-muted/60" />
            <div className="mx-auto h-5 w-1/2 animate-pulse rounded bg-muted/50" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted/40" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (chapterQ.isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Không tải được chương</h1>
        <p className="mt-2 text-muted-foreground">{(chapterQ.error as Error)?.message}</p>
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="outline" onClick={() => chapterQ.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
          </Button>
          <Button asChild variant="secondary">
            <Link to="/truyen/$slug" params={{ slug }}>
              Về trang truyện
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!chapter) return <NotFoundView />;

  return (
    <div className={`min-h-screen transition-colors ${THEME_CLASS[settings.theme]}`}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button asChild variant="ghost" size="icon" aria-label="Trang chủ">
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
            <Link
              to="/truyen/$slug"
              params={{ slug }}
              className="truncate text-sm font-medium hover:underline"
            >
              {chapter.storyTitle}
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <ChapterListSheet
              storySlug={slug}
              chapters={chapters}
              isPending={chaptersQ.isPending}
              currentNumber={chapter.chapterNumber}
            />
            <ReaderSettingsPopover settings={settings} setSettings={setSettings} />
          </div>
        </div>
      </header>

      <GlobalAffiliate storyId={storyId} chapterId={chapterId} />

      {/* Content */}
      <main className="px-4 py-8">
        <article
          className={`mx-auto ${FONT_FAMILY_CLASS[settings.fontFamily]}`}
          style={{ maxWidth: `${settings.maxWidth}px` }}
        >
          <h1 className="mb-2 text-center text-2xl font-bold">{chapter.storyTitle}</h1>
          <h2 className="mb-8 text-center text-lg font-semibold opacity-80">{chapter.title}</h2>

          <NavRow
            prev={chapter?.prevChapter?.chapterNumber ?? null}
            next={chapter?.nextChapter?.chapterNumber ?? null}
            totalChapters={chapters.length}
            current={chapter.chapterNumber}
            onGo={goTo}
          />

          <div
            className="reader-content mt-8 space-y-5"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
            }}
            // sanitized by DOMPurify above
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />

          {/* Affiliate sau nội dung chương, TRƯỚC điều hướng prev/next */}
          <InChapterAffiliate storyId={storyId} chapterId={chapterId} />

          <div className="mt-10">
            <NavRow
              prev={chapter?.prevChapter?.chapterNumber ?? null}
              next={chapter?.nextChapter?.chapterNumber ?? null}
              totalChapters={chapters.length}
              current={chapter.chapterNumber}
              onGo={goTo}
            />
          </div>

          <p className="mt-6 text-center text-xs opacity-60">
            Mẹo: dùng phím ← / → để chuyển chương.
          </p>
        </article>
      </main>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-30 rounded-full shadow-lg"
        aria-label="Lên đầu trang"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>

      <PopupAffiliate storyId={storyId} chapterId={chapterId} />
    </div>
  );
}

function NavRow({
  prev,
  next,
  current,
  totalChapters,
  onGo,
}: {
  prev: number | null;
  next: number | null;
  current: number;
  totalChapters: number;
  onGo: (n: number | null) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={prev == null}
        onClick={() => onGo(prev)}
        className="px-2 sm:px-4"
      >
        <ChevronLeft className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Chương trước</span>
      </Button>
      <span className="text-xs opacity-70">
        {current} / {totalChapters}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={next == null}
        onClick={() => onGo(next)}
        className="px-2 sm:px-4"
      >
        <span className="hidden sm:inline">Chương sau</span>
        <ChevronRight className="h-4 w-4 sm:ml-1" />
      </Button>
    </div>
  );
}

function ChapterListSheet({
  storySlug,
  chapters,
  isPending,
  currentNumber,
}: {
  storySlug: string;
  chapters: ChapterSummary[];
  isPending: boolean;
  currentNumber: number;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Danh sách chương">
          <List className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Danh sách chương</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-6rem)] pr-3">
          {isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="h-9 animate-pulse rounded bg-muted/50" />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {chapters.map((c) => (
                <li key={c.chapterNumber}>
                  <Link
                    to="/truyen/$slug/chuong-{$number}"
                    params={{ slug: storySlug, number: String(c.chapterNumber) }}
                    className={`block rounded px-3 py-2 text-sm hover:bg-accent ${c.chapterNumber === currentNumber ? "bg-accent font-semibold" : ""}`}
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ReaderSettingsPopover({
  settings,
  setSettings,
}: {
  settings: ReaderSettings;
  setSettings: (s: ReaderSettings) => void;
}) {
  const update = <K extends keyof ReaderSettings>(k: K, v: ReaderSettings[K]) =>
    setSettings({ ...settings, [k]: v });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Tuỳ chỉnh đọc">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Cỡ chữ</span>
              <span className="text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <Slider
              min={14}
              max={28}
              step={1}
              value={[settings.fontSize]}
              onValueChange={([v]) => update("fontSize", v)}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Giãn dòng</span>
              <span className="text-muted-foreground">{settings.lineHeight.toFixed(1)}</span>
            </div>
            <Slider
              min={14}
              max={24}
              step={1}
              value={[Math.round(settings.lineHeight * 10)]}
              onValueChange={([v]) => update("lineHeight", v / 10)}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Bề rộng</span>
              <span className="text-muted-foreground">{settings.maxWidth}px</span>
            </div>
            <Slider
              min={560}
              max={1040}
              step={20}
              value={[settings.maxWidth]}
              onValueChange={([v]) => update("maxWidth", v)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">Phông chữ</label>
            <Select
              value={settings.fontFamily}
              onValueChange={(v) => update("fontFamily", v as ReaderSettings["fontFamily"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">Serif (mặc định)</SelectItem>
                <SelectItem value="sans">Sans-serif</SelectItem>
                <SelectItem value="noto">Noto Serif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm">Nền</label>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "sepia", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update("theme", t)}
                  className={`rounded-md border px-2 py-2 text-xs capitalize ${settings.theme === t ? "border-primary ring-1 ring-primary" : "border-border"} ${
                    t === "light"
                      ? "bg-white text-black"
                      : t === "sepia"
                        ? "bg-[#f4ecd8] text-[#3a2f1c]"
                        : "bg-[#1a1a1a] text-[#d4d4d4]"
                  }`}
                >
                  {t === "light" ? "Sáng" : t === "sepia" ? "Sepia" : "Tối"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
