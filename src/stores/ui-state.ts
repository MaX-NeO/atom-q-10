import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  loadingMessage: string
}

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  duration?: number
}

interface DialogState {
  isOpen: boolean
  title: string
  content: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
}

interface UIState {
  // Loading states
  loading: LoadingState
  
  // Toast notifications
  toasts: ToastMessage[]
  
  // Dialog states
  dialog: DialogState
  
  // Sidebar states
  sidebar: {
    isOpen: boolean
    isCollapsed: boolean
  }
  
  // Actions
  setLoading: (isLoading: boolean, message?: string) => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  showDialog: (dialog: Omit<DialogState, 'isOpen'>) => void
  hideDialog: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  loading: {
    isLoading: false,
    loadingMessage: '',
  },
  
  toasts: [],
  
  dialog: {
    isOpen: false,
    title: '',
    content: null,
  },
  
  sidebar: {
    isOpen: true,
    isCollapsed: false,
  },

  setLoading: (isLoading, message = '') => {
    set({
      loading: {
        isLoading,
        loadingMessage: message,
      },
    })
  },

  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast,
    }
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, newToast.duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  showDialog: (dialog) => {
    set({
      dialog: {
        isOpen: true,
        ...dialog,
      },
    })
  },

  hideDialog: () => {
    set((state) => ({
      dialog: {
        ...state.dialog,
        isOpen: false,
      },
    }))
  },

  toggleSidebar: () => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        isOpen: !state.sidebar.isOpen,
      },
    }))
  },

  setSidebarCollapsed: (collapsed) => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        isCollapsed: collapsed,
      },
    }))
  },
}))