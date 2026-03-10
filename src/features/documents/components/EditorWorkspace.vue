<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import MarkdownPreview from '@/features/documents/components/MarkdownPreview.vue'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  updateContent: [value: string]
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const isResizing = ref(false)
const leftPanelSize = ref(50)

const gridTemplateColumns = computed(() => {
  return `${leftPanelSize.value}% 10px minmax(0, 1fr)`
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

function updateContent(value: string): void {
  emit('updateContent', value)
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

defineExpose({
  focusEditor,
  insertAtCursor,
  insertMarkdown,
})

onBeforeUnmount(() => {
  isResizing.value = false
})
</script>

<template>
  <div class="flex-1 overflow-hidden">
    <div class="flex h-full flex-col md:hidden">
      <section class="flex min-h-0 flex-1 flex-col border-b border-border">
        <div class="border-b border-border bg-muted/30 px-4 py-2">
          <span class="text-sm font-medium">Markdown</span>
        </div>
        <textarea
          :ref="setTextareaRef"
          :value="content"
          class="min-h-[320px] flex-1 resize-none bg-background px-4 py-4 font-mono text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Start writing your markdown here..."
          @input="updateContent(($event.target as HTMLTextAreaElement).value)"
        />
      </section>

      <section class="flex min-h-0 flex-1 flex-col">
        <div class="border-b border-border bg-muted/30 px-4 py-2">
          <span class="text-sm font-medium">Preview</span>
        </div>
        <div class="flex-1 overflow-auto bg-muted/10 p-6">
          <div class="mx-auto max-w-3xl">
            <MarkdownPreview :content="content" />
          </div>
        </div>
      </section>
    </div>

    <div class="hidden h-full md:grid" :style="{ gridTemplateColumns }">
      <section class="flex min-w-0 flex-col overflow-hidden">
        <div class="border-b border-border bg-muted/30 px-4 py-2">
          <span class="text-sm font-medium">Markdown</span>
        </div>
        <textarea
          :ref="setTextareaRef"
          :value="content"
          class="h-full min-h-0 w-full flex-1 resize-none bg-background px-4 py-4 font-mono text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Start writing your markdown here..."
          @input="updateContent(($event.target as HTMLTextAreaElement).value)"
        />
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

      <section class="flex min-w-0 flex-col overflow-hidden">
        <div class="border-b border-border bg-muted/30 px-4 py-2">
          <span class="text-sm font-medium">Preview</span>
        </div>
        <div class="flex-1 overflow-auto bg-muted/10 p-6">
          <div class="mx-auto max-w-3xl">
            <MarkdownPreview :content="content" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
