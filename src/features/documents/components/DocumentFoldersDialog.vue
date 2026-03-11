<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { FolderRecord } from '@/features/documents/services/folderStorage'

const props = defineProps<{
  isOpen: boolean
  folders: FolderRecord[]
  selectedFolderIds: string[]
}>()

const emit = defineEmits<{
  close: []
  submit: [folderIds: string[]]
}>()

const internalFolderIds = ref<string[]>([])

const sortedFolders = computed(() => {
  return [...props.folders].sort((left, right) => left.name.localeCompare(right.name))
})

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      return
    }

    internalFolderIds.value = [...props.selectedFolderIds]
  },
)

function toggleFolder(folderId: string): void {
  internalFolderIds.value = internalFolderIds.value.includes(folderId)
    ? internalFolderIds.value.filter((id) => id !== folderId)
    : [...internalFolderIds.value, folderId]
}

function handleSubmit(): void {
  emit('submit', internalFolderIds.value)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="emit('close')"
  >
    <section class="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg">
      <header>
        <h2 class="text-xl font-semibold">Manage Folders</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Choose which folders should include this document.
        </p>
      </header>

      <div class="mt-6 space-y-2 rounded-md border border-border bg-background p-2">
        <label
          v-for="folder in sortedFolders"
          :key="folder.id"
          class="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <input
            :checked="internalFolderIds.includes(folder.id)"
            type="checkbox"
            class="mt-1 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            @change="toggleFolder(folder.id)"
          />
          <span class="min-w-0 truncate text-sm">{{ folder.name }}</span>
        </label>

        <p
          v-if="sortedFolders.length === 0"
          class="px-3 py-6 text-center text-sm text-muted-foreground"
        >
          Create a folder first to organize documents.
        </p>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          @click="handleSubmit"
        >
          Save
        </button>
      </div>
    </section>
  </div>
</template>
