<script setup lang="ts">
import UserMenu from '@/components/app/UserMenu.vue'
import ChangePasswordDialog from '@/features/profile/components/ChangePasswordDialog.vue'
import DeleteAccountDialog from '@/features/profile/components/DeleteAccountDialog.vue'
import PendingEmailChangeDialog from '@/features/profile/components/PendingEmailChangeDialog.vue'
import ProfileDangerZone from '@/features/profile/components/ProfileDangerZone.vue'
import ProfileDetailsForm from '@/features/profile/components/ProfileDetailsForm.vue'
import ProfileFeedbackBanner from '@/features/profile/components/ProfileFeedbackBanner.vue'
import ProfileSecuritySection from '@/features/profile/components/ProfileSecuritySection.vue'
import ProfileSummaryCard from '@/features/profile/components/ProfileSummaryCard.vue'
import { useProfileSettings } from '@/features/profile/composables/useProfileSettings'

const {
  closeDeleteDialog,
  closePasswordDialog,
  closePendingEmailDialog,
  displayName,
  documentCount,
  feedbackMessage,
  feedbackTone,
  formData,
  goBack,
  handleCancelEditing,
  handleCancelPendingEmailAndContinue,
  handleChangePassword,
  handleDeleteAccount,
  handleSaveProfile,
  handleWaitForPendingEmailVerification,
  initials,
  isChangingPassword,
  isDeletingAccount,
  isEditing,
  isLoading,
  isResolvingPendingEmailChange,
  isSavingProfile,
  joinedDate,
  openDeleteDialog,
  openPasswordDialog,
  openPendingEmailDialog,
  passwordData,
  pendingEmail,
  showDeleteDialog,
  showPasswordDialog,
  showPendingEmailDialog,
  signOutAndReturnHome,
  startEditing,
  user,
} = useProfileSettings()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="border-b border-border bg-card px-4 py-3 sm:px-6">
      <div class="mx-auto flex max-w-6xl items-center gap-3">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @click="goBack"
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
          <span class="hidden sm:inline">Back to Documents</span>
        </button>

        <h1 class="flex-1 text-lg font-semibold">Profile Settings</h1>

        <UserMenu />
      </div>
    </header>

    <main class="flex-1 overflow-auto p-4 sm:p-6">
      <div class="mx-auto max-w-4xl space-y-6">
        <ProfileFeedbackBanner
          v-if="feedbackMessage"
          :message="feedbackMessage"
          :tone="feedbackTone"
        />

        <section
          v-if="isLoading"
          class="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-sm"
        >
          Loading profile...
        </section>

        <template v-else-if="user">
          <ProfileSummaryCard
            :display-name="displayName"
            :document-count="documentCount"
            :email="user.email ?? ''"
            :initials="initials"
            :joined-date="joinedDate"
            :pending-email="pendingEmail"
            @resolve-pending="openPendingEmailDialog"
            @wait="handleWaitForPendingEmailVerification"
          />

          <ProfileDetailsForm
            v-model:form-data="formData"
            :is-editing="isEditing"
            :is-resolving-pending-email-change="isResolvingPendingEmailChange"
            :is-saving-profile="isSavingProfile"
            @cancel="handleCancelEditing"
            @edit="startEditing"
            @save="handleSaveProfile"
          />

          <ProfileSecuritySection @open-password="openPasswordDialog" />
          <ProfileDangerZone @open-delete="openDeleteDialog" />
        </template>

        <section
          v-else
          class="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-sm"
        >
          <p>You are not signed in.</p>
          <button
            type="button"
            class="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="signOutAndReturnHome"
          >
            Return Home
          </button>
        </section>
      </div>
    </main>

    <PendingEmailChangeDialog
      :email="user?.email ?? ''"
      :is-pending="isResolvingPendingEmailChange"
      :pending-email="pendingEmail"
      :visible="showPendingEmailDialog"
      @cancel-pending="handleCancelPendingEmailAndContinue"
      @close="closePendingEmailDialog"
      @wait="handleWaitForPendingEmailVerification"
    />

    <ChangePasswordDialog
      v-model:password-data="passwordData"
      :is-changing-password="isChangingPassword"
      :visible="showPasswordDialog"
      @change="handleChangePassword"
      @close="closePasswordDialog"
    />

    <DeleteAccountDialog
      :is-deleting-account="isDeletingAccount"
      :visible="showDeleteDialog"
      @close="closeDeleteDialog"
      @confirm="handleDeleteAccount"
    />
  </div>
</template>
