import hljs from 'highlight.js'
import MarkdownIt, { type MarkdownToken } from 'markdown-it'

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
  return markdown.render(content)
}

export function parseMarkdown(content: string): MarkdownToken[] {
  return markdown.parse(content, {})
}
