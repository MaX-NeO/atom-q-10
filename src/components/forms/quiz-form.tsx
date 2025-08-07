
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { DifficultyLevel, QuizStatus } from "@prisma/client"
import { createQuizSchema, updateQuizSchema } from "@/schema/quiz"
import { createQuizAction, updateQuizAction } from "@/actions/quiz"
import type { z } from "zod"
import type { Quiz } from "@/types/quiz"

type CreateQuizFormData = z.infer<typeof createQuizSchema>
type UpdateQuizFormData = z.infer<typeof updateQuizSchema>

interface QuizFormProps {
  quiz?: Quiz
  creatorId?: string
  onSuccess?: (quizId?: string) => void
  onError?: (error: string) => void
}

export function QuizForm({ quiz, creatorId, onSuccess, onError }: QuizFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const isEdit = !!quiz

  const form = useForm<CreateQuizFormData | UpdateQuizFormData>({
    resolver: zodResolver(isEdit ? updateQuizSchema : createQuizSchema),
    defaultValues: {
      title: quiz?.title || "",
      description: quiz?.description || "",
      timeLimit: quiz?.timeLimit?.toString() || "",
      difficulty: quiz?.difficulty || DifficultyLevel.MEDIUM,
      negativeMarking: quiz?.negativeMarking || false,
      negativePoints: quiz?.negativePoints?.toString() || "",
      randomOrder: quiz?.randomOrder || false,
      maxAttempts: quiz?.maxAttempts?.toString() || "",
      showAnswers: quiz?.showAnswers || false,
      startTime: quiz?.startTime ? new Date(quiz.startTime).toISOString().slice(0, 16) : "",
      endTime: quiz?.endTime ? new Date(quiz.endTime).toISOString().slice(0, 16) : "",
      checkAnswerEnabled: quiz?.checkAnswerEnabled || false,
      ...(isEdit && { status: quiz.status }),
    }
  })

  const watchNegativeMarking = form.watch("negativeMarking")
  const watchMaxAttempts = form.watch("maxAttempts")

  const onSubmit = async (data: CreateQuizFormData | UpdateQuizFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      const result = isEdit 
        ? await updateQuizAction(quiz!.id, formData)
        : await createQuizAction(creatorId!, formData)

      if (result?.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof (CreateQuizFormData | UpdateQuizFormData), {
            message: messages?.[0]
          })
        })
        const errorMessage = result.message || "Validation failed"
        setError(errorMessage)
        onError?.(errorMessage)
      } else if (result?.message && !result.success) {
        setError(result.message)
        onError?.(result.message)
      } else {
        onSuccess?.(result?.quizId)
      }
    } catch (error) {
      const errorMessage = "An error occurred. Please try again."
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter quiz title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter quiz description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(DifficultyLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Limit (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Leave empty for no limit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEdit && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(QuizStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="negativeMarking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Negative Marking</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watchNegativeMarking && (
          <FormField
            control={form.control}
            name="negativePoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Negative Points</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Enter negative points" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="randomOrder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Random Order</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showAnswers"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Answers</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="maxAttempts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Attempts</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Leave empty for unlimited attempts" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="checkAnswerEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Check Answer Enabled</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEdit ? "Update Quiz" : "Create Quiz"
          )}
        </Button>
      </form>
    </Form>
  )
}
