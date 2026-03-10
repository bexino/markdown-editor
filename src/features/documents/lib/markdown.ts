import hljs from 'highlight.js'
import MarkdownIt, { type MarkdownToken } from 'markdown-it'

export interface MarkdownHeading {
  id: string
  level: number
  text: string
}

const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  typographer: true,
  highlight(code: string, language: string) {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    }

    return hljs.highlightAuto(code).value
  },
})

export function renderMarkdown(content: string): string {
  const rendered = markdown.render(content)
  const headings = extractMarkdownHeadings(content)
  let headingIndex = 0

  return rendered.replace(/<h([1-6])>/g, (_, level: string) => {
    const heading = headings[headingIndex]
    headingIndex += 1

    if (!heading) {
      return `<h${level}>`
    }

    return `<h${level} id="${heading.id}">`
  })
}

export function parseMarkdown(content: string): MarkdownToken[] {
  return markdown.parse(content, {})
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*_~[\]()!]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const tokens = parseMarkdown(content)
  const slugCounts = new Map<string, number>()
  const headings: MarkdownHeading[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (!token || token.type !== 'heading_open') {
      continue
    }

    const inlineToken = tokens[index + 1]

    if (!inlineToken) {
      continue
    }

    const text = (inlineToken.children ?? [])
      .map((child) => child.content ?? '')
      .join('')
      .trim()

    if (!text) {
      continue
    }

    const baseSlug = slugifyHeading(text) || 'section'
    const count = slugCounts.get(baseSlug) ?? 0
    slugCounts.set(baseSlug, count + 1)

    headings.push({
      id: count === 0 ? baseSlug : `${baseSlug}-${count + 1}`,
      level: Number.parseInt(token.tag.replace('h', ''), 10) || 1,
      text,
    })
  }

  return headings
}
