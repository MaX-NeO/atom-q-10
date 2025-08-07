"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  UserMinus,
  Users,
  BookOpen,
  ArrowUpDown
} from "lucide-react"
import { toasts } from "@/lib/toasts"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

// Import toast functions that were missing in the original code
import { toast } from "sonner";

interface User {
  id: string
  name: string
  email: string
  enrolled: boolean
}

interface Quiz {
  id: string
  title: string
  description?: string
  category?: { name: string }
  timeLimit?: number
  difficulty: string
  status: string
}

export default function QuizStudentsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false)
  const [userToUnenroll, setUserToUnenroll] = useState<User | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openUnenrollDialog(user)}
            className="text-red-600 hover:text-red-700"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Unenroll
          </Button>
        )
      },
    },
  ]

  useEffect(() => {
    fetchQuiz()
    fetchUsers()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
      }
    } catch (error) {
      toasts.networkError()
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/students`)
      if (response.ok) {
        const data = await response.json()
        // All returned users from this endpoint are enrolled
        setUsers(data)
      }
    } catch (error) {
      toasts.networkError()
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`/api/admin/students/available?quizId=${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data)
      }
    } catch (error) {
      toasts.networkError()
    }
  }

  const handleEnrollUsers = async () => {
    if (selectedUsers.length === 0) {
      toasts.warning("Please select at least one user")
      return
    }

    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentIds: selectedUsers }),
      })

      if (response.ok) {
        const result = await response.json()
        toasts.usersEnrolled(result.enrolledCount)
        if (result.alreadyEnrolled > 0) {
          toasts.info(`${result.alreadyEnrolled} user(s) were already enrolled`)
        }
        setIsEnrollDialogOpen(false)
        setSelectedUsers([])
        fetchUsers()
      } else {
        const error = await response.json()
        toasts.error(error.message || "User enrollment failed")
      }
    } catch (error) {
      toasts.actionFailed("User enrollment")
    }
  }

  const handleUnenrollUser = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/students/${studentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Student unenrolled successfully")
        fetchUsers()
        setIsUnenrollDialogOpen(false)
        setUserToUnenroll(null)
      } else {
        toast.error("Failed to unenroll student")
      }
    } catch (error) {
      console.error("Error unenrolling student:", error)
      toast.error("Failed to unenroll student")
    }
  }

  const openEnrollDialog = async () => {
    await fetchAvailableUsers()
    setIsEnrollDialogOpen(true)
  }

  const openUnenrollDialog = (user: User) => {
    setUserToUnenroll(user)
    setIsUnenrollDialogOpen(true)
  }

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!quiz) {
    return <div className="flex items-center justify-center h-64">Quiz not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users enrolled in "{quiz.title}"
            </p>
          </div>
        </div>
        <Button onClick={openEnrollDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll Users
        </Button>
      </div>

      {/* Quiz Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quiz Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Difficulty</Label>
              <Badge variant={
                quiz.difficulty === "EASY" ? "default" :
                quiz.difficulty === "MEDIUM" ? "secondary" : "destructive"
              }>
                {quiz.difficulty}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Time Limit</Label>
              <p className="text-lg">{quiz.timeLimit ? `${quiz.timeLimit} minutes` : "No limit"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant={quiz.status === "ACTIVE" ? "default" : "secondary"}>
                {quiz.status}
              </Badge>
            </div>
          </div>
          {quiz.description && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <p className="text-sm mt-1">{quiz.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assigned Users ({users.length})
          </CardTitle>
          <CardDescription>
            Users currently assigned to this quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={users} 
            searchKey="name"
            searchPlaceholder="Search assigned users..."
          />
        </CardContent>
      </Card>

      {/* Enroll Users Sheet */}
      <Sheet open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Enroll Users</SheetTitle>
            <SheetDescription>
              Select users to enroll in this quiz
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="search-users">Search Users</Label>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-users"
                  placeholder="Search available users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label>Available Users</Label>
              <div className="max-h-64 overflow-y-auto border rounded-md">
                {filteredAvailableUsers.length > 0 ? (
                  filteredAvailableUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 border-b last:border-b-0">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No available users found
                  </div>
                )}
              </div>
              {selectedUsers.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedUsers.length} user(s) selected
                </div>
              )}
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEnrollUsers} 
              disabled={selectedUsers.length === 0}
            >
              Enroll Selected Users ({selectedUsers.length})
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog open={isUnenrollDialogOpen} onOpenChange={setIsUnenrollDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unenrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll "{userToUnenroll?.name}" from this quiz? 
              This action cannot be undone and will remove all their progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsUnenrollDialogOpen(false)
              setUserToUnenroll(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => userToUnenroll && handleUnenrollUser(userToUnenroll.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Unenroll User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}