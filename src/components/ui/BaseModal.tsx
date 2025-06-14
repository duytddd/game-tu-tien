"use client"

import type React from "react"

import { X } from "lucide-react"

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function BaseModal({ isOpen, onClose, title, children }: BaseModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-dark-bg m-auto p-8 border-2 border-primary rounded-[15px] w-[90%] max-w-[700px] relative shadow-[0_0_30px_var(--primary-color)]">
        <button onClick={onClose} className="absolute top-2.5 right-5 text-gray-400 text-3xl font-bold cursor-pointer">
          <X size={28} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-primary">{title}</h2>

        {children}
      </div>
    </div>
  )
}
