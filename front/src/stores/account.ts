import type { UserResponse } from '@/api/types'
import { defineStore } from 'pinia'
import { isApiError, usersApi } from '@/api'

export type UserRole = 'student' | 'organizer' | 'admin'
export type AuthState = 'loading' | 'authenticated' | 'not-registered' | 'error'

export const useAccountStore = defineStore('account', {
  state: (): { user: UserResponse | null, authState: AuthState } => ({
    user: null,
    authState: 'loading',
  }),

  getters: {
    fullName: state => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    isStudent: state => state.user?.role === 'user' || state.user?.role === 'student',
    isOrganizer: state => state.user?.role === 'organizer',
    isAdmin: state => state.user?.role === 'admin',
    isAuthenticated: state => state.authState === 'authenticated',
    isNotRegistered: state => state.authState === 'not-registered',
  },

  actions: {
    async fetchAccount () {
      this.authState = 'loading'
      const result = await usersApi.getAccount()

      if (isApiError(result)) {
        this.authState = result.response?.status === 401 ? 'not-registered' : 'error'
        return
      }

      this.user = result.data
      this.authState = 'authenticated'
    },

    async register (guid: string) {
      const result = await usersApi.register({ guid })
      if (isApiError(result)) {
        return false
      }
      await this.fetchAccount()
      return this.authState === 'authenticated'
    },

    setRole (role: UserRole) {
      if (this.user) {
        this.user.role = role
      }
    },

    toggleTheme () {
      if (this.user) {
        this.user.theme = this.user.theme === 'dark' ? 'light' : 'dark'
      }
    },
  },
})
