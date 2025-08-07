"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  Medal,
  Award,
  Star,
  Filter
} from "lucide-react"
import { toast } from "sonner"

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
  quizTitle: string
  quizDifficulty: string
}

interface Quiz {
  id: string
  title: string
  difficulty: string
  category?: { name: string }
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")

  useEffect(() => {
    fetchLeaderboard()
    fetchQuizzes()
  }, [selectedQuiz, timeFilter, difficultyFilter])

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedQuiz !== "all") params.append("quizId", selectedQuiz)
      if (timeFilter !== "all") params.append("timeFilter", timeFilter)
      if (difficultyFilter !== "all") params.append("difficulty", difficultyFilter)

      const response = await fetch(`/api/user/leaderboard?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      toast.error("Failed to fetch leaderboard")
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/user/quiz")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-sm font-medium">#{rank}</span>
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading leaderboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other quiz takers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quiz</label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="All quizzes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quizzes</SelectItem>
                  {quizzes.map(quiz => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Ranked by score and completion time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => {
                  const percentage = Math.round((entry.score / entry.totalPoints) * 100)
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.user.avatar} />
                            <AvatarFallback>
                              {entry.user.name?.charAt(0) || entry.user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{entry.user.name || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.quizTitle}</div>
                          <Badge variant={
                            entry.quizDifficulty === 'EASY' ? 'default' :
                            entry.quizDifficulty === 'MEDIUM' ? 'secondary' : 'destructive'
                          }>
                            {entry.quizDifficulty}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className={`font-bold ${getScoreColor(percentage)}`}>
                            {percentage}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.score}/{entry.totalPoints} pts
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(entry.timeTaken)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(entry.submittedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No leaderboard data</h3>
              <p className="text-muted-foreground mb-4">
                Complete some quizzes to see your name on the leaderboard!
              </p>
              <Button onClick={() => window.location.href = "/user/quiz"}>
                Browse Quizzes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Scorer</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={leaderboard[0].user.avatar} />
                    <AvatarFallback>
                      {leaderboard[0].user.name?.charAt(0) || leaderboard[0].user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{leaderboard[0].user.name || 'Anonymous'}</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round((leaderboard[0].score / leaderboard[0].totalPoints) * 100)}%
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fastest Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={leaderboard[0].user.avatar} />
                    <AvatarFallback>
                      {leaderboard[0].user.name?.charAt(0) || leaderboard[0].user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{leaderboard[0].user.name || 'Anonymous'}</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatTime(leaderboard[0].timeTaken)}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderboard.length}</div>
            <p className="text-xs text-muted-foreground">
              Quiz participants
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}