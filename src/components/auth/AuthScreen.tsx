"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [discordName, setDiscordName] = useState("")
  const [linkCode, setLinkCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, register } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await register(email, password, discordName, linkCode)
    } catch (err: any) {
      setError(err.message || "Failed to register")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[url('/placeholder.svg?height=1080&width=1920')] bg-no-repeat bg-center bg-cover">
      <div className="relative w-full h-full">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-black/10 to-black/80"></div>

        <div className="flex items-center justify-center h-full relative z-10">
          <div className="bg-black/70 backdrop-blur-md p-8 md:p-10 rounded-2xl border-2 border-primary shadow-[0_0_35px_rgba(200,163,101,0.6)] text-center max-w-md w-[90%]">
            {/* Auth Toggle */}
            <div className="flex border border-secondary rounded-lg mb-6 overflow-hidden">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-3 text-lg font-bold transition-all ${
                  activeTab === "login" ? "bg-primary text-black" : "bg-transparent text-secondary"
                }`}
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-3 text-lg font-bold transition-all ${
                  activeTab === "register" ? "bg-primary text-black" : "bg-transparent text-secondary"
                }`}
              >
                Đăng Ký
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className={`space-y-4 ${activeTab === "login" ? "block" : "hidden"}`}>
              <h2 className="text-primary text-2xl font-bold mb-4 text-shadow-glow">Tiên Lộ Mở Rộng</h2>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-black/20 border border-secondary rounded-lg text-white"
              />
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-black/20 border border-secondary rounded-lg text-white"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:bg-secondary text-black hover:text-white text-xl font-bold rounded-lg transition-all"
              >
                {isSubmitting ? "Đang xử lý..." : "Vấn Đạo"}
              </Button>
            </form>

            {/* Register Form */}
            <form onSubmit={handleRegister} className={`space-y-4 ${activeTab === "register" ? "block" : "hidden"}`}>
              <h2 className="text-primary text-2xl font-bold mb-4 text-shadow-glow">Nhập Tiên Môn</h2>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-black/20 border border-secondary rounded-lg text-white"
              />
              <Input
                type="text"
                placeholder="Tên Hiệu"
                value={discordName}
                onChange={(e) => setDiscordName(e.target.value)}
                required
                className="w-full p-3 bg-black/20 border border-secondary rounded-lg text-white"
              />
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-black/20 border border-secondary rounded-lg text-white"
              />
              <Input
                type="text"
                placeholder="Mã Liên Kết (Nếu có)"
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value)}
                className="w-full p-3 bg-black/20 border border-secondary rounded-lg text-white"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:bg-secondary text-black hover:text-white text-xl font-bold rounded-lg transition-all"
              >
                {isSubmitting ? "Đang xử lý..." : "Khai Mở"}
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/10 border border-red-700 rounded-lg text-red-400">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
