"use client"

import { SessionProvider } from "next-auth/react"

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProviderWrapper({ children }: SessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}