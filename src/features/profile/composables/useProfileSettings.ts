import type { User } from '@supabase/supabase-js'

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getCurrentUser, logout } from '@/lib/auth'
import { documentStorage } from '@/lib/documentStorage'
import { createProfileForm, getUserDisplayName, getUserInitials } from '@/lib/userProfile'
import {
  cancelPendingEmailChange,
  changePassword,
  createPasswordForm,
  updateProfile,
} from '@/services/profileService'
import type { PasswordFormData, ProfileFeedbackTone, ProfileFormData } from '@/types/profile'

const joinedDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function useProfileSettings() {
  const router = useRouter()

  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const isEditing = ref(false)
  const isSavingProfile = ref(false)
  const isChangingPassword = ref(false)
  const isDeletingAccount = ref(false)
  const isResolvingPendingEmailChange = ref(false)
  const showDeleteDialog = ref(false)
  const showPasswordDialog = ref(false)
  const showPendingEmailDialog = ref(false)
  const documentCount = ref(0)
  const feedbackMessage = ref('')
  const feedbackTone = ref<ProfileFeedbackTone>('success')
  const formData = ref<ProfileFormData>({
    name: '',
    email: '',
  })
  const passwordData = ref<PasswordFormData>(createPasswordForm())

  const displayName = computed(() => getUserDisplayName(user.value))
  const initials = computed(() => getUserInitials(user.value))
  const confirmedEmail = computed(() => user.value?.email?.trim().toLowerCase() ?? '')
  const joinedDate = computed(() => {
    if (!user.value?.created_at) {
      return ''
    }

    return joinedDateFormatter.format(new Date(user.value.created_at))
  })
  const pendingEmail = computed(() => user.value?.new_email?.trim() ?? '')
  const hasPendingEmailChange = computed(() => pendingEmail.value.length > 0)
  const normalizedFormEmail = computed(() => formData.value.email.trim().toLowerCase())
  const isAttemptingSecondUnverifiedEmailChange = computed(
    () =>
      hasPendingEmailChange.value &&
      normalizedFormEmail.value.length > 0 &&
      normalizedFormEmail.value !== confirmedEmail.value &&
      normalizedFormEmail.value !== pendingEmail.value.trim().toLowerCase()
  )

  onMounted(() => {
    void loadProfile()
  })

  function setFeedback(message: string, tone: ProfileFeedbackTone): void {
    feedbackMessage.value = message
    feedbackTone.value = tone
  }

  function resetProfileForm(): void {
    if (!user.value) {
      formData.value = {
        name: '',
        email: '',
      }
      return
    }

    formData.value = createProfileForm(user.value)
  }

  function resetPasswordForm(): void {
    passwordData.value = createPasswordForm()
  }

  function startEditing(): void {
    isEditing.value = true
  }

  function closePasswordDialog(): void {
    showPasswordDialog.value = false
    resetPasswordForm()
  }

  function openPasswordDialog(): void {
    showPasswordDialog.value = true
  }

  function closeDeleteDialog(): void {
    showDeleteDialog.value = false
  }

  function openDeleteDialog(): void {
    showDeleteDialog.value = true
  }

  function closePendingEmailDialog(): void {
    showPendingEmailDialog.value = false
  }

  function openPendingEmailDialog(): void {
    showPendingEmailDialog.value = true
  }

  async function loadProfile(): Promise<void> {
    isLoading.value = true
    feedbackMessage.value = ''

    try {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        await router.replace('/signin')
        return
      }

      user.value = currentUser
      resetProfileForm()

      const documents = await documentStorage.getAll()
      documentCount.value = documents.length
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Unable to load your profile right now.',
        'error'
      )
    } finally {
      isLoading.value = false
    }
  }

  async function handleSaveProfile(): Promise<void> {
    if (!user.value) {
      return
    }

    if (isAttemptingSecondUnverifiedEmailChange.value) {
      showPendingEmailDialog.value = true
      return
    }

    isSavingProfile.value = true
    feedbackMessage.value = ''

    try {
      const updatedUser = await updateProfile(user.value, formData.value)
      user.value = updatedUser
      isEditing.value = false
      resetProfileForm()

      if (updatedUser.new_email) {
        setFeedback(
          `Profile updated. Confirm your new email at ${updatedUser.new_email} to finish the change.`,
          'success'
        )
        return
      }

      setFeedback('Profile updated successfully.', 'success')
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Unable to update your profile right now.',
        'error'
      )
    } finally {
      isSavingProfile.value = false
    }
  }

  async function handleCancelPendingEmailAndContinue(): Promise<void> {
    if (!user.value) {
      return
    }

    isResolvingPendingEmailChange.value = true
    feedbackMessage.value = ''

    try {
      const refreshedUser = await cancelPendingEmailChange({
        email: confirmedEmail.value,
      })

      user.value = refreshedUser
      showPendingEmailDialog.value = false

      const updatedUser = await updateProfile(refreshedUser, formData.value)
      user.value = updatedUser
      isEditing.value = false
      resetProfileForm()

      if (updatedUser.new_email) {
        setFeedback(
          `Previous email change canceled. Confirm your new email at ${updatedUser.new_email} to finish the updated change.`,
          'success'
        )
        return
      }

      setFeedback('Previous email change canceled. Profile updated successfully.', 'success')
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Unable to update your email right now.',
        'error'
      )
    } finally {
      isResolvingPendingEmailChange.value = false
    }
  }

  function handleWaitForPendingEmailVerification(): void {
    showPendingEmailDialog.value = false
    setFeedback(
      `Confirm ${pendingEmail.value} from your inbox before changing your email again.`,
      'error'
    )
  }

  function handleCancelEditing(): void {
    isEditing.value = false
    resetProfileForm()
  }

  async function handleChangePassword(): Promise<void> {
    isChangingPassword.value = true
    feedbackMessage.value = ''

    try {
      await changePassword(passwordData.value)
      showPasswordDialog.value = false
      resetPasswordForm()
      setFeedback('Password changed successfully.', 'success')
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Unable to change your password right now.',
        'error'
      )
    } finally {
      isChangingPassword.value = false
    }
  }

  async function handleDeleteAccount(): Promise<void> {
    isDeletingAccount.value = true

    try {
      throw new Error(
        'Account deletion is not configured yet. Add a secure server-side deletion endpoint to enable it.'
      )
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Unable to delete your account right now.',
        'error'
      )
      closeDeleteDialog()
    } finally {
      isDeletingAccount.value = false
    }
  }

  async function goBack(): Promise<void> {
    await router.push('/documents')
  }

  async function signOutAndReturnHome(): Promise<void> {
    await logout()
    await router.push('/')
  }

  return {
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
  }
}
