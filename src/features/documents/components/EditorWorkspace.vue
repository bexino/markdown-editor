<script setup lang="ts">
import { basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Compartment, EditorSelection, EditorState } from '@codemirror/state'
import { tags } from '@lezer/highlight'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import MarkdownPreview from '@/features/documents/components/MarkdownPreview.vue'
import SlashCommandMenu, {
  type SlashCommandItem,
} from '@/features/documents/components/SlashCommandMenu.vue'
import { theme } from '@/shared/services/theme'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  updateContent: [value: string]
}>()

type EditorTarget = 'mobile' | 'desktop'

const mobileEditorHost = ref<HTMLElement | null>(null)
const desktopEditorHost = ref<HTMLElement | null>(null)
const mobileEditorContainer = ref<HTMLElement | null>(null)
const desktopEditorContainer = ref<HTMLElement | null>(null)
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

const mobileThemeCompartment = new Compartment()
const desktopThemeCompartment = new Compartment()

let editorBadgeTimeout: number | undefined
let previewBadgeTimeout: number | undefined
let mobileEditorView: EditorView | null = null
let desktopEditorView: EditorView | null = null
let isSyncingEditors = false

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
  target: EditorTarget,
): void {
  const resolvedElement =
    element instanceof Element ? element : element && '$el' in element ? element.$el : null

  const host = resolvedElement instanceof HTMLElement ? resolvedElement : null

  if (target === 'mobile') {
    mobileEditorHost.value = host
    return
  }

  desktopEditorHost.value = host
}

function setEditorContainerRef(
  element:
    | Element
    | {
        $el?: Element
      }
    | null,
  target: EditorTarget,
): void {
  const resolvedElement =
    element instanceof Element ? element : element && '$el' in element ? element.$el : null

  const container = resolvedElement instanceof HTMLElement ? resolvedElement : null

  if (target === 'mobile') {
    mobileEditorContainer.value = container
    return
  }

  desktopEditorContainer.value = container
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

function getThemeExtension() {
  const highlightStyle = HighlightStyle.define([
    {
      tag: [tags.heading, tags.keyword],
      color: theme.value === 'dark' ? '#f7f7f8' : 'var(--color-foreground)',
      fontWeight: '700',
    },
    {
      tag: [tags.processingInstruction, tags.meta, tags.comment],
      color: theme.value === 'dark' ? '#9ca3af' : 'var(--color-muted-foreground)',
    },
    {
      tag: [tags.link, tags.url],
      color: theme.value === 'dark' ? '#c4b5fd' : 'var(--color-primary)',
    },
    {
      tag: [tags.string, tags.special(tags.string)],
      color: theme.value === 'dark' ? '#c7d2fe' : '#4338ca',
    },
    {
      tag: [tags.emphasis, tags.strong],
      color: theme.value === 'dark' ? '#e5e7eb' : 'var(--color-foreground)',
      fontWeight: '600',
    },
    {
      tag: [tags.monospace, tags.literal, tags.atom],
      color: theme.value === 'dark' ? '#93c5fd' : '#1d4ed8',
    },
    {
      tag: [tags.list, tags.quote],
      color: theme.value === 'dark' ? '#d1d5db' : 'var(--color-foreground)',
    },
  ])

  return [
    EditorView.theme(
      {
        '&': {
          height: '100%',
          backgroundColor: 'var(--color-editor-surface)',
          color: 'var(--color-foreground)',
        },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
          lineHeight: '1.75',
        },
        '.cm-content': {
          minHeight: '100%',
          padding: '1rem',
          fontSize: '0.875rem',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-cursor, .cm-dropCursor': {
          borderLeftColor: 'var(--color-foreground)',
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor:
            theme.value === 'dark'
              ? 'color-mix(in srgb, var(--color-accent) 70%, transparent)'
              : 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
        },
        '.cm-activeLine': {
          backgroundColor:
            theme.value === 'dark'
              ? 'color-mix(in srgb, var(--color-muted) 40%, transparent)'
              : 'transparent',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent',
        },
        '.cm-gutters': {
          display: 'none',
        },
        '.cm-placeholder': {
          color: 'var(--color-muted-foreground)',
        },
      },
      { dark: theme.value === 'dark' },
    ),
    syntaxHighlighting(highlightStyle, { fallback: true }),
  ]
}

function getEditorView(target: EditorTarget): EditorView | null {
  return target === 'mobile' ? mobileEditorView : desktopEditorView
}

function getActiveEditorTarget(): EditorTarget {
  if (mobileEditorView?.hasFocus) {
    return 'mobile'
  }

  if (desktopEditorView?.hasFocus) {
    return 'desktop'
  }

  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

function getActiveEditorView(): EditorView | null {
  return getEditorView(getActiveEditorTarget())
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
  const target = getActiveEditorTarget()
  const view = getEditorView(target)
  const container = target === 'mobile' ? mobileEditorContainer.value : desktopEditorContainer.value

  if (!view || !container) {
    return
  }

  const coords = view.coordsAtPos(cursorPosition)

  if (!coords) {
    return
  }

  const containerRect = container.getBoundingClientRect()
  const top = coords.bottom - containerRect.top + 10
  const left = Math.min(coords.left - containerRect.left, containerRect.width - 304)

  slashMenuPosition.value = {
    top: Math.max(16, top),
    left: Math.max(16, left),
  }
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
  getActiveEditorView()?.focus()
}

function insertMarkdown(before: string, after = ''): void {
  const view = getActiveEditorView()

  if (!view) {
    return
  }

  const selection = view.state.selection.main
  const selected = view.state.sliceDoc(selection.from, selection.to)

  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: `${before}${selected}${after}`,
    },
    selection: EditorSelection.range(
      selection.from + before.length,
      selected ? selection.to + before.length : selection.from + before.length,
    ),
    scrollIntoView: true,
  })

  view.focus()
}

function insertAtCursor(text: string): void {
  const view = getActiveEditorView()

  if (!view) {
    return
  }

  const selection = view.state.selection.main

  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: text,
    },
    selection: EditorSelection.cursor(selection.from + text.length),
    scrollIntoView: true,
  })

  view.focus()
}

function applySlashCommand(commandId: string): void {
  const view = getActiveEditorView()

  if (!view || slashStart.value === null) {
    return
  }

  const command = slashCommands.find((item) => item.id === commandId)

  if (!command) {
    return
  }

  const insertionStart = slashStart.value
  const cursorPosition = view.state.selection.main.head
  const line = view.state.doc.lineAt(cursorPosition)
  const replaceEnd = line.to

  view.dispatch({
    changes: {
      from: insertionStart,
      to: replaceEnd,
      insert: command.insert,
    },
    selection: EditorSelection.cursor(insertionStart + (command.cursorOffset ?? command.insert.length)),
    scrollIntoView: true,
  })

  closeSlashMenu()
  view.focus()
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

function handleEditorUpdate(update: ViewUpdateLike): void {
  if (!isSyncingEditors && update.docChanged) {
    updateContent(update.state.doc.toString())
  }

  if (update.focusChanged && update.view.hasFocus) {
    updateSlashMenu(update.state.doc.toString(), update.state.selection.main.head)
  }

  if (update.selectionSet || update.docChanged) {
    updateSlashMenu(update.state.doc.toString(), update.state.selection.main.head)
  }
}

function handleEditorScroll(target: EditorTarget): void {
  if (getActiveEditorTarget() !== target) {
    return
  }

  revealBadge('editor')
}

interface ViewUpdateLike {
  view: EditorView
  state: EditorState
  docChanged: boolean
  selectionSet: boolean
  focusChanged: boolean
}

function createEditorExtensions(target: EditorTarget, themeCompartment: Compartment) {
  return [
    basicSetup,
    markdown(),
    placeholder('Start writing your markdown here...'),
    EditorView.lineWrapping,
    keymap.of([]),
    themeCompartment.of(getThemeExtension()),
    EditorView.updateListener.of((update) => {
      handleEditorUpdate({
        view: update.view,
        state: update.state,
        docChanged: update.docChanged,
        selectionSet: update.selectionSet,
        focusChanged: update.focusChanged,
      })
    }),
    EditorView.domEventHandlers({
      keydown: (event) => {
        handleEditorKeydown(event)
        return false
      },
      focus: () => {
        const view = getEditorView(target)

        if (view) {
          updateSlashMenu(view.state.doc.toString(), view.state.selection.main.head)
        }

        return false
      },
      scroll: () => {
        handleEditorScroll(target)
        return false
      },
    }),
    EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: 'transparent',
      },
      '.cm-editor': {
        height: '100%',
      },
      '.cm-scroller': {
        height: '100%',
      },
    }),
  ]
}

function createEditor(target: EditorTarget): void {
  const host = target === 'mobile' ? mobileEditorHost.value : desktopEditorHost.value
  const themeCompartment = target === 'mobile' ? mobileThemeCompartment : desktopThemeCompartment

  if (!host || getEditorView(target)) {
    return
  }

  const view = new EditorView({
    state: EditorState.create({
      doc: props.content,
      extensions: createEditorExtensions(target, themeCompartment),
    }),
    parent: host,
  })

  if (target === 'mobile') {
    mobileEditorView = view
    return
  }

  desktopEditorView = view
}

function syncEditorContent(nextContent: string): void {
  const views = [mobileEditorView, desktopEditorView]

  isSyncingEditors = true

  for (const view of views) {
    if (!view) {
      continue
    }

    const currentContent = view.state.doc.toString()

    if (currentContent === nextContent) {
      continue
    }

    const selection = view.state.selection.main
    const nextCursor = Math.min(selection.head, nextContent.length)

    view.dispatch({
      changes: {
        from: 0,
        to: currentContent.length,
        insert: nextContent,
      },
      selection: EditorSelection.cursor(nextCursor),
    })
  }

  isSyncingEditors = false
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
  createEditor('mobile')
  createEditor('desktop')
  document.addEventListener('mousedown', handleDocumentPointerDown)
})

watch(
  () => props.content,
  (nextContent) => {
    syncEditorContent(nextContent)
  },
)

watch(theme, () => {
  mobileEditorView?.dispatch({
    effects: mobileThemeCompartment.reconfigure(getThemeExtension()),
  })
  desktopEditorView?.dispatch({
    effects: desktopThemeCompartment.reconfigure(getThemeExtension()),
  })
})

onBeforeUnmount(() => {
  isResizing.value = false

  mobileEditorView?.destroy()
  desktopEditorView?.destroy()
  mobileEditorView = null
  desktopEditorView = null

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
      <section
        :ref="(element) => setEditorContainerRef(element, 'mobile')"
        class="relative flex min-h-0 flex-1 flex-col border-b border-border"
      >
        <div
          class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-opacity duration-200"
          :class="showEditorBadge ? 'opacity-100' : 'opacity-0'"
        >
          Markdown
        </div>
        <div
          :ref="(element) => setTextareaRef(element, 'mobile')"
          class="min-h-[320px] flex-1"
          :style="{
            '--color-editor-surface':
              theme === 'dark' ? '#0e0e0e' : 'color-mix(in srgb, var(--color-muted) 10%, transparent)',
          }"
        ></div>
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
      <section
        :ref="(element) => setEditorContainerRef(element, 'desktop')"
        class="relative flex min-w-0 flex-col overflow-hidden"
      >
        <div
          class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-opacity duration-200"
          :class="showEditorBadge ? 'opacity-100' : 'opacity-0'"
        >
          Markdown
        </div>
        <div
          :ref="(element) => setTextareaRef(element, 'desktop')"
          class="h-full min-h-0 w-full flex-1"
          :style="{
            '--color-editor-surface':
              theme === 'dark' ? '#0e0e0e' : 'color-mix(in srgb, var(--color-muted) 10%, transparent)',
          }"
        ></div>
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

<style scoped>
:deep(.cm-editor) {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

:deep(.cm-focused) {
  outline: none;
}
</style>
