import { toast } from "sonner"

// Toast types
export type ToastType = "success" | "error" | "warning" | "info" | "loading"

// Toast options interface
export interface ToastOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  description?: string
}

// Enhanced toast functions with better styling
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 3000,
    })
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 5000,
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
    })
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 3000,
    })
  },

  loading: (message: string, options?: ToastOptions) => {
    toast.loading(message, {
      description: options?.description,
      duration: options?.duration || 10000,
    })
  },

  // Dismiss all toasts
  dismiss: () => {
    toast.dismiss()
  },

  // Dismiss a specific toast
  dismissById: (id: string | number) => {
    toast.dismiss(id)
  }
}

// Admin action toasts
export const adminToasts = {
  // User management
  userCreated: (userName: string) => {
    showToast.success(`User "${userName}" created successfully`)
  },

  userUpdated: (userName: string) => {
    showToast.success(`User "${userName}" updated successfully`)
  },

  userDeleted: (userName: string) => {
    showToast.success(`User "${userName}" deleted successfully`)
  },

  userActivated: (userName: string) => {
    showToast.success(`User "${userName}" activated successfully`)
  },

  userDeactivated: (userName: string) => {
    showToast.warning(`User "${userName}" deactivated`)
  },

  // Quiz management
  quizCreated: (quizTitle: string) => {
    showToast.success(`Quiz "${quizTitle}" created successfully`)
  },

  quizUpdated: (quizTitle: string) => {
    showToast.success(`Quiz "${quizTitle}" updated successfully`)
  },

  quizDeleted: (quizTitle: string) => {
    showToast.success(`Quiz "${quizTitle}" deleted successfully`)
  },

  quizPublished: (quizTitle: string) => {
    showToast.success(`Quiz "${quizTitle}" published successfully`)
  },

  quizUnpublished: (quizTitle: string) => {
    showToast.warning(`Quiz "${quizTitle}" unpublished`)
  },

  // Question management
  questionAdded: (questionTitle: string) => {
    showToast.success(`Question "${questionTitle}" added successfully`)
  },

  questionUpdated: (questionTitle: string) => {
    showToast.success(`Question "${questionTitle}" updated successfully`)
  },

  questionDeleted: (questionTitle: string) => {
    showToast.success(`Question "${questionTitle}" deleted successfully`)
  },

  questionReordered: () => {
    showToast.success("Questions reordered successfully")
  },

  // Category management
  categoryCreated: (categoryName: string) => {
    showToast.success(`Category "${categoryName}" created successfully`)
  },

  categoryUpdated: (categoryName: string) => {
    showToast.success(`Category "${categoryName}" updated successfully`)
  },

  categoryDeleted: (categoryName: string) => {
    showToast.success(`Category "${categoryName}" deleted successfully`)
  },

  // Settings
  settingsUpdated: () => {
    showToast.success("Settings updated successfully")
  },

  maintenanceModeEnabled: () => {
    showToast.warning("Maintenance mode enabled")
  },

  maintenanceModeDisabled: () => {
    showToast.success("Maintenance mode disabled")
  },

  // Analytics
  analyticsLoaded: () => {
    showToast.success("Analytics loaded successfully")
  },

  // General admin actions
  actionCompleted: (action: string) => {
    showToast.success(`${action} completed successfully`)
  },

  actionFailed: (action: string, error?: string) => {
    showToast.error(`${action} failed`, {
      description: error
    })
  },

  // User enrollment management
  usersEnrolled: (count: number) => {
    showToast.success(`${count} user(s) enrolled successfully`)
  },

  userUnenrolled: () => {
    showToast.success("User unenrolled successfully")
  }
}

// User action toasts
export const userToasts = {
  // Authentication
  loginSuccess: () => {
    showToast.success("Login successful")
  },

  loginFailed: (error?: string) => {
    showToast.error("Login failed", {
      description: error
    })
  },

  registrationSuccess: () => {
    showToast.success("Registration successful")
  },

  registrationFailed: (error?: string) => {
    showToast.error("Registration failed", {
      description: error
    })
  },

  logoutSuccess: () => {
    showToast.success("Logged out successfully")
  },

  // Quiz actions
  quizStarted: (quizTitle: string) => {
    showToast.info(`Quiz "${quizTitle}" started`)
  },

  quizSubmitted: (quizTitle: string) => {
    showToast.success(`Quiz "${quizTitle}" submitted successfully`)
  },

  quizCompleted: (quizTitle: string, score: number) => {
    showToast.success(`Quiz "${quizTitle}" completed! Score: ${score}%`)
  },

  quizTimeExpired: (quizTitle: string) => {
    showToast.warning(`Time expired for quiz "${quizTitle}"`)
  },

  quizSaved: () => {
    showToast.success("Quiz progress saved")
  },

  // Profile actions
  profileUpdated: () => {
    showToast.success("Profile updated successfully")
  },

  passwordChanged: () => {
    showToast.success("Password changed successfully")
  },

  avatarUpdated: () => {
    toast.success("Avatar updated successfully! 📸")
  },

  passwordChanged: () => {
    toast.success("Password changed successfully! 🔐")
  },

  // General user actions
  actionSuccess: (action: string) => {
    showToast.success(`${action} completed successfully`)
  },

  actionError: (action: string, error?: string) => {
    showToast.error(`${action} failed`, {
      description: error
    })
  }
}

// Network and API toasts
export const networkToasts = {
  requestSuccess: (endpoint: string) => {
    showToast.info(`Request to ${endpoint} successful`)
  },

  requestError: (endpoint: string, error?: string) => {
    showToast.error(`Request to ${endpoint} failed`, {
      description: error
    })
  },

  networkError: () => {
    showToast.error("Network error. Please check your connection")
  },

  serverError: () => {
    showToast.error("Server error. Please try again later")
  },

  unauthorized: () => {
    showToast.error("Unauthorized access. Please login again")
  },

  forbidden: () => {
    showToast.error("Access denied. You don't have permission")
  }
}

// Form validation toasts
export const formToasts = {
  validationError: (field: string, message: string) => {
    showToast.error(`Validation error in ${field}`, {
      description: message
    })
  },

  requiredField: (fieldName: string) => {
    showToast.warning(`${fieldName} is required`)
  },

  invalidEmail: () => {
    showToast.warning("Please enter a valid email address")
  },

  passwordTooShort: (minLength: number) => {
    showToast.warning(`Password must be at least ${minLength} characters long`)
  },

  passwordsDoNotMatch: () => {
    showToast.warning("Passwords do not match")
  },

  fileUploadSuccess: (fileName: string) => {
    showToast.success(`File "${fileName}" uploaded successfully`)
  },

  fileUploadError: (fileName: string, error?: string) => {
    showToast.error(`Failed to upload file "${fileName}"`, {
      description: error
    })
  }
}

// Utility toasts
export const utilityToasts = {
  copiedToClipboard: (item: string) => {
    showToast.success(`${item} copied to clipboard`)
  },

  dataExported: (format: string) => {
    showToast.success(`Data exported successfully as ${format}`)
  },

  dataImported: (format: string) => {
    showToast.success(`Data imported from ${format}`)
  },

  searchComplete: (resultCount: number) => {
    showToast.info(`Search complete. Found ${resultCount} results`)
  },

  filterApplied: (filterName: string) => {
    showToast.info(`Filter "${filterName}" applied`)
  },

  filterCleared: () => {
    showToast.info("All filters cleared")
  }
}

// Export all toast utilities
export const toasts = {
  ...showToast,
  ...adminToasts,
  ...userToasts,
  ...networkToasts,
  ...formToasts,
  ...utilityToasts
}