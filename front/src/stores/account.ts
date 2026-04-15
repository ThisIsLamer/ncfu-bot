import { defineStore } from 'pinia'

export type UserRole = 'student' | 'organizer' | 'admin'
export type ThemeMode = 'light' | 'dark'

export interface UserAccount {
  id: string
  firstName: string
  lastName: string
  institute: string
  course: number | null
  role: UserRole
  avatarUrl: string | null
  theme: ThemeMode
}

export const useAccountStore = defineStore('account', {
  state: (): { user: UserAccount } => ({
    user: {
      id: 'user-001',
      firstName: 'Иван',
      lastName: 'Иванов',
      institute: 'Институт информационных технологий',
      course: 3,
      role: 'student',
      avatarUrl: null,
      theme: 'dark',
    },
  }),

  getters: {
    fullName: state => `${state.user.firstName} ${state.user.lastName}`,
    isStudent: state => state.user.role === 'student',
    isOrganizer: state => state.user.role === 'organizer',
    isAdmin: state => state.user.role === 'admin',
  },

  actions: {
    setRole (role: UserRole) {
      this.user.role = role
    },
    toggleTheme () {
      this.user.theme = this.user.theme === 'dark' ? 'light' : 'dark'
    },
  },
})
