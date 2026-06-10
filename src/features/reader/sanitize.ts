import DOMPurify from "dompurify";

export function sanitizeChapterHtml(html: string): string {
  if (typeof window === "undefined") {
    // SSR: fall back to a conservative tag-strip; client will re-sanitize on hydrate.
    return html.replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, "")
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "i", "b", "h2", "h3", "h4", "blockquote", "ul", "ol", "li", "hr", "span"],
    ALLOWED_ATTR: ["class"],
  });
}
