import sanitizeHtmlLib from "sanitize-html";

/**
 * Sanitize HTML content from Tiptap/rich-text editors.
 * Uses sanitize-html (pure Node.js, no DOM/jsdom dependency) so it works
 * reliably in Next.js server components and Vercel serverless functions.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "strong", "em", "u", "s", "del",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

/**
 * Strip all HTML tags from rich-text content, returning plain text.
 * Used for short previews (e.g. store cards) where Tiptap HTML would
 * otherwise render as literal tags.
 */
/**
 * True only for http(s) URLs. Guards href rendering against
 * javascript:/data: scheme XSS from user/admin-entered links.
 */
export function isHttpUrl(url: string | null | undefined): boolean {
  return !!url && /^https?:\/\//i.test(url.trim());
}

export function stripHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
