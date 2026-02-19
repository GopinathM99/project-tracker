import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/cn'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Bold, Italic, Code, Link, List } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
  id?: string
}

type Tab = 'write' | 'preview'

/**
 * Insert or wrap selected text in a textarea with markdown syntax.
 * Returns the new value and the new cursor selection range.
 */
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  const selected = text.slice(start, end)

  const insertion = selected || placeholder
  const newText = text.slice(0, start) + before + insertion + after + text.slice(end)

  // Position cursor around the inserted/wrapped text
  const newStart = start + before.length
  const newEnd = newStart + insertion.length

  return { value: newText, selectionStart: newStart, selectionEnd: newEnd }
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
  id,
}: MarkdownEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyFormat = useCallback(
    (before: string, after: string, placeholderText: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const result = wrapSelection(textarea, before, after, placeholderText)
      onChange(result.value)

      // Restore focus and selection after React re-renders
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
      })
    },
    [onChange],
  )

  const handleBold = useCallback(() => applyFormat('**', '**', 'bold text'), [applyFormat])
  const handleItalic = useCallback(() => applyFormat('*', '*', 'italic text'), [applyFormat])
  const handleCode = useCallback(() => applyFormat('`', '`', 'code'), [applyFormat])
  const handleLink = useCallback(
    () => applyFormat('[', '](url)', 'link text'),
    [applyFormat],
  )
  const handleList = useCallback(
    () => applyFormat('- ', '', 'list item'),
    [applyFormat],
  )

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', onClick: handleBold },
    { icon: Italic, label: 'Italic', onClick: handleItalic },
    { icon: Code, label: 'Code', onClick: handleCode },
    { icon: Link, label: 'Link', onClick: handleLink },
    { icon: List, label: 'List', onClick: handleList },
  ]

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Tab bar + toolbar */}
      <div className="flex items-center justify-between border-b border-input px-1">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'write'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'preview'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Preview
          </button>
        </div>

        {/* Toolbar (only shown in write mode) */}
        {activeTab === 'write' && (
          <div className="flex items-center gap-0.5">
            {toolbarButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                title={btn.label}
                onClick={btn.onClick}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <btn.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          className="w-full resize-y bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      ) : (
        <div className="min-h-[80px] px-3 py-2">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview.</p>
          )}
        </div>
      )}

      {/* Character count */}
      {maxLength !== undefined && (
        <div className="border-t border-input px-3 py-1 text-right">
          <span
            className={cn(
              'text-xs',
              value.length > maxLength * 0.9
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
          >
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}
