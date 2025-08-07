
import { create } from 'zustand'

interface Quiz {
  id: string
  title: string
  description: string
  timeLimit: number | null
  difficulty: string
  maxAttempts: number | null
  startTime: string | null
  endTime: string | null
  questionCount: number
  attempts: number
  bestScore: number | null
  lastAttemptDate: string | null
  canAttempt: boolean
  attemptStatus: string
  hasInProgress: boolean
}

interface UserStats {
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  totalTimeSpent: number
  streakCount: number
  rank: number
}

interface RecentActivity {
  id: string
  quizTitle: string
  score: number
  submittedAt: string
}

interface QuizCacheState {
  // Quiz data
  userQuizzes: Quiz[]
  availableQuizzes: Quiz[]
  
  // User stats
  userStats: UserStats | null
  recentActivity: RecentActivity[]
  
  // Cache timestamps
  userQuizzesLastFetch: number | null
  availableQuizzesLastFetch: number | null
  userStatsLastFetch: number | null
  recentActivityLastFetch: number | null
  
  // Actions
  setUserQuizzes: (quizzes: Quiz[]) => void
  setAvailableQuizzes: (quizzes: Quiz[]) => void
  setUserStats: (stats: UserStats) => void
  setRecentActivity: (activities: RecentActivity[]) => void
  
  // Cache management
  isUserQuizzesFresh: () => boolean
  isAvailableQuizzesFresh: () => boolean
  isUserStatsFresh: () => boolean
  isRecentActivityFresh: () => boolean
  
  clearCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useQuizCacheStore = create<QuizCacheState>((set, get) => ({
  // Initial state
  userQuizzes: [],
  availableQuizzes: [],
  userStats: null,
  recentActivity: [],
  userQuizzesLastFetch: null,
  availableQuizzesLastFetch: null,
  userStatsLastFetch: null,
  recentActivityLastFetch: null,
  
  // Setters
  setUserQuizzes: (quizzes) => set({
    userQuizzes: quizzes,
    userQuizzesLastFetch: Date.now()
  }),
  
  setAvailableQuizzes: (quizzes) => set({
    availableQuizzes: quizzes,
    availableQuizzesLastFetch: Date.now()
  }),
  
  setUserStats: (stats) => set({
    userStats: stats,
    userStatsLastFetch: Date.now()
  }),
  
  setRecentActivity: (activities) => set({
    recentActivity: activities,
    recentActivityLastFetch: Date.now()
  }),
  
  // Cache freshness checks
  isUserQuizzesFresh: () => {
    const lastFetch = get().userQuizzesLastFetch
    return lastFetch ? Date.now() - lastFetch < CACHE_DURATION : false
  },
  
  isAvailableQuizzesFresh: () => {
    const lastFetch = get().availableQuizzesLastFetch
    return lastFetch ? Date.now() - lastFetch < CACHE_DURATION : false
  },
  
  isUserStatsFresh: () => {
    const lastFetch = get().userStatsLastFetch
    return lastFetch ? Date.now() - lastFetch < CACHE_DURATION : false
  },
  
  isRecentActivityFresh: () => {
    const lastFetch = get().recentActivityLastFetch
    return lastFetch ? Date.now() - lastFetch < CACHE_DURATION : false
  },
  
  clearCache: () => set({
    userQuizzes: [],
    availableQuizzes: [],
    userStats: null,
    recentActivity: [],
    userQuizzesLastFetch: null,
    availableQuizzesLastFetch: null,
    userStatsLastFetch: null,
    recentActivityLastFetch: null,
  }),
}))
