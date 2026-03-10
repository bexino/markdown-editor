declare module 'markdown-it' {
  export interface MarkdownToken {
    type: string
    tag: string
    nesting: number
    level: number
    content: string
    markup: string
    info: string
    map?: [number, number]
    children?: MarkdownToken[]
  }

  interface MarkdownItOptions {
    breaks?: boolean
    html?: boolean
    linkify?: boolean
    typographer?: boolean
    highlight?: (code: string, language: string) => string
  }

  export default class MarkdownIt {
    constructor(options?: MarkdownItOptions)
    parse(content: string, env: object): MarkdownToken[]
    render(content: string): string
  }
}
