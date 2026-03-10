<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import EditorHeader from '@/features/documents/components/EditorHeader.vue'
import EditorToolbar from '@/features/documents/components/EditorToolbar.vue'
import EditorWorkspace from '@/features/documents/components/EditorWorkspace.vue'
import { documentStorage } from '@/features/documents/services/documentStorage'

const route = useRoute()
const router = useRouter()

const workspace = ref<InstanceType<typeof EditorWorkspace> | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const name = ref('')
const content = ref('')
const savedName = ref('')
const savedContent = ref('')
const errorMessage = ref('')
const statusMessage = ref('')
const statusTone = ref<'success' | 'error'>('success')
const showBackConfirmation = ref(false)
const allowBackNavigation = ref(false)

let statusTimeout: number | undefined

const documentId = computed(() => String(route.params.id ?? ''))
const hasUnsavedChanges = computed(() => {
  return name.value !== savedName.value || content.value !== savedContent.value
})

onMounted(() => {
  void loadDocument()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('beforeunload', handleBeforeUnload)

  if (statusTimeout) {
    window.clearTimeout(statusTimeout)
  }
})

onBeforeRouteLeave((to) => {
  if (!hasUnsavedChanges.value || allowBackNavigation.value) {
    allowBackNavigation.value = false
    return true
  }

  if (to.path === '/documents') {
    showBackConfirmation.value = true
    return false
  }

  return true
})

async function loadDocument(): Promise<void> {
  if (!documentId.value) {
    errorMessage.value = 'Document not found.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const documentRecord = await documentStorage.getById(documentId.value)

    if (!documentRecord) {
      errorMessage.value = 'Document not found.'
      window.setTimeout(() => {
        void router.push('/documents')
      }, 1200)
      return
    }

    name.value = documentRecord.name
    content.value = documentRecord.content
    savedName.value = documentRecord.name
    savedContent.value = documentRecord.content
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load this document right now.'
  } finally {
    isLoading.value = false
  }
}

async function handleSave(): Promise<void> {
  if (!documentId.value || isSaving.value) {
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const updatedDocument = await documentStorage.update(documentId.value, {
      name: name.value.trim() || 'Untitled Document',
      content: content.value,
    })

    name.value = updatedDocument.name
    savedName.value = updatedDocument.name
    savedContent.value = updatedDocument.content
    showStatus('Document saved', 'success')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to save this document right now.'
    errorMessage.value = message
    showStatus(message, 'error')
  } finally {
    window.setTimeout(() => {
      isSaving.value = false
    }, 300)
  }
}

function showStatus(message: string, tone: 'success' | 'error'): void {
  statusMessage.value = message
  statusTone.value = tone

  if (statusTimeout) {
    window.clearTimeout(statusTimeout)
  }

  statusTimeout = window.setTimeout(() => {
    statusMessage.value = ''
  }, 2400)
}

function handleBack(): void {
  if (hasUnsavedChanges.value) {
    showBackConfirmation.value = true
    return
  }

  void router.push('/documents')
}

function closeBackConfirmation(): void {
  showBackConfirmation.value = false
}

function confirmBackNavigation(): void {
  allowBackNavigation.value = true
  showBackConfirmation.value = false
  void router.push('/documents')
}

function openPreview(): void {
  void router.push(`/preview/${documentId.value}`)
}

function handleBeforeUnload(event: BeforeUnloadEvent): void {
  if (!hasUnsavedChanges.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

function handleKeyDown(event: KeyboardEvent): void {
  if (!workspace.value) {
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void handleSave()
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
    event.preventDefault()
    workspace.value.insertMarkdown('**', '**')
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
    event.preventDefault()
    workspace.value.insertMarkdown('*', '*')
  }
}
</script>

<template>
  <main class="flex min-h-screen flex-col bg-background text-foreground">
    <EditorHeader
      :title="name"
      :is-saving="isSaving"
      @back="handleBack"
      @update-title="name = $event"
      @preview="openPreview"
      @save="handleSave"
    />

    <EditorToolbar
      @insert="workspace?.insertAtCursor($event)"
      @wrap="workspace?.insertMarkdown($event.before, $event.after)"
    />

    <div
      v-if="errorMessage || statusMessage || hasUnsavedChanges"
      class="border-b border-border bg-background/95 px-4 py-2"
    >
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <p v-if="errorMessage" class="text-destructive">{{ errorMessage }}</p>
        <p
          v-if="statusMessage"
          :class="statusTone === 'success' ? 'text-foreground' : 'text-destructive'"
        >
          {{ statusMessage }}
        </p>
        <p v-if="hasUnsavedChanges" class="text-muted-foreground">Unsaved changes</p>
      </div>
    </div>

    <section
      v-if="isLoading"
      class="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground"
    >
      Loading document...
    </section>

    <section
      v-else-if="errorMessage && !name && !content"
      class="flex flex-1 items-center justify-center px-6"
    >
      <div class="max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 class="text-2xl font-semibold">Unable to load document</h1>
        <p class="mt-2 text-sm text-muted-foreground">{{ errorMessage }}</p>
      </div>
    </section>

    <EditorWorkspace
      v-else
      ref="workspace"
      :content="content"
      @update-content="content = $event"
    />

    <div
      v-if="showBackConfirmation"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closeBackConfirmation"
    >
      <section class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 class="text-xl font-semibold">Unsaved changes</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          You have unsaved changes. Are you sure you want to go back?
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="closeBackConfirmation"
          >
            Stay here
          </button>
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            @click="confirmBackNavigation"
          >
            Go back
          </button>
        </div>
      </section>
    </div>
  </main>
</template>
