<script setup lang="ts">
import ActionMenu from '@/features/documents/components/ActionMenu.vue'
import type { FolderRecord } from '@/features/documents/services/folderStorage'

defineProps<{
  folder: FolderRecord
  formattedCreatedAt: string
  isPinned: boolean
}>()

const emit = defineEmits<{
  open: [id: string]
  togglePin: [id: string]
  rename: [id: string]
  delete: [id: string]
}>()
</script>

<template>
  <article
    class="group cursor-pointer rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-ring"
    tabindex="0"
    @click="emit('open', folder.id)"
    @keydown.enter.prevent="emit('open', folder.id)"
    @keydown.space.prevent="emit('open', folder.id)"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <svg
          class="size-5 shrink-0 text-amber-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
        <h3 class="truncate font-semibold">{{ folder.name }}</h3>
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

      <div class="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <ActionMenu
          ariaLabel="Folder actions"
          :items="[
            { id: 'pin', label: isPinned ? 'Unpin' : 'Pin' },
            { id: 'rename', label: 'Rename' },
            { id: 'delete', label: 'Delete', destructive: true },
          ]"
          @select="
            $event === 'pin'
              ? emit('togglePin', folder.id)
              : $event === 'rename'
              ? emit('rename', folder.id)
              : emit('delete', folder.id)
          "
        />
      </div>
    </div>

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
      <span>Created {{ formattedCreatedAt }}</span>
    </div>
  </article>
</template>
