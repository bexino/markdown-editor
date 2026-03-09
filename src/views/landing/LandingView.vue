<script setup lang="ts">
import BenefitCard from '@/components/landing/BenefitCard.vue'
import { useRouter } from 'vue-router'

import FeatureCard from '@/components/landing/FeatureCard.vue'
import { benefits, featureCards } from '@/data/landing'

const router = useRouter()

async function navigateTo(path: string): Promise<void> {
  await router.push(path)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20 text-foreground">
    <header class="sticky top-0 z-50 border-b bg-card/50 backdrop-blur-sm">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <div class="flex items-center gap-2">
          <svg
            class="size-8 text-primary"
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
          <span class="text-2xl font-bold">MarkdownPro</span>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            @click="navigateTo('/signin')"
          >
            Log In
          </button>
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="navigateTo('/register')"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h1
          class="mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl"
        >
          Write Markdown with Confidence
        </h1>
        <p class="mb-8 text-lg text-muted-foreground md:text-xl">
          The most powerful and intuitive markdown editor. Create, edit, and preview your documents
          with live rendering and beautiful syntax highlighting.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            class="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="navigateTo('/register')"
          >
            Start Writing Free
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
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            @click="navigateTo('/signin')"
          >
            Sign In
          </button>
        </div>
      </div>

      <div class="mt-16 overflow-hidden rounded-xl border-2 bg-card shadow-2xl">
        <div
          class="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
        >
          <div class="p-8 text-center">
            <svg
              class="mx-auto mb-4 size-24 text-primary/40"
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
            <p class="text-muted-foreground">Split-pane editor with live preview</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-muted/30 py-16 md:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Everything You Need</h2>
          <p class="mx-auto max-w-2xl text-lg text-muted-foreground">
            Powerful features designed for writers, developers, and content creators
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            v-for="feature in featureCards"
            :key="feature.title"
            :title="feature.title"
            :description="feature.description"
          >
            <template #icon>
              <svg
                v-if="feature.icon === 'eye'"
                class="size-6 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else-if="feature.icon === 'code'"
                class="size-6 text-primary"
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
                v-else-if="feature.icon === 'zap'"
                class="size-6 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
              </svg>
              <svg
                v-else-if="feature.icon === 'save'"
                class="size-6 text-primary"
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
              <svg
                v-else-if="feature.icon === 'smartphone'"
                class="size-6 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
              <svg
                v-else
                class="size-6 text-primary"
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
            </template>
          </FeatureCard>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 class="mb-6 text-3xl font-bold md:text-4xl">Why Choose MarkdownPro?</h2>
            <div class="space-y-4">
              <BenefitCard
                v-for="benefit in benefits"
                :key="benefit.title"
                :title="benefit.title"
                :description="benefit.description"
              />
            </div>
          </div>

          <div class="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 lg:p-12">
            <div class="space-y-6">
              <div class="rounded-lg border bg-card p-4">
                <div class="mb-2 flex items-center gap-2">
                  <div class="size-3 rounded-full bg-primary"></div>
                  <span class="font-mono text-sm text-muted-foreground">editor.md</span>
                </div>
                <div class="space-y-1 font-mono text-sm">
                  <div class="text-primary"># Hello World</div>
                  <div class="text-muted-foreground">This is **markdown**</div>
                </div>
              </div>
              <div class="rounded-lg border bg-card p-4">
                <div class="mb-2 text-2xl font-bold">Hello World</div>
                <div class="text-muted-foreground">This is <strong>markdown</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-primary py-16 text-primary-foreground md:py-24">
      <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Writing?</h2>
        <p class="mb-8 text-lg opacity-90">
          Join thousands of writers using MarkdownPro to create beautiful documents
        </p>
        <button
          type="button"
          class="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-secondary px-6 py-3 text-base font-medium text-secondary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          @click="navigateTo('/register')"
        >
          Create Free Account
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
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>

    <footer class="border-t bg-card py-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div class="flex items-center gap-2">
            <svg
              class="size-6 text-primary"
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
            <span class="font-semibold">MarkdownPro</span>
          </div>
          <p class="text-sm text-muted-foreground">© 2026 MarkdownPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
