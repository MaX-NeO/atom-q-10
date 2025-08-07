"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

const userNavItems = [
  {
    title: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    title: "Quiz",
    href: "/user/quiz",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/user/settings",
    icon: Settings,
  },
]

export function AppSidebar({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r transition-all duration-300",
      open ? "w-64" : "w-16"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        {open && (
          <h2 className="text-lg font-semibold">QuizMaster</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            toggleSidebar()
            onOpenChange(!open)
          }}
          className="h-8 w-8"
        >
          {open ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {userNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {open && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}