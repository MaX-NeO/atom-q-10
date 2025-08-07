"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BarChart3, 
  Trophy, 
  Users, 
  Clock,
  TrendingUp,
  Eye,
  Calendar
} from "lucide-react"
import { toasts } from "@/lib/toasts"


interface Quiz {
  id: string
  title: string
  description?: string
  category?: { name: string }
  difficulty: string
  status: string
  _count: {
    quizQuestions: number
    quizAttempts: number
  }
}

interface LeaderboardEntry {
  id: string
  user: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
  score: number
  totalPoints: number
  timeTaken: number
  submittedAt: string
  rank: number
}

interface ResultMatrixEntry {
  id: string
  user: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
  status: string
  score?: number
  timeTaken?: number
  errors?: number
  submittedAt?: string
}



export default function AnalysisPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [resultMatrix, setResultMatrix] = useState<ResultMatrixEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'matrix'>('leaderboard')
  const [isLeaderboardDialogOpen, setIsLeaderboardDialogOpen] = useState(false)
  const [isMatrixDialogOpen, setIsMatrixDialogOpen] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/admin/quiz")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
      }
    } catch (error) {
      toasts.networkError()
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async (quizId: string) => {
    try {
      const response = await fetch(`/api/admin/analysis/${quizId}/leaderboard`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      toasts.actionFailed("Leaderboard fetch")
    }
  }

  const fetchResultMatrix = async (quizId: string) => {
    try {
      const response = await fetch(`/api/admin/analysis/${quizId}/result-matrix`)
      if (response.ok) {
        const data = await response.json()
        setResultMatrix(data)
      }
    } catch (error) {
      toasts.actionFailed("Result matrix fetch")
    }
  }

  const openLeaderboard = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    fetchLeaderboard(quiz.id)
    setIsLeaderboardDialogOpen(true)
  }

  const openResultMatrix = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    fetchResultMatrix(quiz.id)
    setIsMatrixDialogOpen(true)
  }

  

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Analyze quiz performance and user engagement
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
            <p className="text-xs text-muted-foreground">
              Active quizzes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizzes.reduce((sum, quiz) => sum + quiz._count.quizAttempts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Quiz attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <p className="text-xs text-muted-foreground">
              Across all quizzes
            </p>
          </CardContent>
        </Card>
      </div>

      

      {/* Quiz List */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Analytics</CardTitle>
          <CardDescription>
            View detailed analytics for each quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{quiz.title}</h3>
                    <Badge variant={
                      quiz.difficulty === 'EASY' ? 'default' :
                      quiz.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'
                    }>
                      {quiz.difficulty}
                    </Badge>
                    <Badge variant={quiz.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {quiz.status}
                    </Badge>
                  </div>
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{quiz._count.quizQuestions} questions</span>
                    <span>{quiz._count.quizAttempts} attempts</span>
                    
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLeaderboard(quiz)}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openResultMatrix(quiz)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Results
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Dialog */}
      <Dialog open={isLeaderboardDialogOpen} onOpenChange={setIsLeaderboardDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Leaderboard - {selectedQuiz?.title}</DialogTitle>
            <DialogDescription>
              Top performers ranked by score and completion time
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.rank <= 3 && (
                          <Trophy className={`h-4 w-4 ${
                            entry.rank === 1 ? 'text-yellow-500' :
                            entry.rank === 2 ? 'text-gray-400' : 'text-orange-600'
                          }`} />
                        )}
                        #{entry.rank}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry.user.avatar} />
                          <AvatarFallback>
                            {entry.user.name?.charAt(0) || entry.user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.user.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{entry.score}</div>
                        <div className="text-sm text-muted-foreground">
                          / {entry.totalPoints}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.submittedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Matrix Dialog */}
      <Dialog open={isMatrixDialogOpen} onOpenChange={setIsMatrixDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Result Matrix - {selectedQuiz?.title}</DialogTitle>
            <DialogDescription>
              User status and performance overview
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Errors</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultMatrix.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry.user.avatar} />
                          <AvatarFallback>
                            {entry.user.name?.charAt(0) || entry.user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.user.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        entry.status === 'SUBMITTED' ? 'default' :
                        entry.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                      }>
                        {entry.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.score !== undefined ? `${entry.score} points` : '-'}
                    </TableCell>
                    <TableCell>
                      {entry.timeTaken ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {entry.errors !== undefined ? entry.errors : '-'}
                    </TableCell>
                    <TableCell>
                      {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}