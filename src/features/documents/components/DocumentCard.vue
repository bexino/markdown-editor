<script setup lang="ts">
import ActionMenu from '@/features/documents/components/ActionMenu.vue'
import type { DocumentRecord } from '@/features/documents/services/documentStorage'

defineProps<{
  document: DocumentRecord
  preview: string
  formattedUpdatedAt: string
  isPinned: boolean
  isSelectionMode?: boolean
  isSelected?: boolean
}>()

const emit = defineEmits<{
  open: [id: string]
  manageFolders: [id: string]
  togglePin: [id: string]
  duplicate: [id: string]
  delete: [id: string]
  toggleSelection: [id: string]
}>()

function handleOpen(id: string): void {
  emit('open', id)
}

function handleDelete(id: string): void {
  emit('delete', id)
}

function handleDuplicate(id: string): void {
  emit('duplicate', id)
}

function handleManageFolders(id: string): void {
  emit('manageFolders', id)
}

function handleTogglePin(id: string): void {
  emit('togglePin', id)
}

function handleToggleSelection(id: string): void {
  emit('toggleSelection', id)
}
</script>

<template>
  <article
    class="group rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-ring"
    :class="[
      isSelectionMode ? 'cursor-default' : 'cursor-pointer',
      isSelected ? 'border-primary ring-2 ring-primary/20' : '',
    ]"
    tabindex="0"
    @click="isSelectionMode ? handleToggleSelection(document.id) : handleOpen(document.id)"
    @keydown.enter.prevent="isSelectionMode ? handleToggleSelection(document.id) : handleOpen(document.id)"
    @keydown.space.prevent="isSelectionMode ? handleToggleSelection(document.id) : handleOpen(document.id)"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <input
          v-if="isSelectionMode"
          :checked="isSelected"
          type="checkbox"
          class="size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
          :aria-label="`Select ${document.name}`"
          @click.stop
          @change="handleToggleSelection(document.id)"
        />
        <svg
          class="size-5 shrink-0 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
        <h3 class="truncate font-semibold">{{ document.name }}</h3>
        <svg
          v-if="isPinned"
          class="size-4 shrink-0 text-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 17v5" />
          <path d="M8 3h8l-1 7 3 2v1H6v-1l3-2-1-7Z" />
        </svg>
      </div>

      <div
        v-if="!isSelectionMode"
        class="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
      >
        <ActionMenu
          ariaLabel="Document actions"
          :items="[
            { id: 'folders', label: 'Manage folders' },
            { id: 'pin', label: isPinned ? 'Unpin' : 'Pin' },
            { id: 'duplicate', label: 'Duplicate' },
            { id: 'delete', label: 'Delete', destructive: true },
          ]"
          @select="
            $event === 'folders'
              ? handleManageFolders(document.id)
              : $event === 'pin'
                ? handleTogglePin(document.id)
              : $event === 'duplicate'
                ? handleDuplicate(document.id)
                : handleDelete(document.id)
          "
        />
      </div>
    </div>

    <p class="document-preview mb-3 text-sm text-muted-foreground">
      {{ preview }}
    </p>

    <div class="flex items-center gap-1 text-xs text-muted-foreground">
      <svg
        class="size-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
      </svg>
      <span>Updated {{ formattedUpdatedAt }}</span>
    </div>
  </article>
</template>

<style scoped>
.document-preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
</style>
