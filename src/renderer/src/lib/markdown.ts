/**
 * Simple markdown-to-HTML converter for comment rendering.
 * Escapes HTML entities first, then applies markdown transformations.
 */
export function renderMarkdown(markdown: string): string {
  // Escape HTML entities first
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (```)
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="my-2 rounded bg-accent p-2 text-xs"><code>$1</code></pre>',
  )

  // Inline code (`)
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-accent px-1 py-0.5 text-xs">$1</code>',
  )

  // Bold (**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic (*)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
  )

  // Headings (# ## ###)
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-sm font-semibold mt-2">$1</h3>',
  )
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-base font-semibold mt-2">$1</h2>',
  )
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-lg font-bold mt-2">$1</h1>',
  )

  // Bullet lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p class="mt-2">')

  // Single newlines to <br>
  html = html.replace(/\n/g, '<br>')

  return `<p>${html}</p>`
}
