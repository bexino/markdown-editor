<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import DocumentFoldersDialog from '@/features/documents/components/DocumentFoldersDialog.vue'
import DocumentCard from '@/features/documents/components/DocumentCard.vue'
import FolderBreadcrumbs from '@/features/documents/components/FolderBreadcrumbs.vue'
import FolderCard from '@/features/documents/components/FolderCard.vue'
import FolderDialog from '@/features/documents/components/FolderDialog.vue'
import UserMenu from '@/shared/components/UserMenu.vue'
import { defaultContent } from '@/features/documents/lib/defaultContent'
import { documentStorage, type DocumentRecord } from '@/features/documents/services/documentStorage'
import { documentFolderStorage } from '@/features/documents/services/documentFolderStorage'
import { folderStorage, type FolderRecord } from '@/features/documents/services/folderStorage'
import { pinnedItemStorage } from '@/features/documents/services/pinnedItemStorage'

type WorkspaceFilter = 'all' | 'folders' | 'documents'
type WorkspaceSort = 'updated' | 'nameAsc' | 'nameDesc' | 'created'

const router = useRouter()

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const documents = ref<DocumentRecord[]>([])
const folders = ref<FolderRecord[]>([])
const documentFolderIds = ref<Record<string, string[]>>({})
const currentFolderId = ref<string | null>(null)
const searchQuery = ref('')
const deleteId = ref<string | null>(null)
const deleteType = ref<'document' | 'folder'>('document')
const selectedDocumentIds = ref<string[]>([])
const isBulkDeleteMode = ref(false)
const isLoading = ref(false)
const feedbackMessage = ref('')
const isCreateFolderDialogOpen = ref(false)
const renameFolderId = ref<string | null>(null)
const renameFolderName = ref('')
const manageFolderDocumentsId = ref<string | null>(null)
const manageDocumentId = ref<string | null>(null)
const pinnedDocumentIds = ref<string[]>([])
const pinnedFolderIds = ref<string[]>([])
const workspaceFilter = ref<WorkspaceFilter>('all')
const workspaceSort = ref<WorkspaceSort>('updated')

const filterOptions: Array<{ value: WorkspaceFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'folders', label: 'Folders' },
  { value: 'documents', label: 'Documents' },
]

const sortOptions: Array<{ value: WorkspaceSort; label: string }> = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'nameAsc', label: 'Name (A - Z)' },
  { value: 'nameDesc', label: 'Name (Z - A)' },
  { value: 'created', label: 'Recently Created' },
]

function sortWorkspaceEntries<T extends { id: string; name: string; createdAt: string; updatedAt: string }>(
  entries: T[],
  pinnedIds: string[],
  sort: WorkspaceSort,
): T[] {
  const pinnedIdSet = new Set(pinnedIds)

  return [...entries].sort((left, right) => {
    const leftPinned = pinnedIdSet.has(left.id)
    const rightPinned = pinnedIdSet.has(right.id)

    if (leftPinned !== rightPinned) {
      return leftPinned ? -1 : 1
    }

    if (sort === 'updated') {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    }

    if (sort === 'created') {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    }

    if (sort === 'nameDesc') {
      return right.name.localeCompare(left.name)
    }

    return left.name.localeCompare(right.name)
  })
}

const breadcrumbs = computed(() => {
  if (!currentFolderId.value) {
    return []
  }

  const folder = folders.value.find((entry) => entry.id === currentFolderId.value)
  return folder ? [folder] : []
})

const currentDocuments = computed(() => {
  if (!currentFolderId.value) {
    return documents.value
  }

  return documents.value.filter((document) =>
    (documentFolderIds.value[document.id] ?? []).includes(currentFolderId.value as string),
  )
})

const currentFolders = computed(() => {
  if (currentFolderId.value) {
    return []
  }

  return folders.value
})

const filteredDocuments = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return currentDocuments.value
  }

  return currentDocuments.value.filter((document) => document.name.toLowerCase().includes(query))
})

const filteredFolders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return currentFolders.value
  }

  return currentFolders.value.filter((folder) => folder.name.toLowerCase().includes(query))
})

const visibleDocuments = computed(() => {
  return workspaceFilter.value === 'folders' ? [] : filteredDocuments.value
})

const visibleFolders = computed(() => {
  if (currentFolderId.value || workspaceFilter.value === 'documents') {
    return []
  }

  return filteredFolders.value
})

const sortedDocuments = computed(() =>
  sortWorkspaceEntries(visibleDocuments.value, pinnedDocumentIds.value, workspaceSort.value),
)

const sortedFolders = computed(() =>
  sortWorkspaceEntries(visibleFolders.value, pinnedFolderIds.value, workspaceSort.value),
)

const selectedDocumentFolderIds = computed(() => {
  if (!manageDocumentId.value) {
    return []
  }

  return documentFolderIds.value[manageDocumentId.value] ?? []
})

const managedFolder = computed(() => {
  if (!manageFolderDocumentsId.value) {
    return null
  }

  return folders.value.find((entry) => entry.id === manageFolderDocumentsId.value) ?? null
})

const documentIdsByFolderId = computed(() => {
  return Object.entries(documentFolderIds.value).reduce<Record<string, string[]>>(
    (accumulator, [documentId, folderIds]) => {
      for (const folderId of folderIds) {
        accumulator[folderId] = [...(accumulator[folderId] ?? []), documentId]
      }

      return accumulator
    },
    {},
  )
})

const managedFolderDocumentIds = computed(() => {
  if (!manageFolderDocumentsId.value) {
    return []
  }

  return documentIdsByFolderId.value[manageFolderDocumentsId.value] ?? []
})

const hasVisibleDocuments = computed(() => sortedDocuments.value.length > 0)

const visibleDocumentIds = computed(() => sortedDocuments.value.map((document) => document.id))

const selectedVisibleDocumentIds = computed(() => {
  const visibleDocumentIdSet = new Set(visibleDocumentIds.value)
  return selectedDocumentIds.value.filter((id) => visibleDocumentIdSet.has(id))
})

const selectedDocumentCount = computed(() => selectedVisibleDocumentIds.value.length)

watch(visibleDocumentIds, (documentIds) => {
  const visibleDocumentIdSet = new Set(documentIds)
  selectedDocumentIds.value = selectedDocumentIds.value.filter((id) => visibleDocumentIdSet.has(id))
})

onMounted(() => {
  void loadWorkspace()
})

async function loadWorkspace(): Promise<void> {
  isLoading.value = true
  feedbackMessage.value = ''

  try {
    const documentRecords = await documentStorage.getAll()
    const folderRecords = await folderStorage.getAll()
    const pinnedItems = await pinnedItemStorage.getAll()
    const folderIdsByDocumentId = await documentFolderStorage.getFolderIdsByDocumentIds(
      documentRecords.map((document) => document.id),
    )

    documents.value = documentRecords
    folders.value = folderRecords
    pinnedDocumentIds.value = pinnedItems.documentIds.filter((id) =>
      documentRecords.some((document) => document.id === id),
    )
    pinnedFolderIds.value = pinnedItems.folderIds.filter((id) =>
      folderRecords.some((folder) => folder.id === id),
    )
    documentFolderIds.value = folderIdsByDocumentId
    selectedDocumentIds.value = selectedDocumentIds.value.filter((id) =>
      documentRecords.some((document) => document.id === id),
    )
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to load your workspace right now.'
  } finally {
    isLoading.value = false
  }
}

async function handleCreate(): Promise<void> {
  feedbackMessage.value = ''

  try {
    const documentRecord = await documentStorage.create('Untitled Document', defaultContent)
    if (currentFolderId.value) {
      await documentFolderStorage.setFoldersForDocument(documentRecord.id, [currentFolderId.value])
    }
    await router.push(`/editor/${documentRecord.id}`)
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to create a document right now.'
  }
}

async function handleDuplicate(id: string): Promise<void> {
  feedbackMessage.value = ''

  try {
    const documentRecord = await documentStorage.duplicate(id)
    await documentFolderStorage.cloneFoldersForDocument(id, documentRecord.id)
    await loadWorkspace()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to duplicate this document right now.'
  }
}

async function handleCreateFolder(payload: {
  name: string
  documentIds: string[]
  createDocument: boolean
  documentName: string
}): Promise<void> {
  feedbackMessage.value = ''

  try {
    const folder = await folderStorage.create(payload.name)
    await documentFolderStorage.addDocumentsToFolder(folder.id, payload.documentIds)

    if (payload.createDocument) {
      const documentRecord = await documentStorage.create(payload.documentName, defaultContent)
      await documentFolderStorage.setFoldersForDocument(documentRecord.id, [folder.id])
    }

    isCreateFolderDialogOpen.value = false
    await loadWorkspace()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to create this folder right now.'
  }
}

async function handleRenameFolder(payload: {
  name: string
  documentIds: string[]
  createDocument: boolean
  documentName: string
}): Promise<void> {
  if (!renameFolderId.value) {
    return
  }

  feedbackMessage.value = ''

  try {
    await folderStorage.update(renameFolderId.value, {
      name: payload.name,
    })
    closeRenameFolderDialog()
    await loadWorkspace()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to rename this folder right now.'
  }
}

function promptDeleteDocument(id: string): void {
  deleteId.value = id
  deleteType.value = 'document'
}

function promptDeleteFolder(id: string): void {
  deleteId.value = id
  deleteType.value = 'folder'
}

function closeDeleteDialog(): void {
  deleteId.value = null
}

function toggleBulkDeleteMode(): void {
  isBulkDeleteMode.value = !isBulkDeleteMode.value
  selectedDocumentIds.value = []
}

function toggleSelectedDocument(id: string): void {
  selectedDocumentIds.value = selectedDocumentIds.value.includes(id)
    ? selectedDocumentIds.value.filter((entryId) => entryId !== id)
    : [...selectedDocumentIds.value, id]
}

function promptDeleteSelectedDocuments(): void {
  if (selectedVisibleDocumentIds.value.length === 0) {
    return
  }

  deleteType.value = 'document'
  deleteId.value = '__bulk__'
}

async function handleDelete(): Promise<void> {
  if (!deleteId.value) {
    return
  }

  feedbackMessage.value = ''

  try {
    if (deleteType.value === 'document' && deleteId.value === '__bulk__') {
      await Promise.all(selectedVisibleDocumentIds.value.map((id) => documentStorage.delete(id)))
      selectedDocumentIds.value = []
      isBulkDeleteMode.value = false
    } else if (deleteType.value === 'document') {
      await documentStorage.delete(deleteId.value)
    } else {
      await folderStorage.delete(deleteId.value)
      if (currentFolderId.value === deleteId.value) {
        currentFolderId.value = null
      }
    }

    await loadWorkspace()
    closeDeleteDialog()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error
        ? error.message
        : `Unable to delete this ${deleteType.value} right now.`
  }
}

async function openDocument(id: string): Promise<void> {
  await router.push(`/editor/${id}`)
}

function openFolder(id: string): void {
  currentFolderId.value = id
  selectedDocumentIds.value = []
  isBulkDeleteMode.value = false
}

function openHome(): void {
  currentFolderId.value = null
  selectedDocumentIds.value = []
  isBulkDeleteMode.value = false
}

function openRenameFolder(id: string): void {
  const folder = folders.value.find((entry) => entry.id === id)

  if (!folder) {
    return
  }

  renameFolderId.value = id
  renameFolderName.value = folder.name
}

function openManageFolders(id: string): void {
  manageDocumentId.value = id
}

function openManageFolderDocuments(id: string): void {
  manageFolderDocumentsId.value = id
}

function closeRenameFolderDialog(): void {
  renameFolderId.value = null
  renameFolderName.value = ''
}

function closeManageFolderDocumentsDialog(): void {
  manageFolderDocumentsId.value = null
}

function closeManageFolders(): void {
  manageDocumentId.value = null
}

async function handleUpdateDocumentFolders(folderIds: string[]): Promise<void> {
  if (!manageDocumentId.value) {
    return
  }

  feedbackMessage.value = ''

  try {
    await documentFolderStorage.setFoldersForDocument(manageDocumentId.value, folderIds)
    manageDocumentId.value = null
    await loadWorkspace()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to update document folders right now.'
  }
}

async function handleManageFolderDocuments(payload: {
  name: string
  documentIds: string[]
  createDocument: boolean
  documentName: string
}): Promise<void> {
  if (!manageFolderDocumentsId.value) {
    return
  }

  feedbackMessage.value = ''

  try {
    await documentFolderStorage.addDocumentsToFolder(
      manageFolderDocumentsId.value,
      payload.documentIds,
    )

    if (payload.createDocument) {
      const documentRecord = await documentStorage.create(payload.documentName, defaultContent)
      await documentFolderStorage.setFoldersForDocument(documentRecord.id, [manageFolderDocumentsId.value])
    }

    closeManageFolderDocumentsDialog()
    await loadWorkspace()
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to add documents to this folder right now.'
  }
}

async function handleToggleDocumentPin(id: string): Promise<void> {
  feedbackMessage.value = ''

  try {
    if (pinnedDocumentIds.value.includes(id)) {
      await pinnedItemStorage.unpinDocument(id)
      pinnedDocumentIds.value = pinnedDocumentIds.value.filter((entryId) => entryId !== id)
      return
    }

    await pinnedItemStorage.pinDocument(id)
    pinnedDocumentIds.value = [...pinnedDocumentIds.value, id]
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to update this document pin right now.'
  }
}

async function handleToggleFolderPin(id: string): Promise<void> {
  feedbackMessage.value = ''

  try {
    if (pinnedFolderIds.value.includes(id)) {
      await pinnedItemStorage.unpinFolder(id)
      pinnedFolderIds.value = pinnedFolderIds.value.filter((entryId) => entryId !== id)
      return
    }

    await pinnedItemStorage.pinFolder(id)
    pinnedFolderIds.value = [...pinnedFolderIds.value, id]
  } catch (error) {
    feedbackMessage.value =
      error instanceof Error ? error.message : 'Unable to update this folder pin right now.'
  }
}

function getDocumentPreview(content: string): string {
  const preview = content.replace(/\s+/g, ' ').trim()
  return preview.length > 150 ? `${preview.slice(0, 150)}...` : preview
}

function formatUpdatedAt(value: string): string {
  return dateFormatter.format(new Date(value))
}

function formatCreatedAt(value: string): string {
  return dateFormatter.format(new Date(value))
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="border-b border-border bg-card px-6 py-4">
      <div class="mx-auto max-w-6xl">
        <div class="mb-4 flex items-center justify-between gap-4">
          <h1 class="text-3xl font-bold">MarkDocs</h1>
          <UserMenu />
        </div>

        <FolderBreadcrumbs
          :folders="breadcrumbs"
          @home="openHome"
          @open-folder="openFolder"
        />

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
              placeholder="Search documents and folders..."
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <label class="flex min-w-0 sm:w-40">
            <select
              v-model="workspaceFilter"
              class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Filter workspace items"
            >
              <option
                v-for="option in filterOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="flex min-w-0 sm:w-48">
            <select
              v-model="workspaceSort"
              class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Sort workspace items"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <button
            v-if="!isBulkDeleteMode"
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            @click="currentFolderId ? openManageFolderDocuments(currentFolderId) : (isCreateFolderDialogOpen = true)"
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
              <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              <path d="M12 11v6" />
              <path d="M9 14h6" />
            </svg>
            <span class="hidden sm:inline">
              {{ currentFolderId ? 'Add Documents' : 'New Folder' }}
            </span>
          </button>

          <template v-if="isBulkDeleteMode">
            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
              @click="toggleBulkDeleteMode"
            >
              Cancel
            </button>

            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="selectedDocumentCount === 0"
              @click="promptDeleteSelectedDocuments"
            >
              Delete selected
              <span class="rounded-full bg-black/10 px-2 py-0.5 text-xs text-current">
                {{ selectedDocumentCount }}
              </span>
            </button>
          </template>

          <button
            v-if="!isBulkDeleteMode"
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

          <button
            v-if="hasVisibleDocuments"
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
            :class="
              isBulkDeleteMode
                ? 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                : 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
            "
            @click="toggleBulkDeleteMode"
          >
            {{ isBulkDeleteMode ? 'Cancel' : 'Select' }}
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
          <p class="text-muted-foreground">Loading workspace...</p>
        </section>

        <section
          v-else-if="filteredDocuments.length === 0 && filteredFolders.length === 0"
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
            {{ searchQuery ? 'No items found' : 'This folder is empty' }}
          </h2>
          <p class="mb-4 text-muted-foreground">
            {{
              searchQuery
                ? 'Try adjusting your search query'
                : 'Create a document or folder to get started'
            }}
          </p>
          <div v-if="!searchQuery" class="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
              @click="
                currentFolderId
                  ? openManageFolderDocuments(currentFolderId)
                  : (isCreateFolderDialogOpen = true)
              "
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
                <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                <path d="M12 11v6" />
                <path d="M9 14h6" />
              </svg>
              {{ currentFolderId ? 'Add Documents' : 'Create Folder' }}
            </button>
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
              Create Document
            </button>
          </div>
        </section>

        <section v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FolderCard
            v-for="folder in sortedFolders"
            :key="folder.id"
            :folder="folder"
            :formatted-created-at="formatCreatedAt(folder.createdAt)"
            :is-pinned="pinnedFolderIds.includes(folder.id)"
            @open="openFolder"
            @toggle-pin="handleToggleFolderPin"
            @manage-documents="openManageFolderDocuments"
            @rename="openRenameFolder"
            @delete="promptDeleteFolder"
          />

          <DocumentCard
            v-for="document in sortedDocuments"
            :key="document.id"
            :document="document"
            :preview="getDocumentPreview(document.content)"
            :formatted-updated-at="formatUpdatedAt(document.updatedAt)"
            :is-pinned="pinnedDocumentIds.includes(document.id)"
            :is-selection-mode="isBulkDeleteMode"
            :is-selected="selectedDocumentIds.includes(document.id)"
            @open="openDocument"
            @manage-folders="openManageFolders"
            @toggle-pin="handleToggleDocumentPin"
            @toggle-selection="toggleSelectedDocument"
            @duplicate="handleDuplicate"
            @delete="promptDeleteDocument"
          />
        </section>
      </div>
    </main>

    <FolderDialog
      :is-open="isCreateFolderDialogOpen"
      mode="create"
      title="Create New Folder"
      description="Enter a name for your new folder and optionally add documents to it."
      confirm-label="Create Folder"
      :documents="documents"
      @close="isCreateFolderDialogOpen = false"
      @submit="handleCreateFolder"
    />

    <FolderDialog
      :is-open="!!renameFolderId"
      mode="rename"
      title="Rename Folder"
      description="Enter a new name for this folder."
      confirm-label="Rename"
      :initial-name="renameFolderName"
      @close="closeRenameFolderDialog"
      @submit="handleRenameFolder"
    />

    <FolderDialog
      :is-open="!!manageFolderDocumentsId"
      mode="manageDocuments"
      :title="managedFolder ? `Add Documents to ${managedFolder.name}` : 'Add Documents'"
      description="Add existing documents to this folder or create a new one."
      confirm-label="Add Documents"
      :documents="documents"
      :excluded-document-ids="managedFolderDocumentIds"
      @close="closeManageFolderDocumentsDialog"
      @submit="handleManageFolderDocuments"
    />

    <DocumentFoldersDialog
      :is-open="!!manageDocumentId"
      :folders="folders"
      :selected-folder-ids="selectedDocumentFolderIds"
      @close="closeManageFolders"
      @submit="handleUpdateDocumentFolders"
    />

    <div
      v-if="deleteId"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closeDeleteDialog"
    >
      <section class="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg">
        <header>
          <h2 class="text-xl font-semibold">
            {{
              deleteType === 'folder'
                ? 'Delete Folder'
                : deleteId === '__bulk__'
                  ? 'Delete Documents'
                  : 'Delete Document'
            }}
          </h2>
          <p class="mt-2 text-sm text-muted-foreground">
            {{
              deleteType === 'folder'
                ? 'Are you sure you want to delete this folder? Document links to this folder will be removed. This action cannot be undone.'
                : deleteId === '__bulk__'
                  ? `Are you sure you want to delete ${selectedDocumentCount} documents? This action cannot be undone.`
                : 'Are you sure you want to delete this document? This action cannot be undone.'
            }}
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
