"use client"

import { useRef, useEffect } from "react"
import { useGameState } from "@/hooks/use-game-state"

export default function GameCanvasPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentTargetId, currentTargetData } = useGameState()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Get context for drawing
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Game rendering loop
    let animationFrameId: number

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw placeholder content
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw player placeholder
      ctx.fillStyle = "#c8a365"
      ctx.fillRect(100, canvas.height / 2 - 75, 150, 150)

      // Draw target placeholder if there's a target
      if (currentTargetId && currentTargetData) {
        ctx.fillStyle = "#8b5e34"
        ctx.fillRect(canvas.width - 300, canvas.height / 2 - 125, 250, 250)

        // Draw target info
        ctx.font = 'bold 20px "Eczar"'
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(
          `${currentTargetData.name || "Target"} (Cấp ${currentTargetData.level || 1})`,
          canvas.width - 175,
          canvas.height / 2 - 150,
        )
      }

      animationFrameId = window.requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [currentTargetId, currentTargetData])

  return <canvas id="game-canvas" ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-10" />
}
