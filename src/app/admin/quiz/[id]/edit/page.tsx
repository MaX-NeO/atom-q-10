
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  Clock, 
  Users, 
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Check,
  AlertTriangle
} from "lucide-react"
import { toasts } from "@/lib/toasts"
import { DifficultyLevel, QuizStatus } from "@prisma/client"

interface Quiz {
  id: string
  title: string
  description: string
  timeLimit: number
  difficulty: DifficultyLevel
  status: QuizStatus
  negativeMarking: boolean
  negativePoints?: number
  randomOrder: boolean
  maxAttempts?: number
  showAnswers: boolean
  startTime?: string
  endTime?: string
}

export default function EditQuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
      } else {
        toasts.error("Failed to fetch quiz")
      }
    } catch (error) {
      toasts.error("Error fetching quiz")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!quiz) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/quiz/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quiz),
      })

      if (response.ok) {
        toasts.success("Quiz updated successfully")
        router.push("/admin/quiz")
      } else {
        const error = await response.json()
        toasts.error(error.message || "Failed to update quiz")
      }
    } catch (error) {
      toasts.error("Error updating quiz")
    } finally {
      setSaving(false)
    }
  }

  const updateQuiz = (field: keyof Quiz, value: any) => {
    setQuiz(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Quiz not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Quiz</h1>
            <p className="text-muted-foreground">Modify quiz settings and configuration</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Quiz title, description, and basic settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => updateQuiz("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={quiz.status}
                  onValueChange={(value) => updateQuiz("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quiz.description}
                onChange={(e) => updateQuiz("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  value={quiz.timeLimit}
                  onChange={(e) => updateQuiz("timeLimit", parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={quiz.difficulty}
                  onValueChange={(value) => updateQuiz("difficulty", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  value={quiz.maxAttempts || ""}
                  placeholder="Unlimited"
                  onChange={(e) => updateQuiz("maxAttempts", e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Quiz Settings</span>
            </CardTitle>
            <CardDescription>Configure quiz behavior and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Show Answers During Quiz</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to check answers while taking the quiz
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {quiz.showAnswers ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <Switch
                  checked={quiz.showAnswers}
                  onCheckedChange={(checked) => updateQuiz("showAnswers", checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Random Order</Label>
                <p className="text-sm text-muted-foreground">
                  Randomize the order of questions for each attempt
                </p>
              </div>
              <Switch
                checked={quiz.randomOrder}
                onCheckedChange={(checked) => updateQuiz("randomOrder", checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Negative Marking</Label>
                  <p className="text-sm text-muted-foreground">
                    Deduct points for incorrect answers
                  </p>
                </div>
                <Switch
                  checked={quiz.negativeMarking}
                  onCheckedChange={(checked) => updateQuiz("negativeMarking", checked)}
                />
              </div>

              {quiz.negativeMarking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="ml-4 space-y-2"
                >
                  <Label htmlFor="negativePoints">Points to deduct</Label>
                  <Input
                    id="negativePoints"
                    type="number"
                    step="0.1"
                    min="0"
                    value={quiz.negativePoints || 0}
                    onChange={(e) => updateQuiz("negativePoints", parseFloat(e.target.value))}
                    className="w-32"
                  />
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Schedule</span>
            </CardTitle>
            <CardDescription>Set quiz availability times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={quiz.startTime ? new Date(quiz.startTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => updateQuiz("startTime", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={quiz.endTime ? new Date(quiz.endTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => updateQuiz("endTime", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
