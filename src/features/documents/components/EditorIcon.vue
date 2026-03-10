<script setup lang="ts">
defineProps<{
  name:
    | 'arrow-left'
    | 'save'
    | 'eye'
    | 'file-text'
    | 'heading-1'
    | 'heading-2'
    | 'bold'
    | 'italic'
    | 'code'
    | 'list'
    | 'list-ordered'
    | 'quote'
    | 'link'
    | 'image'
    | 'table'
    | 'sidebar'
    | 'download'
    | 'chevron-down'
    | 'chevron-right'
}>()
</script>

<template>
  <svg
    v-if="name === 'arrow-left'"
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

  <svg
    v-else-if="name === 'save'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>

  <svg
    v-else-if="name === 'eye'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>

  <svg
    v-else-if="name === 'file-text'"
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

  <svg
    v-else-if="name === 'heading-1'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="m17 12 3-2v8" />
  </svg>

  <svg
    v-else-if="name === 'heading-2'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 13.5a2.5 2.5 0 1 1 3.91 2.09L17 19h4" />
  </svg>

  <svg
    v-else-if="name === 'bold'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
    <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
  </svg>

  <svg
    v-else-if="name === 'italic'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M19 4h-9" />
    <path d="M14 20H5" />
    <path d="M15 4 9 20" />
  </svg>

  <svg
    v-else-if="name === 'code'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </svg>

  <svg
    v-else-if="name === 'list'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>

  <svg
    v-else-if="name === 'list-ordered'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M10 6h11" />
    <path d="M10 12h11" />
    <path d="M10 18h11" />
    <path d="M4 10V6l-1 1" />
    <path d="M4 18h-1.5a.5.5 0 0 1-.5-.5v-.5a2 2 0 1 1 4 0V18H2" />
  </svg>

  <svg
    v-else-if="name === 'quote'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M3 21c3 0 7-1 7-8V5l-7 4v4h4" />
    <path d="M14 21c3 0 7-1 7-8V5l-7 4v4h4" />
  </svg>

  <svg
    v-else-if="name === 'link'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.8 5" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12.2 19" />
  </svg>

  <svg
    v-else-if="name === 'download'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </svg>

  <svg
    v-else-if="name === 'table'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M3 10h18" />
    <path d="M10 3v18" />
    <path d="M16 3v18" />
  </svg>

  <svg
    v-else-if="name === 'sidebar'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="M14 8h3" />
    <path d="M14 12h3" />
    <path d="M14 16h3" />
  </svg>

  <svg
    v-else-if="name === 'chevron-down'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>

  <svg
    v-else-if="name === 'chevron-right'"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m9 6 6 6-6 6" />
  </svg>

  <svg
    v-else
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
</template>
