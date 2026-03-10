<script setup lang="ts">
import UserMenu from '@/shared/components/UserMenu.vue'

import EditorIcon from '@/features/documents/components/EditorIcon.vue'
import ExportMenu from '@/features/documents/components/ExportMenu.vue'

defineProps<{
  title: string
  isSaving: boolean
  saveStateLabel?: string
  saveStateTone?: 'default' | 'error'
  sidebarOpen: boolean
}>()

const emit = defineEmits<{
  back: []
  toggleSidebar: []
  updateTitle: [value: string]
  preview: []
  save: []
  exportMarkdown: []
  exportPdf: []
}>()
</script>

<template>
  <header class="border-b border-border bg-card px-4 py-3">
    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('back')"
      >
        <EditorIcon name="arrow-left" />
        <span class="hidden sm:inline">Back</span>
      </button>

      <button
        type="button"
        class="hidden h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
        @click="emit('toggleSidebar')"
      >
        <EditorIcon name="sidebar" />
        <span class="hidden lg:inline">{{ sidebarOpen ? 'Hide outline' : 'Show outline' }}</span>
      </button>

      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <EditorIcon name="file-text" />
        </span>
        <input
          :value="title"
          type="text"
          placeholder="Document name..."
          class="h-10 w-full max-w-md rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @input="emit('updateTitle', ($event.target as HTMLInputElement).value)"
        />
        <p
          v-if="saveStateLabel"
          class="hidden shrink-0 text-sm md:block"
          :class="saveStateTone === 'error' ? 'text-destructive' : 'text-muted-foreground'"
        >
          {{ saveStateLabel }}
        </p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <ExportMenu @markdown="emit('exportMarkdown')" @pdf="emit('exportPdf')" />

        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @click="emit('preview')"
        >
          <EditorIcon name="eye" />
          <span class="hidden sm:inline">Preview</span>
        </button>

        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
          @click="emit('save')"
        >
          <EditorIcon name="save" />
          <span class="hidden sm:inline">{{ isSaving ? 'Saving...' : 'Save' }}</span>
        </button>

        <UserMenu />
      </div>
    </div>
  </header>
</template>
