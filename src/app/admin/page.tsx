"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, Clock } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalQuizzes: number
  totalQuestions: number
  totalAttempts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    totalAttempts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Quizzes",
      value: stats.totalQuizzes,
      description: "Created quizzes",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Total Questions",
      value: stats.totalQuestions,
      description: "Available questions",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Quiz Attempts",
      value: stats.totalAttempts,
      description: "Total attempts",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your QuizMaster admin dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "-" : stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    No recent activity
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Activity will appear here as users interact with the platform
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent">
                <Users className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">Manage Users</p>
              </div>
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent">
                <BookOpen className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">Create Quiz</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}