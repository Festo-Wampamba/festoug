import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content from Tiptap/rich-text editors.
 * Allows safe formatting tags while stripping scripts, event handlers, etc.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "strong", "em", "u", "s", "del",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "width", "height",
      "class",
    ],
    ALLOW_DATA_ATTR: false,
  });
}
