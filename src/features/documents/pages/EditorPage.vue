<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { documentStorage, type DocumentRecord } from '@/features/documents/services/documentStorage'

const route = useRoute()

const documentRecord = ref<DocumentRecord | null>(null)
const isLoading = ref(false)
const feedbackMessage = ref('')

onMounted(() => {
  void loadDocument()
})

async function loadDocument(): Promise<void> {
  isLoading.value = true
  feedbackMessage.value = ''

  try {
    documentRecord.value = await documentStorage.getById(String(route.params.id ?? ''))
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to load this document right now.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-background px-6 py-12 text-foreground">
    <div class="mx-auto max-w-3xl">
      <RouterLink
        to="/documents"
        class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to documents
      </RouterLink>

      <section class="mt-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <template v-if="isLoading">
          <p class="text-muted-foreground">Loading document...</p>
        </template>

        <template v-else-if="feedbackMessage">
          <h1 class="text-3xl font-bold">Unable to load document</h1>
          <p class="mt-3 text-muted-foreground">
            {{ feedbackMessage }}
          </p>
        </template>

        <template v-else-if="documentRecord">
          <p class="text-sm uppercase tracking-[0.2em] text-muted-foreground">Editor</p>
          <h1 class="mt-3 text-3xl font-bold">{{ documentRecord.name }}</h1>
          <p class="mt-3 text-muted-foreground">
            The document route is wired and ready for the full editor implementation.
          </p>
          <pre
            class="mt-6 overflow-auto rounded-lg bg-muted/60 p-4 text-sm whitespace-pre-wrap text-foreground"
          >{{ documentRecord.content }}</pre>
        </template>

        <template v-else>
          <h1 class="text-3xl font-bold">Document not found</h1>
          <p class="mt-3 text-muted-foreground">
            This document may have been deleted or you may not have access to it.
          </p>
        </template>
      </section>
    </div>
  </main>
</template>
