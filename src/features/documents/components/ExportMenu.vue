<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import EditorIcon from '@/features/documents/components/EditorIcon.vue'

const emit = defineEmits<{
  markdown: []
  pdf: []
}>()

const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)

function toggleMenu(): void {
  isOpen.value = !isOpen.value
}

function closeMenu(): void {
  isOpen.value = false
}

function handleDocumentClick(event: MouseEvent): void {
  if (!root.value) {
    return
  }

  if (!root.value.contains(event.target as Node)) {
    closeMenu()
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

function exportMarkdown(): void {
  closeMenu()
  emit('markdown')
}

function exportPdf(): void {
  closeMenu()
  emit('pdf')
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggleMenu"
    >
      <EditorIcon name="download" />
      <span class="hidden sm:inline">Export</span>
      <EditorIcon name="chevron-down" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
      role="menu"
    >
      <button
        type="button"
        class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        role="menuitem"
        @click="exportMarkdown"
      >
        Markdown
      </button>
      <button
        type="button"
        class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        role="menuitem"
        @click="exportPdf"
      >
        PDF
      </button>
    </div>
  </div>
</template>
