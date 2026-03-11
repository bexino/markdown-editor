<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { DocumentRecord } from '@/features/documents/services/documentStorage'

const props = defineProps<{
  isOpen: boolean
  mode: 'create' | 'rename'
  title: string
  description: string
  confirmLabel: string
  initialName?: string
  documents?: DocumentRecord[]
}>()

const emit = defineEmits<{
  close: []
  submit: [
    payload: {
      name: string
      documentIds: string[]
      createDocument: boolean
    },
  ]
}>()

const name = ref('')
const selectedDocumentIds = ref<string[]>([])
const createDocument = ref(false)

const sortedDocuments = computed(() => {
  return [...(props.documents ?? [])].sort((left, right) => left.name.localeCompare(right.name))
})

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      return
    }

    name.value = props.initialName ?? ''
    selectedDocumentIds.value = []
    createDocument.value = false
  },
)

function toggleDocument(documentId: string): void {
  selectedDocumentIds.value = selectedDocumentIds.value.includes(documentId)
    ? selectedDocumentIds.value.filter((id) => id !== documentId)
    : [...selectedDocumentIds.value, documentId]
}

function handleSubmit(): void {
  const trimmedName = name.value.trim()

  if (!trimmedName) {
    return
  }

  emit('submit', {
    name: trimmedName,
    documentIds: selectedDocumentIds.value,
    createDocument: createDocument.value,
  })
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
        <h2 class="text-xl font-semibold">{{ title }}</h2>
        <p class="mt-2 text-sm text-muted-foreground">{{ description }}</p>
      </header>

      <div class="mt-6 space-y-4">
        <label class="block">
          <span class="mb-2 block text-sm font-medium">Folder Name</span>
          <input
            v-model="name"
            type="text"
            placeholder="My Folder"
            class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            @keydown.enter.prevent="handleSubmit"
          />
        </label>

        <template v-if="mode === 'create'">
          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <span class="text-sm font-medium">Add Existing Documents</span>
              <span class="text-xs text-muted-foreground">
                {{ selectedDocumentIds.length }} selected
              </span>
            </div>

            <div class="max-h-52 space-y-1 overflow-auto rounded-md border border-border bg-background p-2">
              <label
                v-for="document in sortedDocuments"
                :key="document.id"
                class="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <input
                  :checked="selectedDocumentIds.includes(document.id)"
                  type="checkbox"
                  class="mt-1 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  @change="toggleDocument(document.id)"
                />
                <span class="min-w-0 truncate text-sm">{{ document.name }}</span>
              </label>

              <p
                v-if="sortedDocuments.length === 0"
                class="px-3 py-6 text-center text-sm text-muted-foreground"
              >
                No documents available yet.
              </p>
            </div>
          </div>

          <label class="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground">
            <input
              v-model="createDocument"
              type="checkbox"
              class="size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span class="text-sm font-medium">Create a new document in this folder</span>
          </label>
        </template>
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
          class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!name.trim()"
          @click="handleSubmit"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </section>
  </div>
</template>
