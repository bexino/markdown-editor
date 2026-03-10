<script setup lang="ts">
import { ref } from 'vue'

import EditorIcon from '@/features/documents/components/EditorIcon.vue'
import type { MarkdownHeading } from '@/features/documents/lib/markdown'

defineProps<{
  documentTitle: string
  headings: MarkdownHeading[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  toggle: []
  select: [id: string]
}>()

const isDocumentExpanded = ref(true)

function getItemClasses(level: number): string {
  if (level <= 1) {
    return 'pl-3'
  }

  if (level === 2) {
    return 'pl-7'
  }

  if (level === 3) {
    return 'pl-11'
  }

  return 'pl-14'
}
</script>

<template>
  <aside
    class="hidden border-r border-border bg-card transition-[width] duration-200 md:flex md:flex-col"
    :class="isOpen ? 'w-72' : 'w-14'"
  >
    <div class="flex h-14 items-center justify-between border-b border-border px-3">
      <button
        type="button"
        class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('toggle')"
      >
        <EditorIcon name="sidebar" />
      </button>

      <span v-if="isOpen" class="text-sm font-medium text-foreground">Outline</span>
    </div>

    <div v-if="isOpen" class="min-h-0 flex-1 overflow-auto px-2 py-3">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="isDocumentExpanded = !isDocumentExpanded"
      >
        <EditorIcon :name="isDocumentExpanded ? 'chevron-down' : 'arrow-left'" />
        <span class="truncate">{{ documentTitle || 'Untitled Document' }}</span>
      </button>

      <div v-if="isDocumentExpanded" class="mt-2 space-y-1">
        <button
          v-for="heading in headings"
          :key="heading.id"
          type="button"
          class="flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          :class="getItemClasses(heading.level)"
          @click="emit('select', heading.id)"
        >
          <span class="shrink-0 text-xs text-muted-foreground/70">
            {{ '>'.repeat(Math.min(heading.level, 3)) }}
          </span>
          <span class="truncate">{{ heading.text }}</span>
        </button>

        <p v-if="headings.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
          Add headings to see document sections.
        </p>
      </div>
    </div>
  </aside>
</template>
