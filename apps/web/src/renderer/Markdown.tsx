import type { ReactNode } from 'react'

/**
 * Tiny markdown subset renderer for clinic custom_text blocks:
 * #/##/### headings, "- " lists, paragraphs, **bold**, *italic*, [links](url).
 * Deliberately no raw HTML — clinic text is treated as untrusted input.
 */

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_RE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link) {
      return (
        <a key={i} href={link[2]} className="text-[color:var(--accent)] underline">
          {link[1]}
        </a>
      )
    }
    return part
  })
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string }

function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = []
  let list: string[] | null = null
  let paragraph: string[] = []

  const flush = () => {
    if (list) {
      blocks.push({ kind: 'list', items: list })
      list = null
    }
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }

  for (const raw of markdown.split('\n')) {
    const line = raw.trimEnd()
    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading?.[1] && heading[2] !== undefined) {
      flush()
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] })
    } else if (line.startsWith('- ')) {
      if (paragraph.length) flush()
      ;(list ??= []).push(line.slice(2))
    } else if (line.trim() === '') {
      flush()
    } else {
      if (list) flush()
      paragraph.push(line)
    }
  }
  flush()
  return blocks
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text)
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.kind === 'heading') {
          const cls =
            block.level === 1
              ? 'text-lg font-bold'
              : block.level === 2
                ? 'text-base font-bold'
                : 'text-sm font-bold'
          return (
            <div key={i} className={`${cls} text-slate-800`}>
              {renderInline(block.text)}
            </div>
          )
        }
        if (block.kind === 'list') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{renderInline(block.text)}</p>
      })}
    </div>
  )
}
