declare module 'markdown-it' {
  interface MarkdownItOptions {
    breaks?: boolean
    html?: boolean
    linkify?: boolean
    typographer?: boolean
    highlight?: (code: string, language: string) => string
  }

  export default class MarkdownIt {
    constructor(options?: MarkdownItOptions)
    render(content: string): string
  }
}
