<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import DocumentCard from '@/components/app/DocumentCard.vue'
import UserMenu from '@/components/app/UserMenu.vue'
import { defaultContent } from '@/lib/defaultContent'
import { documentStorage, type DocumentRecord } from '@/lib/documentStorage'

const router = useRouter()

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const documents = ref<DocumentRecord[]>([])
const searchQuery = ref('')
const deleteId = ref<string | null>(null)
const isLoading = ref(false)
const feedbackMessage = ref('')

const filteredDocuments = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return documents.value
  }

  return documents.value.filter((document) => document.name.toLowerCase().includes(query))
})

onMounted(() => {
  void loadDocuments()
})

async function loadDocuments(): Promise<void> {
  isLoading.value = true
  feedbackMessage.value = ''

  try {
    documents.value = await documentStorage.getAll()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to load documents right now.'
  } finally {
    isLoading.value = false
  }
}

async function handleCreate(): Promise<void> {
  feedbackMessage.value = ''

  try {
    const documentRecord = await documentStorage.create('Untitled Document', defaultContent)
    await router.push(`/editor/${documentRecord.id}`)
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to create a document right now.'
  }
}

function promptDelete(id: string): void {
  deleteId.value = id
}

function closeDeleteDialog(): void {
  deleteId.value = null
}

async function handleDelete(): Promise<void> {
  if (!deleteId.value) {
    return
  }

  feedbackMessage.value = ''

  try {
    await documentStorage.delete(deleteId.value)
    await loadDocuments()
    closeDeleteDialog()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to delete this document right now.'
  }
}

async function openDocument(id: string): Promise<void> {
  await router.push(`/editor/${id}`)
}

function getDocumentPreview(content: string): string {
  const preview = content.replace(/\s+/g, ' ').trim()
  return preview.length > 150 ? `${preview.slice(0, 150)}...` : preview
}

function formatUpdatedAt(value: string): string {
  return dateFormatter.format(new Date(value))
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="border-b border-border bg-card px-6 py-4">
      <div class="mx-auto max-w-6xl">
        <div class="mb-4 flex items-center justify-between gap-4">
          <h1 class="text-3xl font-bold">Markdown Editor</h1>
          <UserMenu />
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <div class="relative flex-1">
            <svg
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search documents..."
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="handleCreate"
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
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            New Document
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-auto p-6">
      <div class="mx-auto max-w-6xl">
        <div
          v-if="feedbackMessage"
          class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {{ feedbackMessage }}
        </div>

        <section
          v-if="isLoading"
          class="flex h-64 flex-col items-center justify-center text-center"
        >
          <p class="text-muted-foreground">Loading documents...</p>
        </section>

        <section
          v-else-if="filteredDocuments.length === 0"
          class="flex h-64 flex-col items-center justify-center text-center"
        >
          <svg
            class="mb-4 size-16 text-muted-foreground"
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
          <h2 class="mb-2 text-xl font-semibold">
            {{ searchQuery ? 'No documents found' : 'No documents yet' }}
          </h2>
          <p class="mb-4 text-muted-foreground">
            {{
              searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first markdown document to get started'
            }}
          </p>
          <button
            v-if="!searchQuery"
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="handleCreate"
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
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Create Document
          </button>
        </section>

        <section v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DocumentCard
            v-for="document in filteredDocuments"
            :key="document.id"
            :document="document"
            :preview="getDocumentPreview(document.content)"
            :formatted-updated-at="formatUpdatedAt(document.updatedAt)"
            @open="openDocument"
            @delete="promptDelete"
          />
        </section>
      </div>
    </main>

    <div
      v-if="deleteId"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closeDeleteDialog"
    >
      <section class="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg">
        <header>
          <h2 class="text-xl font-semibold">Delete Document</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Are you sure you want to delete this document? This action cannot be undone.
          </p>
        </header>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            @click="closeDeleteDialog"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
