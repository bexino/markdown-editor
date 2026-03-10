import { createRouter, createWebHistory } from 'vue-router'
import DocumentsView from '@/features/documents/pages/DocumentsPage.vue'
import EditorView from '@/features/documents/pages/EditorPage.vue'
import ProfileView from '@/features/profile/pages/ProfilePage.vue'
import AuthCallbackView from '@/features/auth/pages/AuthCallbackPage.vue'
import ForgotPasswordView from '@/features/auth/pages/ForgotPasswordPage.vue'
import RegisterView from '@/features/auth/pages/RegisterPage.vue'
import ResetPasswordView from '@/features/auth/pages/ResetPasswordPage.vue'
import SignInView from '@/features/auth/pages/SignInPage.vue'
import LandingView from '@/features/landing/pages/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/documents',
      name: 'documents',
      component: DocumentsView,
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallbackView,
    },
    {
      path: '/auth/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },
  ],
})

export default router
