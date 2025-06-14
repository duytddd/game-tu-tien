"use client"

import type React from "react"

import { AuthProvider } from "@/hooks/use-auth"
import { GameStateProvider } from "@/hooks/use-game-state"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GameStateProvider>{children}</GameStateProvider>
    </AuthProvider>
  )
}
