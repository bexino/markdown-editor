<script setup lang="ts">
import { computed, ref } from 'vue'

import DocumentOutlineItem, {
  type OutlineHeadingNode,
} from '@/features/documents/components/DocumentOutlineItem.vue'
import EditorIcon from '@/features/documents/components/EditorIcon.vue'
import type { MarkdownHeading } from '@/features/documents/lib/markdown'

const emit = defineEmits<{
  toggle: []
  select: [id: string]
}>()

const isDocumentExpanded = ref(true)
const props = defineProps<{
  documentTitle: string
  headings: MarkdownHeading[]
  isOpen: boolean
}>()

const headingTree = computed<OutlineHeadingNode[]>(() => {
  const roots: OutlineHeadingNode[] = []
  const stack: OutlineHeadingNode[] = []

  for (const heading of props.headings) {
    const node: OutlineHeadingNode = {
      heading,
      children: [],
    }

    while (stack.length > 0 && stack[stack.length - 1]!.heading.level >= heading.level) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }

    stack.push(node)
  }

  return roots
})
</script>

<template>
  <aside
    class="hidden border-r border-border bg-card transition-[width] duration-200 md:flex md:flex-col"
    :class="isOpen ? 'w-72' : 'w-14'"
  >
    <div class="flex items-center border-b border-border px-3 py-2">
      <button
        type="button"
        class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('toggle')"
      >
        <EditorIcon name="sidebar" />
      </button>
    </div>

    <div v-if="isOpen" class="min-h-0 flex-1 overflow-auto px-2 py-3">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="isDocumentExpanded = !isDocumentExpanded"
      >
        <EditorIcon :name="isDocumentExpanded ? 'chevron-down' : 'chevron-right'" />
        <span class="truncate">{{ props.documentTitle || 'Untitled Document' }}</span>
      </button>

      <div v-if="isDocumentExpanded" class="mt-2 space-y-1">
        <DocumentOutlineItem
          v-for="node in headingTree"
          :key="node.heading.id"
          :node="node"
          @select="emit('select', $event)"
        />

        <p v-if="props.headings.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
          Add headings to see document sections.
        </p>
      </div>
    </div>
  </aside>
</template>
