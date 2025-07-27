"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { VapiTextChat } from "./vapi-text-chat"
import { MessageSquare, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface ChatToggleProps {
  agentId: string
}

export function ChatToggle({ agentId }: ChatToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <VapiTextChat agentId={agentId} />
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full w-16 h-16 shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 ${
          isOpen
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-300"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : <MessageSquare className="w-7 h-7 text-white" />}
      </Button>
    </div>
  )
}
