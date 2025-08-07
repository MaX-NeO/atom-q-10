
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

export default function QuizUsersPage() {
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

  useEffect(() => {
    fetchQuizData()
    fetchEnrolledUsers()
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
      }
    } catch (error) {
      console.error("Error fetching quiz:", error)
    }
  }

  const fetchEnrolledUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching enrolled users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users/available?quizId=${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data)
      }
    } catch (error) {
      console.error("Error fetching available users:", error)
    }
  }

  const handleEnrollUsers = async () => {
    if (selectedUsers.length === 0) return

    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers
        })
      })

      if (response.ok) {
        toast.success(`${selectedUsers.length} user(s) enrolled successfully`)
        setIsEnrollDialogOpen(false)
        setSelectedUsers([])
        fetchEnrolledUsers()
        fetchAvailableUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to enroll users')
      }
    } catch (error) {
      toast.error('Failed to enroll users')
    }
  }

  const handleUnenrollUser = async () => {
    if (!userToUnenroll) return

    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/users/${userToUnenroll.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('User unenrolled successfully')
        setIsUnenrollDialogOpen(false)
        setUserToUnenroll(null)
        fetchEnrolledUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to unenroll user')
      }
    } catch (error) {
      toast.error('Failed to unenroll user')
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUserToUnenroll(user)
              setIsUnenrollDialogOpen(true)
            }}
            className="text-red-600 hover:text-red-700"
          >
            <UserMinus className="h-4 w-4 mr-1" />
            Unenroll
          </Button>
        )
      },
    },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="h-9"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Users</h1>
          <p className="text-muted-foreground">
            Manage user enrollment for "{quiz?.title}"
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Title</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">{quiz?.title}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={quiz?.difficulty === 'HARD' ? 'destructive' : quiz?.difficulty === 'MEDIUM' ? 'default' : 'secondary'}>
              {quiz?.difficulty}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            fetchAvailableUsers()
            setIsEnrollDialogOpen(true)
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Enroll Users
        </Button>
      </div>

      <DataTable columns={columns} data={filteredUsers} />

      {/* Enroll Users Dialog */}
      <Sheet open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Enroll Users</SheetTitle>
            <SheetDescription>
              Select users to enroll in this quiz
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <div className="space-y-4">
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 border rounded">
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

      {/* Unenroll User Dialog */}
      <AlertDialog open={isUnenrollDialogOpen} onOpenChange={setIsUnenrollDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll "{userToUnenroll?.name}" from this quiz? 
              This action cannot be undone and will remove their quiz data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToUnenroll(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnenrollUser}
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
