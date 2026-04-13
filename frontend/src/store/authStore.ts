'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken',  accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        // Write cookie so Next.js middleware can read it server-side
        document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`
        set({ user, accessToken, refreshToken })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // Clear middleware cookie
        document.cookie = 'accessToken=; path=/; max-age=0'
        set({ user: null, accessToken: null, refreshToken: null })
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    { name: 'auth-storage', partialize: s => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
)
