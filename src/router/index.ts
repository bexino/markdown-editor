import { createRouter, createWebHistory } from 'vue-router'
import DocumentsView from '@/features/documents/pages/DocumentsPage.vue'
import EditorView from '@/features/documents/pages/EditorPage.vue'
import PreviewView from '@/features/documents/pages/PreviewPage.vue'
import ProfileView from '@/features/profile/pages/ProfilePage.vue'
import AuthCallbackView from '@/features/auth/pages/AuthCallbackPage.vue'
import ForgotPasswordView from '@/features/auth/pages/ForgotPasswordPage.vue'
import RegisterView from '@/features/auth/pages/RegisterPage.vue'
import ResetPasswordView from '@/features/auth/pages/ResetPasswordPage.vue'
import SignInView from '@/features/auth/pages/SignInPage.vue'
import LandingView from '@/features/landing/pages/LandingPage.vue'
import ForbiddenView from '@/shared/pages/ForbiddenPage.vue'
import { getSession } from '@/shared/lib/auth'
import NotFoundView from '@/shared/pages/NotFoundPage.vue'
import UnauthorizedView from '@/shared/pages/UnauthorizedPage.vue'

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
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView,
    },
    {
      path: '/documents',
      name: 'documents',
      component: DocumentsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: EditorView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/preview/:id',
      name: 'preview',
      component: PreviewView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true,
      },
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
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    return true
  }

  const session = await getSession()

  if (session) {
    return true
  }

  return {
    name: 'unauthorized',
    query: {
      redirect: to.fullPath,
    },
  }
})

export default router
