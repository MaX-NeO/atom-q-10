import { create } from 'zustand'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    quizReminders: boolean
  }
  quizSettings: {
    defaultDifficulty: 'EASY' | 'MEDIUM' | 'HARD'
    showTimer: boolean
    autoSave: boolean
  }
}

interface UserPreferencesActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: string) => void
  updateNotifications: (notifications: Partial<UserPreferences['notifications']>) => void
  updateQuizSettings: (settings: Partial<UserPreferences['quizSettings']>) => void
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    quizReminders: true,
  },
  quizSettings: {
    defaultDifficulty: 'MEDIUM',
    showTimer: true,
    autoSave: true,
  },
}

export const useUserPreferencesStore = create<UserPreferences & UserPreferencesActions>(
  (set, get) => ({
    ...defaultPreferences,

    setTheme: (theme) => {
      set({ theme })
      // Save to localStorage
      localStorage.setItem('user-preferences', JSON.stringify({ ...get(), theme }))
    },

    setLanguage: (language) => {
      set({ language })
      localStorage.setItem('user-preferences', JSON.stringify({ ...get(), language }))
    },

    updateNotifications: (notifications) => {
      set((state) => ({
        notifications: { ...state.notifications, ...notifications }
      }))
      localStorage.setItem('user-preferences', JSON.stringify(get()))
    },

    updateQuizSettings: (settings) => {
      set((state) => ({
        quizSettings: { ...state.quizSettings, ...settings }
      }))
      localStorage.setItem('user-preferences', JSON.stringify(get()))
    },

    resetPreferences: () => {
      set(defaultPreferences)
      localStorage.removeItem('user-preferences')
    },
  })
)

// Load preferences from localStorage on initialization
if (typeof window !== 'undefined') {
  const savedPreferences = localStorage.getItem('user-preferences')
  if (savedPreferences) {
    try {
      const parsed = JSON.parse(savedPreferences)
      useUserPreferencesStore.setState(parsed)
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    }
  }
}