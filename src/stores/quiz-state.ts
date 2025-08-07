import { create } from 'zustand'

interface QuizQuestion {
  id: string
  title: string
  content: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK'
  options: string[]
  userAnswer: string
  isAnswered: boolean
  timeSpent: number
  points: number
}

interface QuizState {
  currentQuiz: {
    id: string
    title: string
    description?: string
    timeLimit?: number
    difficulty: string
    totalQuestions: number
  } | null
  
  currentQuestionIndex: number
  questions: QuizQuestion[]
  answers: Record<string, string>
  timeLeft: number | null
  isQuizActive: boolean
  isQuizCompleted: boolean
  startTime: Date | null
  lastSaved: Date | null
  
  // Actions
  startQuiz: (quiz: QuizState['currentQuiz'], questions: Omit<QuizQuestion, 'userAnswer' | 'isAnswered' | 'timeSpent'>[]) => void
  answerQuestion: (questionId: string, answer: string) => void
  navigateToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  updateTimeSpent: (questionId: string, timeSpent: number) => void
  updateTimeLeft: (timeLeft: number) => void
  submitQuiz: () => void
  resetQuiz: () => void
  saveProgress: () => void
  loadProgress: (quizId: string) => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuiz: null,
  currentQuestionIndex: 0,
  questions: [],
  answers: {},
  timeLeft: null,
  isQuizActive: false,
  isQuizCompleted: false,
  startTime: null,
  lastSaved: null,

  startQuiz: (quiz, questions) => {
    const quizQuestions: QuizQuestion[] = questions.map(q => ({
      ...q,
      userAnswer: '',
      isAnswered: false,
      timeSpent: 0,
    }))

    set({
      currentQuiz: quiz,
      questions: quizQuestions,
      currentQuestionIndex: 0,
      answers: {},
      timeLeft: quiz?.timeLimit ? quiz.timeLimit * 60 : null,
      isQuizActive: true,
      isQuizCompleted: false,
      startTime: new Date(),
      lastSaved: new Date(),
    })
  },

  answerQuestion: (questionId, answer) => {
    const state = get()
    const updatedQuestions = state.questions.map(q =>
      q.id === questionId
        ? { ...q, userAnswer: answer, isAnswered: true }
        : q
    )

    set({
      questions: updatedQuestions,
      answers: { ...state.answers, [questionId]: answer },
      lastSaved: new Date(),
    })
  },

  navigateToQuestion: (index) => {
    const state = get()
    if (index >= 0 && index < state.questions.length) {
      set({ currentQuestionIndex: index })
    }
  },

  nextQuestion: () => {
    const state = get()
    if (state.currentQuestionIndex < state.questions.length - 1) {
      set({ currentQuestionIndex: state.currentQuestionIndex + 1 })
    }
  },

  previousQuestion: () => {
    const state = get()
    if (state.currentQuestionIndex > 0) {
      set({ currentQuestionIndex: state.currentQuestionIndex - 1 })
    }
  },

  updateTimeSpent: (questionId, timeSpent) => {
    const state = get()
    const updatedQuestions = state.questions.map(q =>
      q.id === questionId ? { ...q, timeSpent } : q
    )
    set({ questions: updatedQuestions })
  },

  updateTimeLeft: (timeLeft) => {
    set({ timeLeft })
  },

  submitQuiz: () => {
    set({
      isQuizActive: false,
      isQuizCompleted: true,
    })
  },

  resetQuiz: () => {
    set({
      currentQuiz: null,
      currentQuestionIndex: 0,
      questions: [],
      answers: {},
      timeLeft: null,
      isQuizActive: false,
      isQuizCompleted: false,
      startTime: null,
      lastSaved: null,
    })
  },

  saveProgress: () => {
    const state = get()
    if (!state.currentQuiz) return

    const progress = {
      quizId: state.currentQuiz.id,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      questions: state.questions.map(q => ({
        id: q.id,
        userAnswer: q.userAnswer,
        isAnswered: q.isAnswered,
        timeSpent: q.timeSpent,
      })),
      timeLeft: state.timeLeft,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem(`quiz-progress-${state.currentQuiz.id}`, JSON.stringify(progress))
    set({ lastSaved: new Date() })
  },

  loadProgress: (quizId) => {
    const saved = localStorage.getItem(`quiz-progress-${quizId}`)
    if (saved) {
      try {
        const progress = JSON.parse(saved)
        set({
          currentQuestionIndex: progress.currentQuestionIndex,
          answers: progress.answers,
          timeLeft: progress.timeLeft,
          lastSaved: new Date(progress.timestamp),
        })
        return true
      } catch (error) {
        console.error('Failed to load quiz progress:', error)
        return false
      }
    }
    return false
  },
}))