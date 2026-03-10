<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EditorIcon from '@/features/documents/components/EditorIcon.vue'
import MarkdownPreview from '@/features/documents/components/MarkdownPreview.vue'
import { documentStorage, type DocumentRecord } from '@/features/documents/services/documentStorage'

const route = useRoute()
const router = useRouter()

const documentRecord = ref<DocumentRecord | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const documentId = computed(() => String(route.params.id ?? ''))

onMounted(() => {
  void loadDocument()
})

async function loadDocument(): Promise<void> {
  if (!documentId.value) {
    errorMessage.value = 'Document not found.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    documentRecord.value = await documentStorage.getById(documentId.value)

    if (!documentRecord.value) {
      errorMessage.value = 'Document not found.'
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load this preview right now.'
  } finally {
    isLoading.value = false
  }
}

function goBack(): void {
  void router.push(`/editor/${documentId.value}`)
}
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <header class="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @click="goBack"
        >
          <EditorIcon name="arrow-left" />
          <span>Back to editor</span>
        </button>

        <div class="min-w-0 text-right">
          <p class="truncate text-sm font-medium">{{ documentRecord?.name ?? 'Preview' }}</p>
          <p class="text-xs text-muted-foreground">Full-page preview</p>
        </div>
      </div>
    </header>

    <section
      v-if="isLoading"
      class="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 text-sm text-muted-foreground"
    >
      Loading preview...
    </section>

    <section
      v-else-if="errorMessage || !documentRecord"
      class="flex min-h-[calc(100vh-73px)] items-center justify-center px-6"
    >
      <div class="max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 class="text-2xl font-semibold">Unable to load preview</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ errorMessage || 'This document may have been removed.' }}
        </p>
      </div>
    </section>

    <section v-else class="px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <MarkdownPreview :content="documentRecord.content" />
      </div>
    </section>
  </main>
</template>
