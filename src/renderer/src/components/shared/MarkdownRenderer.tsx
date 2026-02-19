import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/** Escape HTML entities to prevent XSS */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Parse inline markdown (bold, italic, code, links) into React nodes */
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // Combined regex for inline patterns: code, bold, italic, links
  const inlineRegex = /`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = inlineRegex.exec(text)) !== null) {
    // Push any text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1] !== undefined) {
      // Inline code
      nodes.push(
        <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {match[1]}
        </code>,
      )
    } else if (match[2] !== undefined) {
      // Bold
      nodes.push(
        <strong key={key++} className="font-bold">
          {match[2]}
        </strong>,
      )
    } else if (match[3] !== undefined) {
      // Italic
      nodes.push(
        <em key={key++} className="italic">
          {match[3]}
        </em>,
      )
    } else if (match[4] !== undefined && match[5] !== undefined) {
      // Link
      nodes.push(
        <a
          key={key++}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {match[4]}
        </a>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Push any remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

interface Block {
  type:
    | 'heading'
    | 'code-block'
    | 'blockquote'
    | 'unordered-list'
    | 'ordered-list'
    | 'hr'
    | 'paragraph'
  level?: number // for headings (1-6)
  language?: string // for code blocks
  content: string // raw text content
  items?: string[] // for lists
}

/** Parse markdown string into an array of blocks */
function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block (fenced)
    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      // Skip closing ```
      if (i < lines.length) i++
      blocks.push({
        type: 'code-block',
        language,
        content: codeLines.join('\n'),
      })
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      blocks.push({ type: 'hr', content: '' })
      i++
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
      })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      blocks.push({
        type: 'blockquote',
        content: quoteLines.join('\n'),
      })
      continue
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, ''))
        i++
      }
      blocks.push({
        type: 'unordered-list',
        content: '',
        items,
      })
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({
        type: 'ordered-list',
        content: '',
        items,
      })
      continue
    }

    // Empty line — skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('> ') &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^[-*+]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^\*\*\*+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: paraLines.join('\n'),
      })
    }
  }

  return blocks
}

/** Render a heading element at the appropriate level */
function renderHeading(block: Block, key: number): ReactNode {
  const children = parseInline(escapeHtml(block.content))
  const level = block.level ?? 1

  const headingClasses: Record<number, string> = {
    1: 'text-xl font-bold text-foreground mt-4 mb-2',
    2: 'text-lg font-bold text-foreground mt-3 mb-2',
    3: 'text-base font-bold text-foreground mt-3 mb-1',
    4: 'text-sm font-bold text-foreground mt-2 mb-1',
    5: 'text-sm font-semibold text-foreground mt-2 mb-1',
    6: 'text-xs font-semibold text-foreground mt-2 mb-1',
  }

  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return (
    <Tag key={key} className={headingClasses[level]}>
      {children}
    </Tag>
  )
}

/** Render a single block into a React element */
function renderBlock(block: Block, key: number): ReactNode {
  switch (block.type) {
    case 'heading':
      return renderHeading(block, key)

    case 'code-block':
      return (
        <pre key={key} className="bg-muted rounded-md p-3 font-mono text-sm my-2 overflow-x-auto">
          <code>{block.content}</code>
        </pre>
      )

    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-l-4 border-border pl-4 italic text-muted-foreground my-2"
        >
          {parseInline(escapeHtml(block.content))}
        </blockquote>
      )

    case 'unordered-list':
      return (
        <ul key={key} className="list-disc ml-6 my-2 space-y-1 text-sm text-foreground">
          {block.items?.map((item, idx) => (
            <li key={idx}>{parseInline(escapeHtml(item))}</li>
          ))}
        </ul>
      )

    case 'ordered-list':
      return (
        <ol key={key} className="list-decimal ml-6 my-2 space-y-1 text-sm text-foreground">
          {block.items?.map((item, idx) => (
            <li key={idx}>{parseInline(escapeHtml(item))}</li>
          ))}
        </ol>
      )

    case 'hr':
      return <hr key={key} className="border-border my-4" />

    case 'paragraph':
    default:
      return (
        <p key={key} className="text-sm text-foreground my-1.5">
          {parseInline(escapeHtml(block.content))}
        </p>
      )
  }
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps): JSX.Element {
  if (!content || content.trim() === '') {
    return <p className="text-sm text-muted-foreground">No content.</p>
  }

  const blocks = parseBlocks(content)

  return <div className={cn('markdown-content', className)}>{blocks.map(renderBlock)}</div>
}
