<script setup lang="ts">
import { jsPDF } from 'jspdf'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import EditorHeader from '@/features/documents/components/EditorHeader.vue'
import DocumentOutlineSidebar from '@/features/documents/components/DocumentOutlineSidebar.vue'
import EditorToolbar from '@/features/documents/components/EditorToolbar.vue'
import EditorWorkspace from '@/features/documents/components/EditorWorkspace.vue'
import { extractMarkdownHeadings, parseMarkdown } from '@/features/documents/lib/markdown'
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
const isSidebarOpen = ref(true)

let statusTimeout: number | undefined
let autosaveTimeout: number | undefined

const documentId = computed(() => String(route.params.id ?? ''))
const hasUnsavedChanges = computed(() => {
  return name.value !== savedName.value || content.value !== savedContent.value
})
const saveStateLabel = computed(() => {
  if (errorMessage.value) {
    return errorMessage.value
  }

  if (isSaving.value) {
    return 'Saving...'
  }

  if (hasUnsavedChanges.value) {
    return 'Unsaved changes'
  }

  if (statusMessage.value && statusTone.value === 'success') {
    return statusMessage.value
  }

  return ''
})
const saveStateTone = computed<'default' | 'error'>(() => {
  return errorMessage.value ? 'error' : 'default'
})
const documentHeadings = computed(() => {
  return extractMarkdownHeadings(content.value)
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

  if (autosaveTimeout) {
    window.clearTimeout(autosaveTimeout)
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

async function handleSave(isAutosave = false): Promise<void> {
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
    showStatus(isAutosave ? 'Automatically saved' : 'Document saved', 'success')
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

function scheduleAutosave(): void {
  if (autosaveTimeout) {
    window.clearTimeout(autosaveTimeout)
  }

  if (!hasUnsavedChanges.value || isLoading.value || isSaving.value || !documentId.value) {
    return
  }

  autosaveTimeout = window.setTimeout(() => {
    autosaveTimeout = undefined

    if (!hasUnsavedChanges.value || isLoading.value || isSaving.value || !documentId.value) {
      return
    }

    void handleSave(true)
  }, 5000)
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

function toggleSidebar(): void {
  isSidebarOpen.value = !isSidebarOpen.value
}

function handleSelectHeading(id: string): void {
  workspace.value?.scrollToHeading(id)
}

function createExportFilename(extension: 'md' | 'pdf'): string {
  const baseName = (name.value.trim() || 'untitled-document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${baseName || 'untitled-document'}.${extension}`
}

function downloadFile(contentValue: BlobPart, filename: string, mimeType: string): void {
  const blob = new Blob([contentValue], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function handleExportMarkdown(): void {
  downloadFile(content.value, createExportFilename('md'), 'text/markdown;charset=utf-8')
  showStatus('Markdown exported', 'success')
}

function normalizeInlineText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function getInlineText(token: { content: string; children?: Array<{ content: string }> }): string {
  if (token.children && token.children.length > 0) {
    const text = token.children.map((child) => child.content ?? '').join('')
    return normalizeInlineText(text)
  }

  return normalizeInlineText(token.content ?? '')
}

function createPdfWriter(pdf: jsPDF) {
  const margin = 48
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const usableWidth = pageWidth - margin * 2
  let cursorY = margin

  function ensureSpace(height: number): void {
    if (cursorY + height <= pageHeight - margin) {
      return
    }

    pdf.addPage()
    cursorY = margin
  }

  function writeLines(
    lines: string[],
    options: {
      font: 'helvetica' | 'courier'
      style: 'normal' | 'bold' | 'italic' | 'bolditalic'
      size: number
      color?: [number, number, number]
      indent?: number
      lineHeight?: number
      gapAfter?: number
    },
  ): void {
    const indent = options.indent ?? 0
    const lineHeight = options.lineHeight ?? options.size * 1.45
    const x = margin + indent
    const maxWidth = usableWidth - indent

    pdf.setFont(options.font, options.style)
    pdf.setFontSize(options.size)
    pdf.setTextColor(...(options.color ?? [17, 24, 39]))

    const wrappedLines = lines.flatMap((line) => {
      const segments = pdf.splitTextToSize(line, maxWidth) as string[]
      return segments.length > 0 ? segments : ['']
    })

    ensureSpace(wrappedLines.length * lineHeight)

    for (const line of wrappedLines) {
      pdf.text(line, x, cursorY)
      cursorY += lineHeight
    }

    cursorY += options.gapAfter ?? 8
  }

  function writeParagraph(text: string): void {
    if (!text) {
      cursorY += 8
      return
    }

    writeLines([text], {
      font: 'helvetica',
      style: 'normal',
      size: 12,
      gapAfter: 10,
    })
  }

  function writeHeading(text: string, level: number): void {
    const sizeByLevel = [26, 22, 18, 16, 14, 13]
    const size = sizeByLevel[level - 1] ?? 13

    cursorY += level === 1 ? 0 : 6
    writeLines([text], {
      font: 'helvetica',
      style: 'bold',
      size,
      lineHeight: size * 1.3,
      gapAfter: 10,
    })
  }

  function writeListItem(text: string, orderedIndex?: number): void {
    const marker = orderedIndex ? `${orderedIndex}.` : '\u2022'
    const indent = orderedIndex ? 22 : 18

    writeLines([`${marker} ${text}`], {
      font: 'helvetica',
      style: 'normal',
      size: 12,
      indent,
      gapAfter: 4,
    })
  }

  function writeQuote(text: string): void {
    writeLines([text], {
      font: 'helvetica',
      style: 'italic',
      size: 12,
      color: [75, 85, 99],
      indent: 18,
      gapAfter: 10,
    })
  }

  function writeCodeBlock(text: string): void {
    const codeLines = text.replace(/\t/g, '  ').split('\n')
    writeLines(codeLines, {
      font: 'courier',
      style: 'normal',
      size: 10,
      color: [31, 41, 55],
      indent: 12,
      lineHeight: 14,
      gapAfter: 12,
    })
  }

  return {
    writeParagraph,
    writeHeading,
    writeListItem,
    writeQuote,
    writeCodeBlock,
  }
}

async function handleExportPdf(): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    })
    const writer = createPdfWriter(pdf)
    const tokens = parseMarkdown(content.value)
    let orderedListIndex = 0

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index]

      if (!token) {
        continue
      }

      if (token.type === 'heading_open') {
        const inlineToken = tokens[index + 1]
        const level = Number.parseInt(token.tag.replace('h', ''), 10) || 1
        if (inlineToken) {
          writer.writeHeading(getInlineText(inlineToken), level)
        }
        continue
      }

      if (token.type === 'paragraph_open') {
        const inlineToken = tokens[index + 1]
        if (inlineToken) {
          writer.writeParagraph(getInlineText(inlineToken))
        }
        continue
      }

      if (token.type === 'bullet_list_open') {
        orderedListIndex = 0
        continue
      }

      if (token.type === 'ordered_list_open') {
        orderedListIndex = 1
        continue
      }

      if (token.type === 'list_item_open') {
        const inlineToken = tokens[index + 2]
        if (inlineToken?.type === 'inline') {
          writer.writeListItem(getInlineText(inlineToken), orderedListIndex || undefined)
          if (orderedListIndex > 0) {
            orderedListIndex += 1
          }
        }
        continue
      }

      if (token.type === 'blockquote_open') {
        const inlineToken = tokens[index + 2]
        if (inlineToken?.type === 'inline') {
          writer.writeQuote(getInlineText(inlineToken))
        }
        continue
      }

      if (token.type === 'fence' || token.type === 'code_block') {
        writer.writeCodeBlock(token.content)
      }
    }

    pdf.save(createExportFilename('pdf'))
    showStatus('PDF exported', 'success')
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Unable to export PDF', 'error')
  }
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

watch([name, content], () => {
  scheduleAutosave()
})
</script>

<template>
  <main class="flex min-h-screen flex-col bg-background text-foreground">
    <EditorHeader
      :title="name"
      :is-saving="isSaving"
      :save-state-label="saveStateLabel"
      :save-state-tone="saveStateTone"
      :sidebar-open="isSidebarOpen"
      @back="handleBack"
      @export-markdown="handleExportMarkdown"
      @export-pdf="handleExportPdf"
      @toggle-sidebar="toggleSidebar"
      @update-title="name = $event"
      @preview="openPreview"
      @save="handleSave"
    />

    <div class="flex min-h-0 flex-1 overflow-hidden">
      <DocumentOutlineSidebar
        :document-title="name"
        :headings="documentHeadings"
        :is-open="isSidebarOpen"
        @toggle="toggleSidebar"
        @select="handleSelectHeading"
      />

      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <EditorToolbar
          @insert="workspace?.insertAtCursor($event)"
          @wrap="workspace?.insertMarkdown($event.before, $event.after)"
        />

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
      </div>
    </div>

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
