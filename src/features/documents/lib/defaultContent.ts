export const defaultContent = `# Welcome to MarkDocs!

## Getting Started

This is a powerful markdown editor with live preview. Start typing to see your changes in real-time!

### Features

- **Live Preview**: See your formatted content as you type
- **Split-Pane Layout**: Edit and preview side-by-side
- **Full-Page Preview**: View your document in full-screen mode
- **Syntax Highlighting**: Beautiful code blocks with syntax highlighting
- **Keyboard Shortcuts**:
  - \`Ctrl/Cmd + S\`: Save document
  - \`Ctrl/Cmd + B\`: Toggle bold
  - \`Ctrl/Cmd + I\`: Toggle italic

### Markdown Syntax

You can use all standard Markdown features:

#### Text Formatting

*Italic text* or _italic text_

**Bold text** or __bold text__

~~Strikethrough~~

#### Lists

Unordered list:
- Item 1
- Item 2
  - Nested item
  - Another nested item

Ordered list:
1. First item
2. Second item
3. Third item

#### Code

Inline code: \`const hello = "world"\`

Code block with syntax highlighting:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

#### Links and Images

[MarkDocs Source Code](https://github.com/giliannereyes/markdown-editor)

![Alt text](https://placehold.co/300x200)

#### Blockquotes

> This is a blockquote.
> It can span multiple lines.

#### Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

#### Horizontal Rule

---

### Start Creating!

Delete this content and start writing your own markdown documents. Happy writing!
`
