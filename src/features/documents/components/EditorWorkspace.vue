<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import MarkdownPreview from '@/features/documents/components/MarkdownPreview.vue'
import SlashCommandMenu, {
  type SlashCommandItem,
} from '@/features/documents/components/SlashCommandMenu.vue'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  updateContent: [value: string]
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const mobilePreview = ref<HTMLElement | null>(null)
const desktopPreview = ref<HTMLElement | null>(null)
const slashMenuRoot = ref<HTMLElement | null>(null)
const isResizing = ref(false)
const leftPanelSize = ref(50)
const showEditorBadge = ref(false)
const showPreviewBadge = ref(false)
const slashQuery = ref('')
const slashStart = ref<number | null>(null)
const selectedSlashIndex = ref(0)
const slashMenuPosition = ref({
  top: 24,
  left: 24,
})

let editorBadgeTimeout: number | undefined
let previewBadgeTimeout: number | undefined

interface SlashCommandDefinition extends SlashCommandItem {
  aliases: string[]
  insert: string
  cursorOffset?: number
}

const slashCommands: SlashCommandDefinition[] = [
  {
    id: 'heading-1',
    title: 'Heading 1',
    description: 'Insert a top-level heading',
    aliases: ['h1', 'heading', 'title'],
    insert: '# ',
  },
  {
    id: 'heading-2',
    title: 'Heading 2',
    description: 'Insert a section heading',
    aliases: ['h2', 'section'],
    insert: '## ',
  },
  {
    id: 'heading-3',
    title: 'Heading 3',
    description: 'Insert a sub-section heading',
    aliases: ['h3', 'subsection'],
    insert: '### ',
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    description: 'Start an unordered list',
    aliases: ['list', 'bullet', 'ul'],
    insert: '- ',
  },
  {
    id: 'numbered-list',
    title: 'Numbered List',
    description: 'Start an ordered list',
    aliases: ['numbered', 'ordered', 'ol'],
    insert: '1. ',
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Insert a blockquote',
    aliases: ['quote', 'blockquote'],
    insert: '> ',
  },
  {
    id: 'code-block',
    title: 'Code Block',
    description: 'Insert a fenced code block',
    aliases: ['code', 'snippet'],
    insert: '```ts\n\n```\n',
    cursorOffset: 6,
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Insert a markdown table',
    aliases: ['table', 'grid'],
    insert: '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n',
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Insert a horizontal rule',
    aliases: ['divider', 'hr', 'rule'],
    insert: '---\n',
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Insert an image reference',
    aliases: ['image', 'img'],
    insert: '![alt text](url)',
    cursorOffset: 2,
  },
  {
    id: 'link',
    title: 'Link',
    description: 'Insert a markdown link',
    aliases: ['link', 'url'],
    insert: '[link text](url)',
    cursorOffset: 1,
  },
]

const gridTemplateColumns = computed(() => {
  return `${leftPanelSize.value}% 10px minmax(0, 1fr)`
})

const filteredSlashCommands = computed(() => {
  const query = slashQuery.value.trim().toLowerCase()

  if (!query) {
    return slashCommands
  }

  return slashCommands.filter((command) => {
    return (
      command.title.toLowerCase().includes(query) ||
      command.aliases.some((alias) => alias.includes(query))
    )
  })
})

const showSlashMenu = computed(() => {
  return slashStart.value !== null && filteredSlashCommands.value.length > 0
})

function setTextareaRef(
  element:
    | Element
    | {
        $el?: Element
      }
    | null,
): void {
  const resolvedElement =
    element instanceof Element ? element : element && '$el' in element ? element.$el : null

  textarea.value = resolvedElement instanceof HTMLTextAreaElement ? resolvedElement : null
}

function setPreviewRef(
  element:
    | Element
    | {
        $el?: Element
      }
    | null,
  target: 'mobile' | 'desktop',
): void {
  const resolvedElement =
    element instanceof Element ? element : element && '$el' in element ? element.$el : null

  const previewElement = resolvedElement instanceof HTMLElement ? resolvedElement : null

  if (target === 'mobile') {
    mobilePreview.value = previewElement
    return
  }

  desktopPreview.value = previewElement
}

function setSlashMenuRef(
  element:
    | Element
    | {
        $el?: Element
      }
    | null,
): void {
  const resolvedElement =
    element instanceof Element ? element : element && '$el' in element ? element.$el : null

  slashMenuRoot.value = resolvedElement instanceof HTMLElement ? resolvedElement : null
}

function revealBadge(target: 'editor' | 'preview'): void {
  if (target === 'editor') {
    showEditorBadge.value = true

    if (editorBadgeTimeout) {
      window.clearTimeout(editorBadgeTimeout)
    }

    editorBadgeTimeout = window.setTimeout(() => {
      showEditorBadge.value = false
    }, 1200)

    return
  }

  showPreviewBadge.value = true

  if (previewBadgeTimeout) {
    window.clearTimeout(previewBadgeTimeout)
  }

  previewBadgeTimeout = window.setTimeout(() => {
    showPreviewBadge.value = false
  }, 1200)
}

function updateContent(value: string): void {
  emit('updateContent', value)
}

function closeSlashMenu(): void {
  slashQuery.value = ''
  slashStart.value = null
  selectedSlashIndex.value = 0
}

function handleDocumentPointerDown(event: MouseEvent): void {
  if (!showSlashMenu.value || !slashMenuRoot.value) {
    return
  }

  if (!slashMenuRoot.value.contains(event.target as Node)) {
    closeSlashMenu()
  }
}

function updateSlashMenu(value: string, cursorPosition: number): void {
  const lineStart = value.lastIndexOf('\n', Math.max(cursorPosition - 1, 0)) + 1
  const lineUntilCursor = value.slice(lineStart, cursorPosition)
  const slashMatch = lineUntilCursor.match(/^\/([a-z0-9-]*)$/i)

  if (!slashMatch) {
    closeSlashMenu()
    return
  }

  slashStart.value = lineStart
  slashQuery.value = slashMatch[1] ?? ''
  selectedSlashIndex.value = 0
  updateSlashMenuPosition(cursorPosition)
}

function updateSlashMenuPosition(cursorPosition: number): void {
  const element = textarea.value

  if (!element) {
    return
  }

  const mirror = document.createElement('div')
  const styles = window.getComputedStyle(element)
  const properties = [
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize',
    'whiteSpace',
  ] as const

  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.pointerEvents = 'none'
  mirror.style.top = '0'
  mirror.style.left = '0'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.wordWrap = 'break-word'

  for (const property of properties) {
    ;(mirror.style as CSSStyleDeclaration & Record<string, string>)[property] = (
      styles as CSSStyleDeclaration & Record<string, string>
    )[property] ?? ''
  }

  mirror.textContent = element.value.slice(0, cursorPosition)

  const marker = document.createElement('span')
  marker.textContent = '\u200b'
  mirror.appendChild(marker)
  document.body.appendChild(mirror)

  const lineHeight = Number.parseFloat(styles.lineHeight) || 20
  const top =
    marker.offsetTop - element.scrollTop + lineHeight + 10
  const left =
    Math.min(marker.offsetLeft - element.scrollLeft, element.clientWidth - 304)

  slashMenuPosition.value = {
    top: Math.max(16, top),
    left: Math.max(16, left),
  }

  mirror.remove()
}

function handleEditorInput(event: Event): void {
  const element = event.target as HTMLTextAreaElement
  updateContent(element.value)
  updateSlashMenu(element.value, element.selectionStart)
}

function startResize(event: MouseEvent): void {
  if (window.innerWidth < 768) {
    return
  }

  isResizing.value = true
  const root = (event.currentTarget as HTMLElement).parentElement

  if (!root) {
    return
  }

  const bounds = root.getBoundingClientRect()

  const handlePointerMove = (moveEvent: MouseEvent) => {
    const offset = moveEvent.clientX - bounds.left
    const percent = (offset / bounds.width) * 100
    leftPanelSize.value = Math.min(70, Math.max(30, percent))
  }

  const stopResize = () => {
    isResizing.value = false
    window.removeEventListener('mousemove', handlePointerMove)
    window.removeEventListener('mouseup', stopResize)
  }

  window.addEventListener('mousemove', handlePointerMove)
  window.addEventListener('mouseup', stopResize)
}

function focusEditor(): void {
  textarea.value?.focus()
}

function insertMarkdown(before: string, after = ''): void {
  const element = textarea.value

  if (!element) {
    return
  }

  const start = element.selectionStart
  const end = element.selectionEnd
  const selected = props.content.slice(start, end)
  const nextValue =
    props.content.slice(0, start) + before + selected + after + props.content.slice(end)

  emit('updateContent', nextValue)

  window.requestAnimationFrame(() => {
    focusEditor()
    const selectionStart = start + before.length
    const selectionEnd = selected ? end + before.length : selectionStart
    element.setSelectionRange(selectionStart, selectionEnd)
  })
}

function insertAtCursor(text: string): void {
  const element = textarea.value

  if (!element) {
    return
  }

  const start = element.selectionStart
  const nextValue = props.content.slice(0, start) + text + props.content.slice(start)

  emit('updateContent', nextValue)

  window.requestAnimationFrame(() => {
    focusEditor()
    const position = start + text.length
    element.setSelectionRange(position, position)
  })
}

function applySlashCommand(commandId: string): void {
  const element = textarea.value

  if (!element || slashStart.value === null) {
    return
  }

  const command = slashCommands.find((item) => item.id === commandId)

  if (!command) {
    return
  }

  const insertionStart = slashStart.value
  const cursorPosition = element.selectionStart
  const lineEnd = props.content.indexOf('\n', cursorPosition)
  const replaceEnd = lineEnd === -1 ? props.content.length : lineEnd
  const nextValue =
    props.content.slice(0, insertionStart) + command.insert + props.content.slice(replaceEnd)

  emit('updateContent', nextValue)
  closeSlashMenu()

  window.requestAnimationFrame(() => {
    focusEditor()
    const nextCursor = insertionStart + (command.cursorOffset ?? command.insert.length)
    element.setSelectionRange(nextCursor, nextCursor)
  })
}

function handleEditorKeydown(event: KeyboardEvent): void {
  if (!showSlashMenu.value) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedSlashIndex.value = (selectedSlashIndex.value + 1) % filteredSlashCommands.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedSlashIndex.value =
      (selectedSlashIndex.value - 1 + filteredSlashCommands.value.length) %
      filteredSlashCommands.value.length
    return
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    const selectedCommand = filteredSlashCommands.value[selectedSlashIndex.value]

    if (selectedCommand) {
      applySlashCommand(selectedCommand.id)
    }

    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeSlashMenu()
  }
}

function scrollToHeading(id: string): void {
  const previewRoot =
    window.innerWidth >= 768 ? desktopPreview.value ?? mobilePreview.value : mobilePreview.value

  if (!previewRoot) {
    return
  }

  const heading = previewRoot.querySelector<HTMLElement>(`#${CSS.escape(id)}`)

  if (!heading) {
    return
  }

  heading.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

defineExpose({
  focusEditor,
  insertAtCursor,
  insertMarkdown,
  scrollToHeading,
})

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  isResizing.value = false

  document.removeEventListener('mousedown', handleDocumentPointerDown)

  if (editorBadgeTimeout) {
    window.clearTimeout(editorBadgeTimeout)
  }

  if (previewBadgeTimeout) {
    window.clearTimeout(previewBadgeTimeout)
  }
})
</script>

<template>
  <div class="flex-1 overflow-hidden">
    <div class="flex h-full flex-col md:hidden">
      <section class="relative flex min-h-0 flex-1 flex-col border-b border-border">
        <div
          class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-opacity duration-200"
          :class="showEditorBadge ? 'opacity-100' : 'opacity-0'"
        >
          Markdown
        </div>
        <textarea
          :ref="setTextareaRef"
          :value="content"
          class="min-h-[320px] flex-1 resize-none bg-background px-4 py-4 font-mono text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Start writing your markdown here..."
          @input="handleEditorInput"
          @keydown="handleEditorKeydown"
          @scroll="revealBadge('editor')"
        />
        <div v-if="showSlashMenu" :ref="setSlashMenuRef">
          <SlashCommandMenu
            :commands="filteredSlashCommands"
            :selected-index="selectedSlashIndex"
            :top="slashMenuPosition.top"
            :left="slashMenuPosition.left"
            @select="applySlashCommand"
          />
        </div>
      </section>

      <section class="relative flex min-h-0 flex-1 flex-col">
        <div
          class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-opacity duration-200"
          :class="showPreviewBadge ? 'opacity-100' : 'opacity-0'"
        >
          Preview
        </div>
        <div
          :ref="(element) => setPreviewRef(element, 'mobile')"
          class="flex-1 overflow-auto bg-muted/10 p-6"
          @scroll="revealBadge('preview')"
        >
          <div class="mx-auto max-w-3xl">
            <MarkdownPreview :content="content" />
          </div>
        </div>
      </section>
    </div>

    <div class="hidden h-full md:grid" :style="{ gridTemplateColumns }">
      <section class="relative flex min-w-0 flex-col overflow-hidden">
        <div
          class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-opacity duration-200"
          :class="showEditorBadge ? 'opacity-100' : 'opacity-0'"
        >
          Markdown
        </div>
        <textarea
          :ref="setTextareaRef"
          :value="content"
          class="h-full min-h-0 w-full flex-1 resize-none bg-background px-4 py-4 font-mono text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Start writing your markdown here..."
          @input="handleEditorInput"
          @keydown="handleEditorKeydown"
          @scroll="revealBadge('editor')"
        />
        <div v-if="showSlashMenu" :ref="setSlashMenuRef">
          <SlashCommandMenu
            :commands="filteredSlashCommands"
            :selected-index="selectedSlashIndex"
            :top="slashMenuPosition.top"
            :left="slashMenuPosition.left"
            @select="applySlashCommand"
          />
        </div>
      </section>

      <div
        class="group flex cursor-col-resize items-center justify-center bg-muted/40 transition-colors hover:bg-accent"
        :class="{ 'bg-accent': isResizing }"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor panels"
        @mousedown.prevent="startResize"
      >
        <div class="flex h-10 w-1 items-center justify-center rounded-full bg-border transition-colors group-hover:bg-foreground/30"></div>
      </div>

      <section class="relative flex min-w-0 flex-col overflow-hidden">
        <div
          class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-opacity duration-200"
          :class="showPreviewBadge ? 'opacity-100' : 'opacity-0'"
        >
          Preview
        </div>
        <div
          :ref="(element) => setPreviewRef(element, 'desktop')"
          class="flex-1 overflow-auto bg-muted/10 p-6"
          @scroll="revealBadge('preview')"
        >
          <div class="mx-auto max-w-3xl">
            <MarkdownPreview :content="content" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
