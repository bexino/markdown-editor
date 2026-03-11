<script setup lang="ts">
import type { FolderRecord } from '@/features/documents/services/folderStorage'

defineProps<{
  folders: FolderRecord[]
}>()

const emit = defineEmits<{
  home: []
  openFolder: [id: string]
}>()
</script>

<template>
  <div class="mb-4 flex items-center gap-2 text-sm">
    <button
      type="button"
      class="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      @click="emit('home')"
    >
      <svg
        class="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
      <span class="hidden sm:inline">Home</span>
    </button>

    <div v-for="folder in folders" :key="folder.id" class="flex items-center gap-2">
      <svg
        class="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
      <button
        type="button"
        class="inline-flex h-8 cursor-pointer items-center rounded-md px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('openFolder', folder.id)"
      >
        {{ folder.name }}
      </button>
    </div>
  </div>
</template>
