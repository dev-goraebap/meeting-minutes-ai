/** First match of `query` in `text`, ~60 chars of surrounding context on each side. */
export function buildSnippet(
  text: string,
  query: string,
  radius = 60,
): string | null {
  if (!query.trim()) return null;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return null;

  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + text.slice(start, end) + suffix;
}
