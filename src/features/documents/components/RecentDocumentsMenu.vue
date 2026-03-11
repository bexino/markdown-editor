<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import EditorIcon from '@/features/documents/components/EditorIcon.vue'
import type { RecentDocumentRecord } from '@/features/documents/services/recentDocumentStorage'

const props = defineProps<{
  currentDocumentId: string
  documents: RecentDocumentRecord[]
}>()

const emit = defineEmits<{
  open: [id: string]
}>()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function toggleMenu(event: MouseEvent): void {
  event.stopPropagation()
  isOpen.value = !isOpen.value
}

function closeMenu(): void {
  isOpen.value = false
}

function handleSelect(id: string): void {
  emit('open', id)
  closeMenu()
}

function handleDocumentClick(event: MouseEvent): void {
  if (!root.value) {
    return
  }

  if (event.target instanceof Node && !root.value.contains(event.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="documents.length === 0"
      @click="toggleMenu"
    >
      <EditorIcon name="history" />
      <span class="hidden sm:inline">Recent</span>
      <EditorIcon name="chevron-down" />
    </button>

    <div
      v-if="isOpen"
      class="absolute top-11 left-0 z-20 min-w-72 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
    >
      <div class="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Recent Documents
      </div>

      <button
        v-for="document in documents"
        :key="document.id"
        type="button"
        class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        :class="document.id === currentDocumentId ? 'bg-accent text-accent-foreground' : ''"
        @click="handleSelect(document.id)"
      >
        <span class="min-w-0 truncate">{{ document.name }}</span>
        <span
          v-if="document.id === currentDocumentId"
          class="shrink-0 text-xs text-muted-foreground"
        >
          Current
        </span>
      </button>
    </div>
  </div>
</template>
