"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  MoreHorizontal,
  Plus,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Users,
  FileQuestion,
  ArrowUpDown
} from "lucide-react"
import { toasts } from "@/lib/toasts"
import { DifficultyLevel, QuizStatus } from "@prisma/client"
import Papa from "papaparse"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface Quiz {
  id: string
  title: string
  description?: string
  category?: { name: string }
  timeLimit?: number
  difficulty: DifficultyLevel
  status: QuizStatus
  negativeMarking: boolean
  negativePoints?: number
  randomOrder: boolean
  maxAttempts?: number
  startTime?: string
  endTime?: string
  createdAt: string
  checkAnswerEnabled?: boolean
  _count: {
    quizQuestions: number
    quizAttempts: number
  }
}

interface CreateFormData {
  title: string
  description: string
  timeLimit: string
  difficulty: DifficultyLevel
  status: QuizStatus
  negativeMarking: boolean
  negativePoints: string
  randomOrder: boolean
  maxAttempts: string
  startTime: string
  endTime: string
  checkAnswerEnabled: boolean
}

interface EditFormData {
  title: string
  description: string
  timeLimit: string
  difficulty: DifficultyLevel
  status: QuizStatus
  negativeMarking: boolean
  negativePoints: string
  randomOrder: boolean
  maxAttempts: string
  startTime: string
  endTime: string
  checkAnswerEnabled: boolean
}

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null)

  // Separate form states for create and edit
  const [createFormData, setCreateFormData] = useState<CreateFormData>({
    title: "",
    description: "",
    timeLimit: "",
    difficulty: DifficultyLevel.EASY,
    status: QuizStatus.DRAFT,
    negativeMarking: false,
    negativePoints: "",
    randomOrder: false,
    maxAttempts: "",
    startTime: "",
    endTime: "",
    checkAnswerEnabled: false,
  })

  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    description: "",
    timeLimit: "",
    difficulty: DifficultyLevel.EASY,
    status: QuizStatus.DRAFT,
    negativeMarking: false,
    negativePoints: "",
    randomOrder: false,
    maxAttempts: "",
    startTime: "",
    endTime: "",
    checkAnswerEnabled: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const columns: ColumnDef<Quiz>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as DifficultyLevel
        return (
          <Badge variant={
            difficulty === DifficultyLevel.EASY ? "default" :
            difficulty === DifficultyLevel.MEDIUM ? "secondary" : "destructive"
          }>
            {difficulty}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as QuizStatus
        return (
          <Badge variant={status === QuizStatus.ACTIVE ? "default" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "timeLimit",
      header: "Time Limit",
      cell: ({ row }) => {
        const timeLimit = row.getValue("timeLimit") as number
        return timeLimit ? `${timeLimit} min` : "No limit"
      },
    },
    {
      accessorKey: "_count.quizQuestions",
      header: "Questions",
      cell: ({ row }) => {
        const quiz = row.original
        return quiz._count?.quizQuestions || 0
      },
    },
    {
      accessorKey: "maxAttempts",
      header: "Max Attempts",
      cell: ({ row }) => {
        const quiz = row.original
        return quiz.maxAttempts === null || quiz.maxAttempts === undefined ? "Unlimited" : quiz.maxAttempts
      },
    },
    {
      accessorKey: "_count.quizAttempts",
      header: "Total Submissions",
      cell: ({ row }) => {
        const quiz = row.original
        return quiz._count?.quizAttempts || 0
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return date.toLocaleDateString()
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const quiz = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/admin/quiz/${quiz.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/quiz/${quiz.id}/questions`)}>
                <FileQuestion className="mr-2 h-4 w-4" />
                Questions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/quiz/${quiz.id}/users`)}>
                <Users className="mr-2 h-4 w-4" />
                Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(quiz)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createFormData,
          timeLimit: createFormData.timeLimit ? parseInt(createFormData.timeLimit) : null,
          negativePoints: createFormData.negativePoints ? parseFloat(createFormData.negativePoints) : null,
          maxAttempts: createFormData.maxAttempts === "" ? null : parseInt(createFormData.maxAttempts),
          startTime: createFormData.startTime || null,
          endTime: createFormData.endTime || null,
        }),
      })

      if (response.ok) {
        toasts.success("Quiz created successfully")
        setIsAddDialogOpen(false)
        resetCreateForm()
        fetchQuizzes()
      } else {
        const error = await response.json()
        toasts.error(error.message || "Quiz creation failed")
      }
    } catch (error) {
      toasts.actionFailed("Quiz creation")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedQuiz) return

    try {
      const response = await fetch(`/api/admin/quiz/${selectedQuiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editFormData,
          timeLimit: editFormData.timeLimit ? parseInt(editFormData.timeLimit) : null,
          negativePoints: editFormData.negativePoints ? parseFloat(editFormData.negativePoints) : null,
          maxAttempts: editFormData.maxAttempts === "" ? null : parseInt(editFormData.maxAttempts),
          startTime: editFormData.startTime || null,
          endTime: editFormData.endTime || null,
        }),
      })

      if (response.ok) {
        toasts.success("Quiz updated successfully")
        setIsEditDialogOpen(false)
        setSelectedQuiz(null)
        resetEditForm()
        fetchQuizzes()
      } else {
        const error = await response.json()
        toasts.error(error.message || "Quiz update failed")
      }
    } catch (error) {
      toasts.actionFailed("Quiz update")
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toasts.quizDeleted()
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId))
        setIsDeleteDialogOpen(false)
        setQuizToDelete(null)
      } else {
        toasts.actionFailed("Quiz deletion")
      }
    } catch (error) {
      toasts.actionFailed("Quiz deletion")
    }
  }

  const openEditDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz)

    // Format datetime for input fields
    const formatDateTimeLocal = (dateString?: string) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    setEditFormData({
      title: quiz.title,
      description: quiz.description || "",
      timeLimit: quiz.timeLimit?.toString() || "",
      difficulty: quiz.difficulty,
      status: quiz.status,
      negativeMarking: quiz.negativeMarking,
      negativePoints: quiz.negativePoints?.toString() || "",
      randomOrder: quiz.randomOrder,
      maxAttempts: quiz.maxAttempts?.toString() || "",
      startTime: formatDateTimeLocal(quiz.startTime),
      endTime: formatDateTimeLocal(quiz.endTime),
      checkAnswerEnabled: quiz.checkAnswerEnabled || false,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (quiz: Quiz) => {
    setQuizToDelete(quiz)
    setIsDeleteDialogOpen(true)
  }

  const resetCreateForm = () => {
    setCreateFormData({
      title: "",
      description: "",
      timeLimit: "",
      difficulty: DifficultyLevel.EASY,
      status: QuizStatus.DRAFT,
      negativeMarking: false,
      negativePoints: "",
      randomOrder: false,
      maxAttempts: "",
      startTime: "",
      endTime: "",
      checkAnswerEnabled: false,
    })
  }

  const resetEditForm = () => {
    setEditFormData({
      title: "",
      description: "",
      timeLimit: "",
      difficulty: DifficultyLevel.EASY,
      status: QuizStatus.DRAFT,
      negativeMarking: false,
      negativePoints: "",
      randomOrder: false,
      maxAttempts: "",
      startTime: "",
      endTime: "",
      checkAnswerEnabled: false,
    })
  }

  const handleExportQuizzes = () => {
    const csvData = quizzes.map(quiz => ({
      title: quiz.title,
      description: quiz.description || "",
      difficulty: quiz.difficulty,
      status: quiz.status,
      timeLimit: quiz.timeLimit || "",
      negativeMarking: quiz.negativeMarking,
      negativePoints: quiz.negativePoints || "",
      randomOrder: quiz.randomOrder,
      maxAttempts: quiz.maxAttempts || "",
      checkAnswerEnabled: quiz.checkAnswerEnabled || false,
      questions: quiz._count.quizQuestions,
      attempts: quiz._count.quizAttempts,
      createdAt: quiz.createdAt,
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "quizzes.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toasts.success("Quizzes exported successfully")
  }

  const handleImportQuizzes = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: async (results) => {
          try {
            const response = await fetch("/api/admin/quiz", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ importData: results.data }),
            })

            if (response.ok) {
              toasts.success("Quizzes imported successfully")
              fetchQuizzes()
            } else {
              toasts.error("Import failed")
            }
          } catch (error) {
            toasts.actionFailed("Quiz import")
          }
        },
        header: true,
        skipEmptyLines: true,
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">
            Create and manage quiz assessments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportQuizzes}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportQuizzes}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>
            Manage all quiz assessments in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={quizzes}
            searchKey="title"
            searchPlaceholder="Search quizzes..."
          />
        </CardContent>
      </Card>

      {/* Create Quiz Sheet */}
      <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Quiz</SheetTitle>
            <SheetDescription>
              Create a new quiz with the specified settings.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <div className="grid gap-3">
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-difficulty">Difficulty</Label>
                <Select
                  value={createFormData.difficulty}
                  onValueChange={(value: DifficultyLevel) => setCreateFormData({ ...createFormData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DifficultyLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-time-limit">Time Limit (minutes)</Label>
                <Input
                  id="create-time-limit"
                  type="number"
                  value={createFormData.timeLimit}
                  onChange={(e) => setCreateFormData({ ...createFormData, timeLimit: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={createFormData.status}
                  onValueChange={(value: QuizStatus) => setCreateFormData({ ...createFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(QuizStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-negative-marking"
                    checked={createFormData.negativeMarking}
                    onCheckedChange={(checked) => setCreateFormData({ ...createFormData, negativeMarking: checked })}
                  />
                  <Label htmlFor="create-negative-marking">Negative Marking</Label>
                </div>
              </div>
              {createFormData.negativeMarking && (
                <div className="grid gap-3">
                  <Label htmlFor="create-negative-points">Negative Points</Label>
                  <Input
                    id="create-negative-points"
                    type="number"
                    step="0.1"
                    value={createFormData.negativePoints}
                    onChange={(e) => setCreateFormData({ ...createFormData, negativePoints: e.target.value })}
                  />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="create-max-attempts">Max Attempts</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-infinite-attempts"
                    checked={createFormData.maxAttempts === ""}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCreateFormData({ ...createFormData, maxAttempts: "" })
                      } else {
                        setCreateFormData({ ...createFormData, maxAttempts: "1" })
                      }
                    }}
                  />
                  <Label htmlFor="create-infinite-attempts">Infinite Attempts</Label>
                </div>
                {createFormData.maxAttempts !== "" && (
                  <Input
                    id="create-max-attempts-input"
                    type="number"
                    min="1"
                    value={createFormData.maxAttempts}
                    onChange={(e) => setCreateFormData({ ...createFormData, maxAttempts: e.target.value })}
                  />
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-start-time">Start Date & Time (Optional)</Label>
                <Input
                  id="create-start-time"
                  type="datetime-local"
                  value={createFormData.startTime}
                  onChange={(e) => setCreateFormData({ ...createFormData, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-end-time">End Date & Time (Optional)</Label>
                <Input
                  id="create-end-time"
                  type="datetime-local"
                  value={createFormData.endTime}
                  onChange={(e) => setCreateFormData({ ...createFormData, endTime: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-random-order"
                    checked={createFormData.randomOrder}
                    onCheckedChange={(checked) => setCreateFormData({ ...createFormData, randomOrder: checked })}
                  />
                  <Label htmlFor="create-random-order">Random Question Order</Label>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-check-answer-enabled"
                    checked={createFormData.checkAnswerEnabled}
                    onCheckedChange={(checked) => setCreateFormData({ ...createFormData, checkAnswerEnabled: checked })}
                  />
                  <Label htmlFor="create-check-answer-enabled">Allow Check Answers</Label>
                </div>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Quiz</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Quiz Sheet */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Quiz</SheetTitle>
            <SheetDescription>
              Update quiz settings and configuration.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <div className="grid gap-3">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select
                  value={editFormData.difficulty}
                  onValueChange={(value: DifficultyLevel) => setEditFormData({ ...editFormData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DifficultyLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit-time-limit">Time Limit (minutes)</Label>
                <Input
                  id="edit-time-limit"
                  type="number"
                  value={editFormData.timeLimit}
                  onChange={(e) => setEditFormData({ ...editFormData, timeLimit: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: QuizStatus) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(QuizStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-negative-marking"
                    checked={editFormData.negativeMarking}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, negativeMarking: checked })}
                  />
                  <Label htmlFor="edit-negative-marking">Negative Marking</Label>
                </div>
              </div>
              {editFormData.negativeMarking && (
                <div className="grid gap-3">
                  <Label htmlFor="edit-negative-points">Negative Points</Label>
                  <Input
                    id="edit-negative-points"
                    type="number"
                    step="0.1"
                    value={editFormData.negativePoints}
                    onChange={(e) => setEditFormData({ ...editFormData, negativePoints: e.target.value })}
                  />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="edit-max-attempts">Max Attempts</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-infinite-attempts"
                    checked={editFormData.maxAttempts === ""}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setEditFormData({ ...editFormData, maxAttempts: "" })
                      } else {
                        setEditFormData({ ...editFormData, maxAttempts: "1" })
                      }
                    }}
                  />
                  <Label htmlFor="edit-infinite-attempts">Infinite Attempts</Label>
                </div>
                {editFormData.maxAttempts !== "" && (
                  <Input
                    id="edit-max-attempts-input"
                    type="number"
                    min="1"
                    value={editFormData.maxAttempts}
                    onChange={(e) => setEditFormData({ ...editFormData, maxAttempts: e.target.value })}
                  />
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit-start-time">Start Date & Time (Optional)</Label>
                <Input
                  id="edit-start-time"
                  type="datetime-local"
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit-end-time">End Date & Time (Optional)</Label>
                <Input
                  id="edit-end-time"
                  type="datetime-local"
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-random-order"
                    checked={editFormData.randomOrder}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, randomOrder: checked })}
                  />
                  <Label htmlFor="edit-random-order">Random Question Order</Label>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-check-answer-enabled"
                    checked={editFormData.checkAnswerEnabled}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, checkAnswerEnabled: checked })}
                  />
                  <Label htmlFor="edit-check-answer-enabled">Allow Check Answers</Label>
                </div>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Quiz</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone and will remove all associated questions and results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false)
              setQuizToDelete(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => quizToDelete && handleDeleteQuiz(quizToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}