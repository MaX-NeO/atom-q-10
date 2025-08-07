"use client"

import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { SessionProviderWrapper } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AccentColorProvider } from "@/components/providers/accent-color-provider"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AccentColorProvider>
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
              <Toaster richColors position="top-right" />
            </AccentColorProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}