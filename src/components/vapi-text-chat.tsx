"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2, Bot, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

interface VapiTextChatProps {
  agentId: string
}

export function VapiTextChat({ agentId }: VapiTextChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Backend URL - adjust this to match your backend server
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startSession = () => {
    if (!agentId?.trim()) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "system",
          content: "Agent ID is required to start the chat.",
          timestamp: new Date().toISOString(),
        },
      ])
      return
    }

    setIsConnected(true)
    setMessages([
      {
        id: Date.now().toString(),
        role: "system",
        content: `Chat session started with Agent ID: ${agentId}. You can now ask me questions!`,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const endSession = () => {
    setIsConnected(false)
    setMessages([])
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() === "" || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    // Add user message to display immediately
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Send request to your backend
      const response = await fetch(`${BACKEND_URL}/chat/${agentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          system_prompt: "You are a helpful AI assistant. Answer questions based on your knowledge base.",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I don't have information about that.",
        timestamp: data.timestamp || new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: `Error: ${error instanceof Error ? error.message : "Failed to send message. Please try again."}`,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusMessage = () => {
    if (!isConnected) return "Enter Agent ID to start"
    if (isLoading) return "AI is thinking..."
    return `Connected to Agent: ${agentId}`
  }

  return (
    <Card className="w-full max-w-md h-[550px] flex flex-col rounded-xl shadow-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" /> AI Chat Assistant
        </CardTitle>
        <p className="text-sm text-blue-100">{getStatusMessage()}</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 && !isConnected && (
            <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
              <p>Enter your Agent ID and click Start Chat to begin!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex items-start gap-3 mb-4", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "system" ? (
                <div className="text-xs text-gray-500 italic w-full text-center p-2 bg-gray-50 rounded-lg">
                  {message.content}
                </div>
              ) : (
                <>
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-3 rounded-2xl max-w-[80%] text-sm shadow-md",
                      message.role === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none",
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 mb-4 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl max-w-[80%] text-sm shadow-md bg-gray-100 text-gray-800 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-gray-50">
        {!isConnected ? (
          <div className="flex w-full gap-2">
            <Button
              onClick={startSession}
              disabled={!agentId?.trim()}
              className="flex-1 rounded-full h-10 bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Start Chat
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || input.trim() === ""}
              className="rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
            <Button
              onClick={endSession}
              type="button"
              className="rounded-full w-10 h-10 p-0 bg-red-600 hover:bg-red-700 transition-colors"
              aria-label="End chat"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">End chat</span>
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  )
}
