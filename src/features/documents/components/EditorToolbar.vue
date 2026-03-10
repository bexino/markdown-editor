<script setup lang="ts">
import EditorIcon from '@/features/documents/components/EditorIcon.vue'

type EditorIconName =
  | 'arrow-left'
  | 'save'
  | 'eye'
  | 'file-text'
  | 'heading-1'
  | 'heading-2'
  | 'bold'
  | 'italic'
  | 'code'
  | 'list'
  | 'list-ordered'
  | 'quote'
  | 'link'
  | 'image'
  | 'table'

interface ToolbarAction {
  id: string
  icon: EditorIconName
  label: string
  type: 'wrap' | 'insert'
  before?: string
  after?: string
  text?: string
  shortcut?: string
}

interface ToolbarGroup {
  id: string
  actions: ToolbarAction[]
}

const groups: ToolbarGroup[] = [
  {
    id: 'headings',
    actions: [
      { id: 'h1', icon: 'heading-1', label: 'Heading 1', type: 'insert', text: '# ' },
      { id: 'h2', icon: 'heading-2', label: 'Heading 2', type: 'insert', text: '## ' },
    ],
  },
  {
    id: 'formatting',
    actions: [
      {
        id: 'bold',
        icon: 'bold',
        label: 'Bold',
        type: 'wrap',
        before: '**',
        after: '**',
        shortcut: 'Ctrl+B',
      },
      {
        id: 'italic',
        icon: 'italic',
        label: 'Italic',
        type: 'wrap',
        before: '*',
        after: '*',
        shortcut: 'Ctrl+I',
      },
      { id: 'code', icon: 'code', label: 'Inline Code', type: 'wrap', before: '`', after: '`' },
    ],
  },
  {
    id: 'structure',
    actions: [
      { id: 'list', icon: 'list', label: 'Bullet List', type: 'insert', text: '- ' },
      {
        id: 'ordered-list',
        icon: 'list-ordered',
        label: 'Numbered List',
        type: 'insert',
        text: '1. ',
      },
      { id: 'quote', icon: 'quote', label: 'Quote', type: 'insert', text: '> ' },
    ],
  },
  {
    id: 'media',
    actions: [
      { id: 'link', icon: 'link', label: 'Link', type: 'wrap', before: '[', after: '](url)' },
      {
        id: 'image',
        icon: 'image',
        label: 'Image',
        type: 'insert',
        text: '![alt text](url)',
      },
      {
        id: 'table',
        icon: 'table',
        label: 'Table',
        type: 'insert',
        text: '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n',
      },
    ],
  },
]

const emit = defineEmits<{
  insert: [value: string]
  wrap: [value: { before: string; after: string }]
}>()

function triggerAction(action: ToolbarAction): void {
  if (action.type === 'insert' && action.text) {
    emit('insert', action.text)
    return
  }

  emit('wrap', { before: action.before ?? '', after: action.after ?? '' })
}
</script>

<template>
  <div class="border-b border-border bg-muted/30 px-4 py-2">
    <div class="flex items-center gap-1 overflow-x-auto">
      <template v-for="group in groups" :key="group.id">
        <button
          v-for="action in group.actions"
          :key="action.id"
          type="button"
          class="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-md px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          :title="action.shortcut ? `${action.label} (${action.shortcut})` : action.label"
          @click="triggerAction(action)"
        >
          <EditorIcon :name="action.icon" />
        </button>
        <div class="mx-1 h-6 w-px shrink-0 bg-border"></div>
      </template>
    </div>
  </div>
</template>
