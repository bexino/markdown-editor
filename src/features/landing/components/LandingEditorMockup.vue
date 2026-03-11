<script setup lang="ts">
import '@/assets/markdown.css'

import EditorIcon from '@/features/documents/components/EditorIcon.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const mockToolbarGroups = [
  ['heading-1', 'heading-2'],
  ['bold', 'italic', 'code'],
  ['list', 'list-ordered', 'quote'],
  ['link', 'image', 'table'],
] as const
const mockupModes = ['light', 'dark'] as const
const activeMockupIndex = ref(0)

let mockupInterval: number | undefined

function getMockupThemeStyle(mode: (typeof mockupModes)[number]): Record<string, string> {
  if (mode === 'dark') {
    return {
      colorScheme: 'dark',
      '--background': '#111111',
      '--foreground': '#e5e5e5',
      '--card': '#171717',
      '--card-foreground': '#e5e5e5',
      '--popover': '#171717',
      '--popover-foreground': '#e5e5e5',
      '--primary': '#f5f5f5',
      '--primary-foreground': '#111111',
      '--secondary': '#262626',
      '--secondary-foreground': '#e5e5e5',
      '--muted': '#262626',
      '--muted-foreground': '#a3a3a3',
      '--accent': '#262626',
      '--accent-foreground': '#e5e5e5',
      '--destructive': '#7f1d1d',
      '--destructive-foreground': '#f5f5f5',
      '--border': '#2a2a2a',
      '--input': '#262626',
      '--input-background': '#1f1f1f',
      '--ring': '#525252',
    }
  }

  return {
    colorScheme: 'light',
    '--background': '#ffffff',
    '--foreground': '#030213',
    '--card': '#ffffff',
    '--card-foreground': '#030213',
    '--popover': '#ffffff',
    '--popover-foreground': '#030213',
    '--primary': '#030213',
    '--primary-foreground': '#ffffff',
    '--secondary': '#f1f5f9',
    '--secondary-foreground': '#030213',
    '--muted': '#ececf0',
    '--muted-foreground': '#717182',
    '--accent': '#e9ebef',
    '--accent-foreground': '#030213',
    '--destructive': '#d4183d',
    '--destructive-foreground': '#ffffff',
    '--border': 'rgba(0, 0, 0, 0.1)',
    '--input': 'transparent',
    '--input-background': '#f3f3f5',
    '--ring': '#b8b8c2',
  }
}

onMounted(() => {
  mockupInterval = window.setInterval(() => {
    activeMockupIndex.value = activeMockupIndex.value === mockupModes.length - 1 ? 0 : activeMockupIndex.value + 1
  }, 4000)
})

onBeforeUnmount(() => {
  if (mockupInterval) {
    window.clearInterval(mockupInterval)
  }
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
    <div
      class="flex w-[200%] transition-transform duration-700 ease-in-out"
      :style="{ transform: `translateX(-${activeMockupIndex * 50}%)` }"
    >
      <div
        v-for="mode in mockupModes"
        :key="mode"
        class="w-1/2 shrink-0"
        :style="getMockupThemeStyle(mode)"
        :class="'bg-card text-foreground'"
      >
        <div class="border-b border-border bg-card px-4 py-3">
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground"
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
              <span class="hidden sm:inline">Back</span>
            </button>

            <div class="flex min-w-0 flex-1 items-center gap-2">
              <span class="flex size-9 shrink-0 items-center justify-center text-muted-foreground">
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </span>
              <div class="flex h-10 w-full max-w-md items-center rounded-md border border-border bg-input-background px-3 font-mono text-sm text-foreground">
                editor.md
              </div>
              <p class="hidden shrink-0 text-sm text-muted-foreground md:block">
                Automatically saved
              </p>
            </div>

            <div class="ml-auto flex items-center gap-2">
              <div class="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground">
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span class="hidden sm:inline">Preview</span>
              </div>
              <div class="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground">
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8" />
                  <path d="M7 3v5h8" />
                </svg>
                <span class="hidden sm:inline">Save</span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-b border-border bg-muted/30 px-4 py-2">
          <div class="flex items-center gap-1 overflow-x-auto">
            <template v-for="(group, groupIndex) in mockToolbarGroups" :key="groupIndex">
              <button
                v-for="icon in group"
                :key="icon"
                type="button"
                class="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-2.5 text-muted-foreground"
              >
                <EditorIcon :name="icon" />
              </button>
              <div
                v-if="groupIndex < mockToolbarGroups.length - 1"
                class="mx-1 h-6 w-px shrink-0 bg-border"
              ></div>
            </template>
          </div>
        </div>

        <div class="hidden h-[420px] md:grid md:grid-cols-[1fr_10px_1fr]">
          <section class="relative flex min-w-0 flex-col overflow-hidden bg-background">
            <div
              class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
            >
              Markdown
            </div>
            <div class="h-full w-full px-4 py-4 font-mono text-sm leading-7 text-foreground">
              <p class="text-primary"># Hello World</p>
              <p>This is **markdown**</p>
              <p></p>
              <p>## Notes</p>
              <p>- Live preview</p>
              <p>- Syntax highlighting</p>
              <p>- Full-page preview</p>
            </div>
          </section>

          <div class="flex items-center justify-center bg-muted/40">
            <div class="h-10 w-1 rounded-full bg-border"></div>
          </div>

          <section class="relative flex min-w-0 flex-col overflow-hidden">
            <div
              class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
            >
              Preview
            </div>
            <div class="flex-1 overflow-hidden bg-muted/10 p-6">
              <div class="mx-auto max-w-3xl rounded-xl">
                <div class="prose max-w-none">
                  <h1>Hello World</h1>
                  <p>
                    This is <strong>markdown</strong>
                  </p>
                  <h2>Notes</h2>
                  <ul>
                    <li>Live preview</li>
                    <li>Syntax highlighting</li>
                    <li>Full-page preview</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="space-y-4 p-4 md:hidden">
          <section class="relative overflow-hidden rounded-xl border border-border bg-background">
            <div
              class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
            >
              Markdown
            </div>
            <div class="min-h-[220px] px-4 py-4 font-mono text-sm leading-7 text-foreground">
              <p class="text-primary"># Hello World</p>
              <p>This is **markdown**</p>
              <p></p>
              <p>## Notes</p>
              <p>- Live preview</p>
              <p>- Syntax highlighting</p>
              <p>- Full-page preview</p>
            </div>
          </section>

          <section class="relative overflow-hidden rounded-xl border border-border bg-muted/10">
            <div
              class="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
            >
              Preview
            </div>
            <div class="p-6">
              <div class="prose max-w-none">
                <h1>Hello World</h1>
                <p>
                  This is <strong>markdown</strong>
                </p>
                <h2>Notes</h2>
                <ul>
                  <li>Live preview</li>
                  <li>Syntax highlighting</li>
                  <li>Full-page preview</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
