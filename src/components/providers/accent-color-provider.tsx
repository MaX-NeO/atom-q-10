
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface AccentColorContextType {
  accentColor: string
  setAccentColor: (color: string) => void
}

const AccentColorContext = createContext<AccentColorContextType>({
  accentColor: "blue",
  setAccentColor: () => {}
})

export const useAccentColor = () => useContext(AccentColorContext)

const colorMappings = {
  blue: "hsl(221.2 83.2% 53.3%)",
  green: "hsl(142.1 76.2% 36.3%)",
  purple: "hsl(262.1 83.3% 57.8%)",
  red: "hsl(346.8 77.2% 49.8%)",
  orange: "hsl(24.6 95% 53.1%)",
  pink: "hsl(330.4 81.2% 60.4%)"
}

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColor] = useState("blue")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings")
        if (response.ok) {
          const settings = await response.json()
          setAccentColor(settings.accentColor || "blue")
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      }
    }

    fetchSettings()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const primaryColor = colorMappings[accentColor as keyof typeof colorMappings] || colorMappings.blue
    
    root.style.setProperty("--primary", primaryColor)
    root.style.setProperty("--primary-foreground", "hsl(0 0% 98%)")
  }, [accentColor])

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </AccentColorContext.Provider>
  )
}
