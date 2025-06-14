"use client"

import { useEffect, useState } from "react"
import { useGameState } from "@/hooks/use-game-state"

export default function LevelSystem() {
  const { currentUserData, gameConfig } = useGameState()
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false)
  const [lastLevel, setLastLevel] = useState<number | null>(null)

  useEffect(() => {
    if (!currentUserData) return

    const currentLevel = currentUserData.level || 1

    // Check if level has increased
    if (lastLevel !== null && currentLevel > lastLevel) {
      setShowLevelUpEffect(true)

      // Create level up text animation
      const levelUpText = document.createElement("div")
      levelUpText.className =
        "fixed left-1/2 top-[40%] -translate-x-1/2 text-primary text-4xl font-bold animate-level-up-pulse pointer-events-none z-50 text-center whitespace-nowrap"
      levelUpText.textContent = `Đột Phá! Cảnh Giới ${getTitleFromLevel(currentLevel)}`
      document.body.appendChild(levelUpText)

      // Remove level up effect after animation
      setTimeout(() => {
        setShowLevelUpEffect(false)
        if (levelUpText.parentNode) {
          levelUpText.remove()
        }
      }, 2000)
    }

    setLastLevel(currentLevel)
  }, [currentUserData?.level])

  if (!currentUserData || !gameConfig) {
    return null
  }

  const level = currentUserData.level || 1
  const exp = currentUserData.exp || 0
  const expNeeded = currentUserData.expNeeded || Math.floor(gameConfig.expBase * Math.pow(level, gameConfig.expPower))
  const expPercentage = Math.min(100, (exp / expNeeded) * 100)
  const levelTitle = getTitleFromLevel(level)

  function getTitleFromLevel(level: number): string {
    if (!gameConfig?.levelTitles) return "N/A"

    let title = "Không rõ"
    const sortedTitleLevels = Object.keys(gameConfig.levelTitles)
      .map(Number)
      .sort((a, b) => b - a)

    for (const titleLevel of sortedTitleLevels) {
      if (level >= titleLevel) {
        title = gameConfig.levelTitles[titleLevel.toString()]
        break
      }
    }

    return title
  }

  return (
    <div className="flex flex-col ml-2.5 min-w-[180px] bg-dark-bg p-2 px-3 rounded-lg border border-secondary">
      <div className="font-bold text-primary text-shadow-glow text-center text-sm mb-0.5">
        Cảnh Giới: {levelTitle} ({level})
      </div>

      <div className="h-2.5 bg-black/50 rounded-md overflow-hidden border border-secondary relative my-0.5">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-primary rounded-md transition-all duration-500"
          style={{ width: `${expPercentage}%` }}
        ></div>
      </div>

      <div className="text-xs text-center text-gray-300 mt-0.5">
        Tu Vi: {exp.toLocaleString()}/{expNeeded.toLocaleString()}
      </div>

      {/* Level up effect overlay */}
      {showLevelUpEffect && (
        <div className="fixed inset-0 bg-radial-gradient pointer-events-none z-40 opacity-30 transition-opacity duration-500"></div>
      )}
    </div>
  )
}
