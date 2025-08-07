// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
// } from "@dnd-kit/core"
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable"
// import {
//   useSortable,
// } from "@dnd-kit/sortable"
// import { CSS } from "@dnd-kit/utilities"
// import {
//   GripVertical,
//   Search,
//   Plus,
//   ArrowLeft,
//   Edit,
//   Trash2,
//   Eye,
//   X,
//   Download,
//   Upload
// } from "lucide-react"
// import { toast } from "sonner"
// import { QuestionType, DifficultyLevel } from "@prisma/client"
// import Papa from "papaparse"

// interface Question {
//   id: string
//   title: string
//   content: string
//   type: QuestionType
//   options: string[] | string
//   correctAnswer: string
//   explanation?: string
//   difficulty: DifficultyLevel
//   isActive: boolean
//   order: number
//   points: number
// }

// interface AvailableQuestion {
//   id: string
//   title: string
//   content: string
//   type: QuestionType
//   options: string[] | string
//   correctAnswer: string
//   explanation?: string
//   difficulty: DifficultyLevel
//   isActive: boolean
// }



// function SortableQuestion({
//   question,
//   onEdit,
//   onDelete,
//   onView
// }: {
//   question: Question
//   onEdit: (question: Question) => void
//   onDelete: (questionId: string) => void
//   onView: (question: Question) => void
// }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: question.id })

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//   }

//   return (
//     <TableRow ref={setNodeRef} style={style} {...attributes}>
//       <TableCell>
//         <div {...listeners} className="cursor-grab">
//           <GripVertical className="h-4 w-4" />
//         </div>
//       </TableCell>
//       <TableCell className="font-medium">{question.order}</TableCell>
//       <TableCell>
//         <div>
//           <div className="font-medium">{question.title}</div>
//           <div className="text-sm text-muted-foreground">
//             {question.content}
//           </div>
//         </div>
//       </TableCell>
//       <TableCell>
//         <Badge variant={
//           question.type === QuestionType.MULTIPLE_CHOICE ? "default" :
//           question.type === QuestionType.TRUE_FALSE ? "secondary" : "outline"
//         }>
//           {question.type.replace('_', ' ')}
//         </Badge>
//       </TableCell>
//       <TableCell>
//         <Badge variant={
//           question.difficulty === DifficultyLevel.EASY ? "default" :
//           question.difficulty === DifficultyLevel.MEDIUM ? "secondary" : "destructive"
//         }>
//           {question.difficulty}
//         </Badge>
//       </TableCell>
//       <TableCell>{question.points}</TableCell>
//       <TableCell>
//         <div className="flex gap-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => onView(question)}
//           >
//             <Eye className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => onEdit(question)}
//           >
//             <Edit className="h-4 w-4" />
//           </Button>
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-red-600"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Remove Question</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   Are you sure you want to remove this question from the quiz? This action cannot be undone.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction onClick={() => onDelete(question.id)}>
//                   Remove
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//         </div>
//       </TableCell>
//     </TableRow>
//   )
// }

// export default function QuizQuestionsPage() {
//   const params = useParams()
//   const router = useRouter()
//   const quizId = params.id as string

//   const [questions, setQuestions] = useState<Question[]>([])
//   const [availableQuestions, setAvailableQuestions] = useState<AvailableQuestion[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
//   const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
//   const [quizTitle, setQuizTitle] = useState("")
//   const [createFormData, setCreateFormData] = useState({
//     title: "",
//     content: "",
//     type: QuestionType.MULTIPLE_CHOICE,
//     options: ["", ""],
//     correctAnswer: "",
//     explanation: "",
//     difficulty: DifficultyLevel.MEDIUM,
//     points: 1.0
//   })
//   const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   )

//   // Removed categories state
//   // Removed fetchCategories function

//   useEffect(() => {
//     fetchQuiz()
//     fetchQuestions()
//     fetchAvailableQuestions()
//   }, [quizId])

//   const fetchQuiz = async () => {
//     try {
//       const response = await fetch(`/api/admin/quiz/${quizId}`)
//       if (response.ok) {
//         const data = await response.json()
//         setQuizTitle(data.title)
//       }
//     } catch (error) {
//       console.error("Failed to fetch quiz title:", error)
//     }
//   }

//   const fetchQuestions = async () => {
//     try {
//       const response = await fetch(`/api/admin/quiz/${quizId}/questions`)
//       if (response.ok) {
//         const data = await response.json()
//         setQuestions(data)
//       }
//     } catch (error) {
//       toast.error("Failed to fetch questions")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchAvailableQuestions = async () => {
//     try {
//       const response = await fetch(`/api/admin/quiz/${quizId}/available-questions`)
//       if (response.ok) {
//         const data = await response.json()
//         setAvailableQuestions(data)
//       }
//     } catch (error) {
//       toast.error("Failed to fetch available questions")
//     }
//   }


//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event

//     if (active.id !== over?.id) {
//       const oldIndex = questions.findIndex(q => q.id === active.id)
//       const newIndex = questions.findIndex(q => q.id === over?.id)

//       const newQuestions = arrayMove(questions, oldIndex, newIndex)
//       setQuestions(newQuestions)

//       // Update order in backend
//       try {
//         await fetch(`/api/admin/quiz/${quizId}/questions/reorder`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             questionOrders: newQuestions.map((q, index) => ({
//               questionId: q.id,
//               order: index + 1
//             }))
//           }),
//         })
//       } catch (error) {
//         toast.error("Failed to update question order")
//         fetchQuestions() // Revert to original order
//       }
//     }
//   }

//   const handleRemoveQuestion = async (questionId: string) => {
//     try {
//       const response = await fetch(`/api/admin/quiz/${quizId}/questions/${questionId}`, {
//         method: "DELETE",
//       })

//       if (response.ok) {
//         setQuestions(questions.filter(q => q.id !== questionId))
//         toast.success("Question removed from quiz")
//         setDeleteQuestionId(null)
//       } else {
//         toast.error("Failed to remove question")
//       }
//     } catch (error) {
//       toast.error("Failed to remove question")
//     }
//   }

//   const handleAddQuestions = async (questionIds: string[]) => {
//     try {
//       const response = await fetch(`/api/admin/quiz/${quizId}/questions`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ questionIds }),
//       })

//       if (response.ok) {
//         toast.success("Questions added to quiz")
//         setIsAddDialogOpen(false)
//         fetchQuestions()
//         fetchAvailableQuestions()
//       } else {
//         toast.error("Failed to add questions")
//       }
//     } catch (error) {
//       toast.error("Failed to add questions")
//     }
//   }

//   const handleCreateQuestion = async () => {
//     try {
//       const response = await fetch(`/api/admin/quiz/${quizId}/questions`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...createFormData,
//           options: createFormData.options.filter(opt => opt.trim() !== "")
//         }),
//       })

//       if (response.ok) {
//         toast.success("Question created and added to quiz")
//         setIsCreateDialogOpen(false)
//         setCreateFormData({
//           title: "",
//           content: "",
//           type: QuestionType.MULTIPLE_CHOICE,
//           options: ["", ""],
//           correctAnswer: "",
//           explanation: "",
//           difficulty: DifficultyLevel.MEDIUM,
//           points: 1.0
//         })
//         fetchQuestions()
//         fetchAvailableQuestions()
//       } else {
//         const error = await response.json()
//         toast.error(error.message || "Failed to create question")
//       }
//     } catch (error) {
//       toast.error("Failed to create question")
//     }
//   }

//   // Removed category filtering logic
//   const handleExportQuestions = () => {
//     const csvContent = [
//       ["Title", "Content", "Type", "Options", "Correct Answer", "Explanation", "Difficulty", "Points"],
//       ...questions.map(question => [
//         question.title,
//         question.content,
//         question.type,
//         JSON.stringify(question.options), // Ensure options are stringified for CSV
//         question.correctAnswer,
//         question.explanation || "",
//         question.difficulty,
//         question.points
//       ])
//     ].map(row => row.join(",")).join("\n")

//     const blob = new Blob([csvContent], { type: "text/csv" })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `${quizTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_questions.csv`
//     a.click()
//     window.URL.revokeObjectURL(url)
//     toast.success("Questions exported to CSV")
//   }

//   const handleImportQuestions = () => {
//     fileInputRef.current?.click()
//   }

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     Papa.parse(file, {
//       header: true,
//       complete: async (results) => {
//         try {
//           const validQuestions = results.data.filter((row: any) => 
//             row.Title && row.Content && row.Type && row.Options && row["Correct Answer"]
//           )

//           if (validQuestions.length === 0) {
//             toast.error("No valid questions found in CSV file")
//             return
//           }

//           const importPromises = validQuestions.map(async (question: any) => {
//             try {
//               let options = []
              
//               // Handle different option formats
//               if (question.Options) {
//                 if (typeof question.Options === 'string') {
//                   options = question.Options.split("|").map((opt: string) => opt.trim()).filter((opt: string) => opt !== "")
//                 } else if (Array.isArray(question.Options)) {
//                   options = question.Options
//                 }
//               }

//               // Ensure True/False questions have correct options
//               if (question.Type === QuestionType.TRUE_FALSE) {
//                 if (options.length !== 2) {
//                   options = ["True", "False"]
//                 }
//               }

//               const response = await fetch(`/api/admin/quiz/${quizId}/questions`, {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                   title: question.Title,
//                   content: question.Content,
//                   type: question.Type,
//                   options: options,
//                   correctAnswer: question["Correct Answer"],
//                   explanation: question.Explanation || "",
//                   difficulty: question.Difficulty || DifficultyLevel.MEDIUM,
//                   points: parseFloat(question.Points) || 1.0
//                 }),
//               })

//               if (!response.ok) {
//                 const error = await response.json()
//                 throw new Error(error.message)
//               }

//               return await response.json()
//             } catch (error) {
//               console.error(`Failed to import question ${question.Title}:`, error)
//               return null
//             }
//           })

//           const importedQuestions = await Promise.all(importPromises)
//           const successCount = importedQuestions.filter(q => q !== null).length

//           if (successCount > 0) {
//             toast.success(`Successfully imported ${successCount} questions`)
//             fetchQuestions()
//             fetchAvailableQuestions()
//           } else {
//             toast.error("Failed to import any questions")
//           }
//         } catch (error) {
//           toast.error("Failed to parse CSV file")
//         } finally {
//           // Reset file input
//           if (fileInputRef.current) {
//             fileInputRef.current.value = ""
//           }
//         }
//       },
//       error: (error) => {
//         toast.error("Failed to read CSV file")
//         console.error("CSV parse error:", error)
//       }
//     })
//   }

//   const filteredAvailableQuestions = availableQuestions.filter(question => {
//     const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          question.content.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter

//     return matchesSearch && matchesDifficulty
//   })

//   if (loading) {
//     return <div className="flex items-center justify-center h-64">Loading...</div>
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Button variant="ghost" onClick={() => router.back()}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Quiz Questions</h1>
//           <p className="text-muted-foreground">
//             Manage questions for "{quizTitle}"
//           </p>
//         </div>
//       </div>

//       <div className="flex justify-between items-center">
//         <div className="flex gap-2">
//           <Button onClick={() => setIsAddDialogOpen(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Questions
//           </Button>
//           <Button onClick={() => setIsCreateDialogOpen(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             Create Question
//           </Button>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleExportQuestions}>
//             <Download className="mr-2 h-4 w-4" />
//             Export CSV
//           </Button>
//           <Button variant="outline" onClick={handleImportQuestions}>
//             <Upload className="mr-2 h-4 w-4" />
//             Import CSV
//           </Button>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".csv"
//             style={{ display: "none" }}
//             onChange={handleFileChange}
//           />
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Quiz Questions</CardTitle>
//           <CardDescription>
//             Drag and drop to reorder questions
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <DndContext
//             sensors={sensors}
//             collisionDetection={closestCenter}
//             onDragEnd={handleDragEnd}
//           >
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[50px]"></TableHead>
//                   <TableHead className="w-[80px]">Order</TableHead>
//                   <TableHead>Question</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Difficulty</TableHead>
//                   <TableHead>Points</TableHead>
//                   <TableHead className="w-[120px]">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
//                   {questions.map((question) => (
//                     <SortableQuestion
//                       key={question.id}
//                       question={question}
//                       onEdit={(q) => {
//                         setSelectedQuestion(q)
//                         setIsViewDialogOpen(true)
//                       }}
//                       onDelete={handleRemoveQuestion}
//                       onView={(q) => {
//                         setSelectedQuestion(q)
//                         setIsViewDialogOpen(true)
//                       }}
//                     />
//                   ))}
//                 </SortableContext>
//               </TableBody>
//             </Table>
//           </DndContext>
//         </CardContent>
//       </Card>

//       {/* Add Questions Sheet */}
//       <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <SheetContent className="sm:max-w-[700px] overflow-y-auto">
//           <SheetHeader>
//             <SheetTitle>Add Questions to Quiz</SheetTitle>
//             <SheetDescription>
//               Select questions to add to this quiz
//             </SheetDescription>
//           </SheetHeader>
//           <div className="space-y-4">
//             <div className="flex items-center space-x-2">
//               <Search className="h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search questions..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="flex-1"
//               />
//               <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
//                 <SelectTrigger className="w-[150px]">
//                   <SelectValue placeholder="All difficulties" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Difficulties</SelectItem>
//                   {Object.values(DifficultyLevel).map((level) => (
//                     <SelectItem key={level} value={level}>
//                       {level.charAt(0) + level.slice(1).toLowerCase()}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="max-h-96 overflow-y-auto space-y-2">
//               {filteredAvailableQuestions.map((question) => (
//                 <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex-1">
//                     <div className="font-medium">{question.title}</div>
//                     <div className="text-sm text-muted-foreground">
//                       {question.content}
//                     </div>
//                     <div className="flex gap-2 mt-1">
//                       <Badge variant={
//                         question.type === QuestionType.MULTIPLE_CHOICE ? "default" :
//                         question.type === QuestionType.TRUE_FALSE ? "secondary" : "outline"
//                       }>
//                         {question.type.replace('_', ' ')}
//                       </Badge>
//                       <Badge variant={
//                         question.difficulty === DifficultyLevel.EASY ? "default" :
//                         question.difficulty === DifficultyLevel.MEDIUM ? "secondary" : "destructive"
//                       }>
//                         {question.difficulty}
//                       </Badge>
//                     </div>
//                   </div>
//                   <Button
//                     onClick={() => handleAddQuestions([question.id])}
//                     size="sm"
//                   >
//                     Add
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <SheetFooter className="mt-6">
//             <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//               Cancel
//             </Button>
//           </SheetFooter>
//         </SheetContent>
//       </Sheet>

//       {/* View Question Sheet */}
//       <Sheet open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
//         <SheetContent className="sm:max-w-[525px] overflow-y-auto">
//           <SheetHeader>
//             <SheetTitle>Question Details</SheetTitle>
//           </SheetHeader>
//           {selectedQuestion && (
//             <div className="space-y-4">
//               <div>
//                 <Label className="font-medium">Title</Label>
//                 <p className="text-sm text-muted-foreground">{selectedQuestion.title}</p>
//               </div>
//               <div>
//                 <Label className="font-medium">Content</Label>
//                 <div 
//                   className="text-sm text-muted-foreground prose prose-sm max-w-none"
//                   dangerouslySetInnerHTML={{ __html: selectedQuestion.content }}
//                 />
//               </div>
//               <div>
//                 <Label className="font-medium">Type</Label>
//                 <p className="text-sm text-muted-foreground">{selectedQuestion.type.replace('_', ' ')}</p>
//               </div>
//               <div>
//                 <Label className="font-medium">Options</Label>
//                 <div className="text-sm text-muted-foreground">
//                   {(typeof selectedQuestion.options === 'string' ? JSON.parse(selectedQuestion.options) : selectedQuestion.options || []).map((option: string, index: number) => (
//                     <div key={index}>• {option}</div>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <Label className="font-medium">Correct Answer</Label>
//                 <p className="text-sm text-muted-foreground">{selectedQuestion.correctAnswer}</p>
//               </div>
//               {selectedQuestion.explanation && (
//                 <div>
//                   <Label className="font-medium">Explanation</Label>
//                   <div 
//                     className="text-sm text-muted-foreground prose prose-sm max-w-none"
//                     dangerouslySetInnerHTML={{ __html: selectedQuestion.explanation }}
//                   />
//                 </div>
//               )}
//             </div>
//           )}
//         </SheetContent>
//       </Sheet>

//       {/* Create Question Sheet */}
//       <Sheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//         <SheetContent className="sm:max-w-[600px] overflow-y-auto">
//           <SheetHeader>
//             <SheetTitle>Create New Question</SheetTitle>
//             <SheetDescription>
//               Create a new question and add it to this quiz
//             </SheetDescription>
//           </SheetHeader>
//           <div className="space-y-4">
//             <div className="grid gap-3">
//               <Label htmlFor="title">Title</Label>
//               <Input
//                 id="title"
//                 value={createFormData.title}
//                 onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
//                 placeholder="Enter question title"
//               />
//             </div>
//             <div className="grid gap-3">
//               <Label htmlFor="content">Content</Label>
//               <Textarea
//                 id="content"
//                 value={createFormData.content}
//                 onChange={(e) => setCreateFormData({...createFormData, content: e.target.value})}
//                 placeholder="Enter question content (supports basic HTML tags like <b>, <i>, <u>, <br>)"
//                 rows={4}
//                 className="font-mono text-sm"
//               />
//               <div className="text-xs text-muted-foreground">
//                 Tip: You can use HTML tags like &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;u&gt;underline&lt;/u&gt;, &lt;br&gt; for line breaks
//               </div>
//             </div>
//             <div className="grid gap-3">
//               <Label htmlFor="type">Type</Label>
//               <Select
//                 value={createFormData.type}
//                 onValueChange={(value) => {
//                   setCreateFormData({
//                     ...createFormData,
//                     type: value as QuestionType,
//                     options: value === QuestionType.TRUE_FALSE ? ["True", "False"] : [""]
//                   })
//                 }}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Object.values(QuestionType).map((type) => (
//                     <SelectItem key={type} value={type}>
//                       {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="grid gap-3">
//               <Label htmlFor="difficulty">Difficulty</Label>
//               <Select
//                 value={createFormData.difficulty}
//                 onValueChange={(value: string) => setCreateFormData({...createFormData, difficulty: value as DifficultyLevel})}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Object.values(DifficultyLevel).map((level) => (
//                     <SelectItem key={level} value={level}>
//                       {level.charAt(0) + level.slice(1).toLowerCase()}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {createFormData.type !== QuestionType.FILL_IN_BLANK && (
//               <div className="grid gap-3">
//                 <Label>Options</Label>
//                 <div className="space-y-2">
//                   {createFormData.options.map((option, index) => (
//                     <div key={index} className="flex items-center space-x-2">
//                       <Input
//                         value={option}
//                         onChange={(e) => {
//                           const newOptions = [...createFormData.options]
//                           newOptions[index] = e.target.value
//                           setCreateFormData({...createFormData, options: newOptions})
//                         }}
//                         placeholder={`Option ${index + 1}`}
//                         className="flex-1"
//                       />
//                       {createFormData.type === QuestionType.MULTIPLE_CHOICE && (
//                         <>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={() => {
//                               const newOptions = [...createFormData.options, ""]
//                               setCreateFormData({...createFormData, options: newOptions})
//                             }}
//                           >
//                             <Plus className="h-4 w-4" />
//                           </Button>
//                           {createFormData.options.length > 1 && (
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               onClick={() => {
//                                 const newOptions = createFormData.options.filter((_, i) => i !== index)
//                                 setCreateFormData({...createFormData, options: newOptions})
//                               }}
//                             >
//                               <X className="h-4 w-4" />
//                             </Button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             <div className="grid gap-3">
//               <Label htmlFor="correctAnswer">Correct Answer</Label>
//               <Input
//                 id="correctAnswer"
//                 value={createFormData.correctAnswer}
//                 onChange={(e) => setCreateFormData({...createFormData, correctAnswer: e.target.value})}
//                 placeholder="Enter correct answer"
//               />
//             </div>
//             <div className="grid gap-3">
//               <Label htmlFor="points">Points</Label>
//               <Input
//                 id="points"
//                 type="number"
//                 value={createFormData.points}
//                 onChange={(e) => setCreateFormData({...createFormData, points: parseFloat(e.target.value) || 1.0})}
//                 placeholder="1"
//               />
//             </div>
//             <div className="grid gap-3">
//               <Label htmlFor="explanation">Explanation</Label>
//               <Textarea
//                 id="explanation"
//                 value={createFormData.explanation}
//                 onChange={(e) => setCreateFormData({...createFormData, explanation: e.target.value})}
//                 placeholder="Optional explanation for the answer (supports basic HTML tags)"
//                 rows={3}
//                 className="font-mono text-sm"
//               />
//               <div className="text-xs text-muted-foreground">
//                 Tip: You can use HTML tags like &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;u&gt;underline&lt;/u&gt;, &lt;br&gt; for line breaks
//               </div>
//             </div>
//           </div>
//           <SheetFooter className="mt-6">
//             <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleCreateQuestion}>
//               Create and Add to Quiz
//             </Button>
//           </SheetFooter>
//         </SheetContent>
//       </Sheet>
//     </div>
//   )
// }
"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Search,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  X,
  Download,
  Upload
} from "lucide-react"
import { toast } from "sonner"
import { QuestionType, DifficultyLevel } from "@prisma/client"
import Papa from "papaparse"

interface Question {
  id: string
  title: string
  content: string
  type: QuestionType
  options: string[] | string
  correctAnswer: string
  explanation?: string
  difficulty: DifficultyLevel
  isActive: boolean
  order: number
  points: number
}

interface AvailableQuestion {
  id: string
  title: string
  content: string
  type: QuestionType
  options: string[] | string
  correctAnswer: string
  explanation?: string
  difficulty: DifficultyLevel
  isActive: boolean
}



function SortableQuestion({
  question,
  onEdit,
  onDelete,
  onView
}: {
  question: Question
  onEdit: (question: Question) => void
  onDelete: (questionId: string) => void
  onView: (question: Question) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell>
        <div {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{question.order}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{question.title}</div>
          <div className="text-sm text-muted-foreground">
            {question.content}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={
          question.type === QuestionType.MULTIPLE_CHOICE ? "default" :
          question.type === QuestionType.TRUE_FALSE ? "secondary" : "outline"
        }>
          {question.type.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={
          question.difficulty === DifficultyLevel.EASY ? "default" :
          question.difficulty === DifficultyLevel.MEDIUM ? "secondary" : "destructive"
        }>
          {question.difficulty}
        </Badge>
      </TableCell>
      <TableCell>{question.points}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(question)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(question)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Question</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this question from the quiz? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(question.id)}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function QuizQuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<AvailableQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [quizTitle, setQuizTitle] = useState("")
  const [createFormData, setCreateFormData] = useState({
    title: "",
    content: "",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["", ""],
    correctAnswer: "",
    explanation: "",
    difficulty: DifficultyLevel.MEDIUM,
    points: 1.0
  })
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Removed categories state
  // Removed fetchCategories function

  useEffect(() => {
    fetchQuiz()
    fetchQuestions()
    fetchAvailableQuestions()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuizTitle(data.title)
      }
    } catch (error) {
      console.error("Failed to fetch quiz title:", error)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/questions`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      toast.error("Failed to fetch questions")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/available-questions`)
      if (response.ok) {
        const data = await response.json()
        setAvailableQuestions(data)
      }
    } catch (error) {
      toast.error("Failed to fetch available questions")
    }
  }


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id)
      const newIndex = questions.findIndex(q => q.id === over?.id)

      const newQuestions = arrayMove(questions, oldIndex, newIndex)
      setQuestions(newQuestions)

      // Update order in backend
      try {
        await fetch(`/api/admin/quiz/${quizId}/questions/reorder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionOrders: newQuestions.map((q, index) => ({
              questionId: q.id,
              order: index + 1
            }))
          }),
        })
      } catch (error) {
        toast.error("Failed to update question order")
        fetchQuestions() // Revert to original order
      }
    }
  }

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/questions/${questionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId))
        toast.success("Question removed from quiz")
        setDeleteQuestionId(null)
      } else {
        toast.error("Failed to remove question")
      }
    } catch (error) {
      toast.error("Failed to remove question")
    }
  }

  const handleAddQuestions = async (questionIds: string[]) => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionIds }),
      })

      if (response.ok) {
        toast.success("Questions added to quiz")
        setIsAddDialogOpen(false)
        fetchQuestions()
        fetchAvailableQuestions()
      } else {
        toast.error("Failed to add questions")
      }
    } catch (error) {
      toast.error("Failed to add questions")
    }
  }

  const handleCreateQuestion = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createFormData,
          options: createFormData.options.filter(opt => opt.trim() !== "")
        }),
      })

      if (response.ok) {
        toast.success("Question created and added to quiz")
        setIsCreateDialogOpen(false)
        setCreateFormData({
          title: "",
          content: "",
          type: QuestionType.MULTIPLE_CHOICE,
          options: ["", ""],
          correctAnswer: "",
          explanation: "",
          difficulty: DifficultyLevel.MEDIUM,
          points: 1.0
        })
        fetchQuestions()
        fetchAvailableQuestions()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create question")
      }
    } catch (error) {
      toast.error("Failed to create question")
    }
  }

  // Removed category filtering logic
  const handleExportQuestions = () => {
    const csvContent = [
      ["Title", "Content", "Type", "Options", "Correct Answer", "Explanation", "Difficulty", "Points"],
      ...questions.map(question => [
        question.title,
        question.content,
        question.type,
        JSON.stringify(question.options), // Ensure options are stringified for CSV
        question.correctAnswer,
        question.explanation || "",
        question.difficulty,
        question.points
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${quizTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_questions.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Questions exported to CSV")
  }

  const handleImportQuestions = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const validQuestions = results.data.filter((row: any) => 
            row.Title && row.Content && row.Type && row.Options && row["Correct Answer"]
          )

          if (validQuestions.length === 0) {
            toast.error("No valid questions found in CSV file")
            return
          }

          const importPromises = validQuestions.map(async (question: any) => {
            try {
              let options = []
              
              // Handle different option formats
              if (question.Options) {
                if (typeof question.Options === 'string') {
                  options = question.Options.split("|").map((opt: string) => opt.trim()).filter((opt: string) => opt !== "")
                } else if (Array.isArray(question.Options)) {
                  options = question.Options
                }
              }

              // Ensure True/False questions have correct options
              if (question.Type === QuestionType.TRUE_FALSE) {
                if (options.length !== 2) {
                  options = ["True", "False"]
                }
              }

              const response = await fetch(`/api/admin/quiz/${quizId}/questions`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: question.Title,
                  content: question.Content,
                  type: question.Type,
                  options: options,
                  correctAnswer: question["Correct Answer"],
                  explanation: question.Explanation || "",
                  difficulty: question.Difficulty || DifficultyLevel.MEDIUM,
                  points: parseFloat(question.Points) || 1.0
                }),
              })

              if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message)
              }

              return await response.json()
            } catch (error) {
              console.error(`Failed to import question ${question.Title}:`, error)
              return null
            }
          })

          const importedQuestions = await Promise.all(importPromises)
          const successCount = importedQuestions.filter(q => q !== null).length

          if (successCount > 0) {
            toast.success(`Successfully imported ${successCount} questions`)
            fetchQuestions()
            fetchAvailableQuestions()
          } else {
            toast.error("Failed to import any questions")
          }
        } catch (error) {
          toast.error("Failed to parse CSV file")
        } finally {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        }
      },
      error: (error) => {
        toast.error("Failed to read CSV file")
        console.error("CSV parse error:", error)
      }
    })
  }

  const filteredAvailableQuestions = availableQuestions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter

    return matchesSearch && matchesDifficulty
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Questions</h1>
          <p className="text-muted-foreground">
            Manage questions for "{quizTitle}"
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Questions
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportQuestions}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleImportQuestions}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Questions</CardTitle>
          <CardDescription>
            Drag and drop to reorder questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[80px]">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  {questions.map((question) => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      onEdit={(q) => {
                        setSelectedQuestion(q)
                        setIsViewDialogOpen(true)
                      }}
                      onDelete={handleRemoveQuestion}
                      onView={(q) => {
                        setSelectedQuestion(q)
                        setIsViewDialogOpen(true)
                      }}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </CardContent>
      </Card>

      {/* Add Questions Sheet */}
      <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <SheetContent className="sm:max-w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Questions to Quiz</SheetTitle>
            <SheetDescription>
              Select questions to add to this quiz
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {Object.values(DifficultyLevel).map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredAvailableQuestions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{question.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {question.content}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={
                        question.type === QuestionType.MULTIPLE_CHOICE ? "default" :
                        question.type === QuestionType.TRUE_FALSE ? "secondary" : "outline"
                      }>
                        {question.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={
                        question.difficulty === DifficultyLevel.EASY ? "default" :
                        question.difficulty === DifficultyLevel.MEDIUM ? "secondary" : "destructive"
                      }>
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddQuestions([question.id])}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* View Question Sheet */}
      <Sheet open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <SheetContent className="sm:max-w-[525px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Question Details</SheetTitle>
          </SheetHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Title</Label>
                <p className="text-sm text-muted-foreground">{selectedQuestion.title}</p>
              </div>
              <div>
                <Label className="font-medium">Content</Label>
                <div 
                  className="text-sm text-muted-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedQuestion.content }}
                />
              </div>
              <div>
                <Label className="font-medium">Type</Label>
                <p className="text-sm text-muted-foreground">{selectedQuestion.type.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="font-medium">Options</Label>
                <div className="text-sm text-muted-foreground">
                  {(typeof selectedQuestion.options === 'string' ? JSON.parse(selectedQuestion.options) : selectedQuestion.options || []).map((option: string, index: number) => (
                    <div key={index}>• {option}</div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-medium">Correct Answer</Label>
                <p className="text-sm text-muted-foreground">{selectedQuestion.correctAnswer}</p>
              </div>
              {selectedQuestion.explanation && (
                <div>
                  <Label className="font-medium">Explanation</Label>
                  <div 
                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.explanation }}
                  />
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Question Sheet */}
      <Sheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Question</SheetTitle>
            <SheetDescription>
              Create a new question and add it to this quiz
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                placeholder="Enter question title"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={createFormData.content}
                onChange={(e) => setCreateFormData({...createFormData, content: e.target.value})}
                placeholder="Enter question content (supports basic HTML tags like <b>, <i>, <u>, <br>)"
                rows={4}
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                Tip: You can use HTML tags like &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;u&gt;underline&lt;/u&gt;, &lt;br&gt; for line breaks
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Select
                value={createFormData.type}
                onValueChange={(value: QuestionType) => {
                  setCreateFormData({
                    ...createFormData,
                    type: value,
                    options: value === QuestionType.TRUE_FALSE ? ["True", "False"] : [""]
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(QuestionType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={createFormData.difficulty}
                onValueChange={(value: string) => setCreateFormData({...createFormData, difficulty: value as DifficultyLevel})}
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

            {createFormData.type !== QuestionType.FILL_IN_BLANK && (
              <div className="grid gap-3">
                <Label>Options</Label>
                <div className="space-y-2">
                  {createFormData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...createFormData.options]
                          newOptions[index] = e.target.value
                          setCreateFormData({...createFormData, options: newOptions})
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {createFormData.type === QuestionType.MULTIPLE_CHOICE && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...createFormData.options, ""]
                              setCreateFormData({...createFormData, options: newOptions})
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          {createFormData.options.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = createFormData.options.filter((_, i) => i !== index)
                                setCreateFormData({...createFormData, options: newOptions})
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-3">
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Input
                id="correctAnswer"
                value={createFormData.correctAnswer}
                onChange={(e) => setCreateFormData({...createFormData, correctAnswer: e.target.value})}
                placeholder="Enter correct answer"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={createFormData.points}
                onChange={(e) => setCreateFormData({...createFormData, points: parseFloat(e.target.value) || 1.0})}
                placeholder="1"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                value={createFormData.explanation}
                onChange={(e) => setCreateFormData({...createFormData, explanation: e.target.value})}
                placeholder="Optional explanation for the answer (supports basic HTML tags)"
                rows={3}
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                Tip: You can use HTML tags like &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;u&gt;underline&lt;/u&gt;, &lt;br&gt; for line breaks
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuestion}>
              Create and Add to Quiz
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}