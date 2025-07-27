import { ChatToggle } from "@/components/chat-toggle"

export default function HomePage() {
  // You can set your default agent ID here or make it configurable
  const defaultAgentId = "80db399f-28fa-4b53-8f0f-df5b18278402"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-800 drop-shadow-sm">Welcome to AI Chat Assistant</h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-lg mx-auto">
          Click the floating chat icon to start a conversation with your AI assistant powered by your custom knowledge
          base!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Responses</h3>
            <p className="text-gray-600 text-sm">Get intelligent answers based on your custom knowledge base</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Chat</h3>
            <p className="text-gray-600 text-sm">Instant responses with a smooth, modern chat interface</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Always Available</h3>
            <p className="text-gray-600 text-sm">24/7 AI assistant ready to help with your questions</p>
          </div>
        </div>
      </div>
      <ChatToggle agentId={defaultAgentId} />
    </main>
  )
}
