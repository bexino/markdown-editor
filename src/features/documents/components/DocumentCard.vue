<script setup lang="ts">
import type { DocumentRecord } from '@/features/documents/services/documentStorage'

defineProps<{
  document: DocumentRecord
  preview: string
  formattedUpdatedAt: string
}>()

const emit = defineEmits<{
  open: [id: string]
  delete: [id: string]
}>()

function handleOpen(id: string): void {
  emit('open', id)
}

function handleDelete(id: string): void {
  emit('delete', id)
}
</script>

<template>
  <article
    class="group cursor-pointer rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-ring"
    tabindex="0"
    @click="handleOpen(document.id)"
    @keydown.enter.prevent="handleOpen(document.id)"
    @keydown.space.prevent="handleOpen(document.id)"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-2">
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
      </div>

      <button
        type="button"
        class="-mt-1 -mr-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        aria-label="Delete document"
        @click.stop="handleDelete(document.id)"
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
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>
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
