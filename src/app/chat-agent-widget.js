/**
 * Chat Agent Widget - Configurable Version
 * Configuration is passed through script tag data attributes
 */

;(() => {
  // Get the current script element to read configuration
  const currentScript =
    document.currentScript ||
    (() => {
      const scripts = document.getElementsByTagName("script")
      return scripts[scripts.length - 1]
    })()

  // Read configuration from script data attributes
  function getScriptConfig() {
    const config = {}

    // Get all data attributes from the script tag
    if (currentScript && currentScript.dataset) {
      Object.keys(currentScript.dataset).forEach((key) => {
        const value = currentScript.dataset[key]

        // Convert string values to appropriate types
        if (value === "true") config[key] = true
        else if (value === "false") config[key] = false
        else if (!isNaN(value) && value !== "") config[key] = Number(value)
        else config[key] = value
      })
    }

    return config
  }

  // Default configuration - can be overridden by script data attributes
  const DEFAULT_CONFIG = {
    agentId: "", // Must be provided via data-agent-id
    backendUrl: "http://localhost:8000", // Your backend URL
    position: "bottom-right", // bottom-right, bottom-left, top-right, top-left
    theme: "blue", // blue, purple, green, red
    autoOpen: false, // Auto-open chat on page load
    showWelcomeMessage: true, // Show welcome message
    welcomeMessage: "Hello! How can I help you today?", // Custom welcome message
    title: "🤖 AI Chat Assistant", // Widget title
    placeholder: "Type your message...", // Input placeholder
    buttonText: "Start Chat", // Start button text
    // Advanced settings
    maxRetries: 3, // Max retry attempts for failed requests
    retryDelay: 1000, // Delay between retries (ms)
    typingDelay: 500, // Simulated typing delay (ms)
    enableSounds: false, // Enable notification sounds
    enableAnimations: true, // Enable animations
    showTimestamps: false, // Show message timestamps
    allowFileUpload: false, // Enable file upload (future feature)
    maxMessageLength: 1000, // Max characters per message
    // Styling
    borderRadius: "16px", // Widget border radius
    shadowIntensity: "medium", // low, medium, high
    fontSize: "14px", // Base font size
    // Behavior
    closeOnClickOutside: false, // Close when clicking outside
    rememberState: true, // Remember open/closed state
    showOnMobile: true, // Show on mobile devices
    mobileBreakpoint: 768, // Mobile breakpoint in pixels
  }

  // Merge default config with script config
  const WIDGET_CONFIG = { ...DEFAULT_CONFIG, ...getScriptConfig() }

  class ChatAgentWidget {
    constructor(config = {}) {
      this.config = { ...WIDGET_CONFIG, ...config }
      this.isOpen = this.loadState("isOpen", this.config.autoOpen)
      this.isConnected = false
      this.isLoading = false
      this.messages = []
      this.retryCount = 0
      this.messageId = 0

      this.init()
    }

    init() {
      // Check if agent ID is provided
      if (!this.config.agentId || this.config.agentId.trim() === "") {
        console.error("Chat Widget: Agent ID is required. Please add data-agent-id attribute to the script tag.")
        this.showConfigurationError()
        return
      }

      // Check if mobile and mobile is disabled
      if (!this.config.showOnMobile && this.isMobile()) {
        console.log("Chat widget disabled on mobile")
        return
      }

      this.injectStyles()
      this.createWidget()
      this.bindEvents()

      if (this.config.showWelcomeMessage && this.config.autoOpen) {
        setTimeout(() => this.startSession(), 500)
      }

      // Load previous state if enabled
      if (this.config.rememberState) {
        this.loadPreviousState()
      }
    }

    showConfigurationError() {
      // Create a simple error message widget
      const errorHTML = `
                <div class="chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
                    <div style="background: #ef4444; color: white; padding: 12px 16px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <strong>⚠️ Chat Widget Error</strong><br>
                        Agent ID is required. Please add:<br>
                        <code style="background: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 3px; font-size: 12px;">data-agent-id="your-agent-id"</code><br>
                        to your script tag.
                    </div>
                </div>
            `
      document.body.insertAdjacentHTML("beforeend", errorHTML)
    }

    isMobile() {
      return window.innerWidth <= this.config.mobileBreakpoint
    }

    loadState(key, defaultValue) {
      if (!this.config.rememberState) return defaultValue
      try {
        const saved = localStorage.getItem(`chatWidget_${key}`)
        return saved !== null ? JSON.parse(saved) : defaultValue
      } catch {
        return defaultValue
      }
    }

    saveState(key, value) {
      if (!this.config.rememberState) return
      try {
        localStorage.setItem(`chatWidget_${key}`, JSON.stringify(value))
      } catch {
        // Ignore localStorage errors
      }
    }

    loadPreviousState() {
      const savedMessages = this.loadState("messages", [])
      const savedConnected = this.loadState("isConnected", false)

      if (savedMessages.length > 0) {
        this.messages = savedMessages
        this.isConnected = savedConnected
        this.renderAllMessages()
        this.renderInputForm()
        this.updateStatus(savedConnected ? `Connected to Agent: ${this.config.agentId}` : "Enter Agent ID to start")
      }
    }

    injectStyles() {
      if (document.getElementById("chat-widget-styles")) return

      const shadowStyles = {
        low: "0 2px 10px rgba(0, 0, 0, 0.1)",
        medium: "0 4px 20px rgba(0, 0, 0, 0.15)",
        high: "0 8px 30px rgba(0, 0, 0, 0.25)",
      }

      const styles = `
                .chat-widget {
                    position: fixed;
                    ${this.getPositionStyles()}
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    font-size: ${this.config.fontSize};
                }

                .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${this.getThemeColors().primary};
                    border: none;
                    cursor: pointer;
                    box-shadow: ${shadowStyles[this.config.shadowIntensity]};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: white;
                    font-size: 24px;
                    user-select: none;
                }

                .chat-toggle-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
                }

                .chat-toggle-btn:active {
                    transform: scale(0.95);
                }

                .chat-toggle-btn.close {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .chat-container {
                    position: absolute;
                    ${this.getContainerPosition()}
                    width: 380px;
                    height: 550px;
                    background: white;
                    border-radius: ${this.config.borderRadius};
                    box-shadow: ${shadowStyles.high};
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    transform: translateY(20px);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .chat-container.open {
                    display: flex;
                    transform: translateY(0);
                    opacity: 1;
                }

                .chat-header {
                    background: ${this.getThemeColors().primary};
                    color: white;
                    padding: 16px;
                    position: relative;
                    overflow: hidden;
                }

                .chat-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
                    pointer-events: none;
                }

                .chat-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    position: relative;
                    z-index: 1;
                }

                .chat-status {
                    font-size: 12px;
                    opacity: 0.9;
                    margin-top: 4px;
                    position: relative;
                    z-index: 1;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    background: linear-gradient(to bottom, #fafafa, #f5f5f5);
                    scroll-behavior: smooth;
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.2);
                    border-radius: 3px;
                }

                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.3);
                }

                .message {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    animation: ${this.config.enableAnimations ? "messageSlideIn 0.3s ease-out" : "none"};
                }

                .message.user {
                    flex-direction: row-reverse;
                }

                .message.system {
                    justify-content: center;
                }

                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .message-avatar.bot {
                    background: ${this.getThemeColors().primary};
                    color: white;
                }

                .message-avatar.user {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                    color: white;
                }

                .message-content {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 16px;
                    font-size: ${this.config.fontSize};
                    line-height: 1.4;
                    word-wrap: break-word;
                    position: relative;
                }

                .message.user .message-content {
                    background: ${this.getThemeColors().primary};
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.assistant .message-content {
                    background: white;
                    color: #374151;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                }

                .message.system .message-content {
                    background: rgba(107, 114, 128, 0.1);
                    color: #6b7280;
                    font-style: italic;
                    text-align: center;
                    border-radius: 8px;
                    font-size: 12px;
                    backdrop-filter: blur(10px);
                }

                .message-timestamp {
                    font-size: 10px;
                    color: #9ca3af;
                    margin-top: 4px;
                    text-align: ${this.config.showTimestamps ? "inherit" : "center"};
                    display: ${this.config.showTimestamps ? "block" : "none"};
                }

                .chat-input-container {
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                    backdrop-filter: blur(10px);
                }

                .chat-input-form {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 24px;
                    outline: none;
                    font-size: ${this.config.fontSize};
                    transition: all 0.2s ease;
                    background: #f9fafb;
                    max-length: ${this.config.maxMessageLength};
                }

                .chat-input:focus {
                    border-color: ${this.getThemeColors().primarySolid};
                    box-shadow: 0 0 0 3px ${this.getThemeColors().primaryLight};
                    background: white;
                }

                .chat-input:disabled {
                    background: #f3f4f6;
                    cursor: not-allowed;
                }

                .chat-send-btn, .chat-end-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    font-size: 16px;
                    position: relative;
                    overflow: hidden;
                }

                .chat-send-btn {
                    background: ${this.getThemeColors().primary};
                    color: white;
                }

                .chat-send-btn:hover:not(:disabled) {
                    background: ${this.getThemeColors().primaryDark};
                    transform: scale(1.05);
                }

                .chat-send-btn:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                }

                .chat-end-btn {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                }

                .chat-end-btn:hover {
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    transform: scale(1.05);
                }

                .chat-start-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                    border-radius: 24px;
                    cursor: pointer;
                    font-size: ${this.config.fontSize};
                    font-weight: 500;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .chat-start-btn:hover {
                    background: linear-gradient(135deg, #059669, #047857);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .chat-start-btn:active {
                    transform: translateY(0);
                }

                .loading-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #6b7280;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #e5e7eb;
                    border-top: 2px solid ${this.getThemeColors().primarySolid};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 8px 12px;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #9ca3af;
                    animation: typingPulse 1.4s infinite ease-in-out;
                }

                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes typingPulse {
                    0%, 60%, 100% {
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    30% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                }

                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% {
                        transform: translate3d(0,0,0);
                    }
                    40%, 43% {
                        transform: translate3d(0, -8px, 0);
                    }
                    70% {
                        transform: translate3d(0, -4px, 0);
                    }
                    90% {
                        transform: translate3d(0, -2px, 0);
                    }
                }

                /* Mobile responsive */
                @media (max-width: ${this.config.mobileBreakpoint}px) {
                    .chat-container {
                        width: calc(100vw - 20px);
                        height: calc(100vh - 100px);
                        right: 10px;
                        left: 10px;
                        bottom: 80px;
                    }
                    
                    .chat-widget {
                        right: 15px;
                        bottom: 15px;
                    }
                    
                    .message-content {
                        max-width: 85%;
                        font-size: 13px;
                    }
                }

                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .chat-container {
                        background: #1f2937;
                        color: #f9fafb;
                    }
                    
                    .chat-messages {
                        background: linear-gradient(to bottom, #111827, #1f2937);
                    }
                    
                    .message.assistant .message-content {
                        background: #374151;
                        color: #f9fafb;
                        border-color: #4b5563;
                    }
                    
                    .chat-input-container {
                        background: #1f2937;
                        border-color: #374151;
                    }
                    
                    .chat-input {
                        background: #374151;
                        border-color: #4b5563;
                        color: #f9fafb;
                    }
                    
                    .chat-input:focus {
                        background: #4b5563;
                    }
                }
            `

      const styleSheet = document.createElement("style")
      styleSheet.id = "chat-widget-styles"
      styleSheet.textContent = styles
      document.head.appendChild(styleSheet)
    }

    getPositionStyles() {
      const positions = {
        "bottom-left": "bottom: 20px; left: 20px;",
        "top-right": "top: 20px; right: 20px;",
        "top-left": "top: 20px; left: 20px;",
        "bottom-right": "bottom: 20px; right: 20px;",
      }
      return positions[this.config.position] || positions["bottom-right"]
    }

    getContainerPosition() {
      const positions = {
        "bottom-left": "bottom: 80px; left: 0;",
        "top-right": "top: 80px; right: 0;",
        "top-left": "top: 80px; left: 0;",
        "bottom-right": "bottom: 80px; right: 0;",
      }
      return positions[this.config.position] || positions["bottom-right"]
    }

    getThemeColors() {
      const themes = {
        blue: {
          primary: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          primarySolid: "#3b82f6",
          primaryDark: "#2563eb",
          primaryLight: "rgba(59, 130, 246, 0.1)",
        },
        purple: {
          primary: "linear-gradient(135deg, #8b5cf6, #a855f7)",
          primarySolid: "#8b5cf6",
          primaryDark: "#7c3aed",
          primaryLight: "rgba(139, 92, 246, 0.1)",
        },
        green: {
          primary: "linear-gradient(135deg, #10b981, #059669)",
          primarySolid: "#10b981",
          primaryDark: "#047857",
          primaryLight: "rgba(16, 185, 129, 0.1)",
        },
        red: {
          primary: "linear-gradient(135deg, #ef4444, #dc2626)",
          primarySolid: "#ef4444",
          primaryDark: "#b91c1c",
          primaryLight: "rgba(239, 68, 68, 0.1)",
        },
      }
      return themes[this.config.theme] || themes.blue
    }

    createWidget() {
      const widgetHTML = `
                <div class="chat-widget" id="chatWidget">
                    <div class="chat-container" id="chatContainer">
                        <div class="chat-header">
                            <div>
                                <h3>${this.config.title}</h3>
                                <div class="chat-status" id="chatStatus">Ready to chat</div>
                            </div>
                        </div>
                        <div class="chat-messages" id="chatMessages">
                            ${
                              !this.config.showWelcomeMessage
                                ? `
                                <div class="message system">
                                    <div class="message-content">
                                        Click "${this.config.buttonText}" to begin!
                                    </div>
                                </div>
                            `
                                : ""
                            }
                        </div>
                        <div class="chat-input-container">
                            <div id="chatInputForm"></div>
                        </div>
                    </div>
                    <button class="chat-toggle-btn" id="chatToggleBtn" title="Open Chat">
                        💬
                    </button>
                </div>
            `

      document.body.insertAdjacentHTML("beforeend", widgetHTML)
      this.renderInputForm()

      if (this.isOpen) {
        document.getElementById("chatContainer").classList.add("open")
        document.getElementById("chatToggleBtn").classList.add("close")
        document.getElementById("chatToggleBtn").innerHTML = "✕"
        document.getElementById("chatToggleBtn").title = "Close Chat"
      }
    }

    bindEvents() {
      const toggleBtn = document.getElementById("chatToggleBtn")
      toggleBtn.addEventListener("click", () => this.toggleChat())

      // Close on click outside if enabled
      if (this.config.closeOnClickOutside) {
        document.addEventListener("click", (e) => {
          const widget = document.getElementById("chatWidget")
          if (this.isOpen && !widget.contains(e.target)) {
            this.toggleChat()
          }
        })
      }

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        // ESC to close
        if (e.key === "Escape" && this.isOpen) {
          this.toggleChat()
        }
        // Ctrl/Cmd + K to toggle
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault()
          this.toggleChat()
        }
      })
    }

    toggleChat() {
      this.isOpen = !this.isOpen
      this.saveState("isOpen", this.isOpen)

      const container = document.getElementById("chatContainer")
      const toggleBtn = document.getElementById("chatToggleBtn")

      if (this.isOpen) {
        container.classList.add("open")
        toggleBtn.classList.add("close")
        toggleBtn.innerHTML = "✕"
        toggleBtn.title = "Close Chat"

        // Focus input if connected
        setTimeout(() => {
          const input = document.getElementById("messageInput")
          if (input && this.isConnected) {
            input.focus()
          }
        }, 300)
      } else {
        container.classList.remove("open")
        toggleBtn.classList.remove("close")
        toggleBtn.innerHTML = "💬"
        toggleBtn.title = "Open Chat"
      }
    }

    renderInputForm() {
      const formContainer = document.getElementById("chatInputForm")

      if (!this.isConnected) {
        formContainer.innerHTML = `
                    <button class="chat-start-btn" onclick="window.chatAgentWidget.startSession()">
                        🚀 ${this.config.buttonText}
                    </button>
                `
      } else {
        formContainer.innerHTML = `
                    <div class="chat-input-form">
                        <input 
                            type="text" 
                            class="chat-input" 
                            id="messageInput"
                            placeholder="${this.config.placeholder}"
                            maxlength="${this.config.maxMessageLength}"
                            ${this.isLoading ? "disabled" : ""}
                        >
                        <button 
                            class="chat-send-btn" 
                            id="sendBtn"
                            onclick="window.chatAgentWidget.sendMessage()"
                            ${this.isLoading ? "disabled" : ""}
                            title="Send message"
                        >
                            ${this.isLoading ? '<div class="spinner"></div>' : "➤"}
                        </button>
                        <button 
                            class="chat-end-btn" 
                            onclick="window.chatAgentWidget.endSession()"
                            title="End chat"
                        >
                            ✕
                        </button>
                    </div>
                `

        const input = document.getElementById("messageInput")
        if (input) {
          input.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !this.isLoading) {
              this.sendMessage()
            }
          })

          // Character counter
          input.addEventListener("input", (e) => {
            const remaining = this.config.maxMessageLength - e.target.value.length
            if (remaining < 50) {
              input.style.borderColor = remaining < 10 ? "#ef4444" : "#f59e0b"
            } else {
              input.style.borderColor = "#e5e7eb"
            }
          })
        }
      }
    }

    startSession() {
      if (!this.config.agentId?.trim()) {
        this.addMessage("system", "Agent ID is required to start the chat.")
        return
      }

      this.isConnected = true
      this.messages = []
      this.clearMessages()

      if (this.config.showWelcomeMessage) {
        this.addMessage("assistant", this.config.welcomeMessage)
      }

      this.addMessage("system", `Connected to Agent: ${this.config.agentId}`)
      this.updateStatus(`Connected to Agent: ${this.config.agentId}`)
      this.renderInputForm()
      this.saveState("isConnected", true)
      this.saveState("messages", this.messages)

      // Auto-focus input
      setTimeout(() => {
        const input = document.getElementById("messageInput")
        if (input) input.focus()
      }, 100)
    }

    endSession() {
      this.isConnected = false
      this.isLoading = false
      this.messages = []
      this.clearMessages()
      this.addMessage("system", 'Chat session ended. Click "Start Chat" to begin again!')
      this.updateStatus("Ready to chat")
      this.renderInputForm()
      this.saveState("isConnected", false)
      this.saveState("messages", [])
    }

    async sendMessage() {
      const input = document.getElementById("messageInput")
      const message = input?.value?.trim()

      if (!message || this.isLoading) return

      // Validate message length
      if (message.length > this.config.maxMessageLength) {
        this.addMessage("system", `Message too long. Maximum ${this.config.maxMessageLength} characters allowed.`)
        return
      }

      this.addMessage("user", message)
      input.value = ""
      this.setLoading(true)

      // Simulate typing delay
      if (this.config.typingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.config.typingDelay))
      }

      await this.sendToBackend(message)
    }

    async sendToBackend(message, attempt = 1) {
      try {
        const response = await fetch(`${this.config.backendUrl}/chat/${this.config.agentId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            system_prompt: "You are a helpful AI assistant. Answer questions based on your knowledge base.",
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        this.addMessage("assistant", data.response || "Sorry, I don't have information about that.")
        this.retryCount = 0 // Reset retry count on success
      } catch (error) {
        console.error("Error sending message:", error)

        // Retry logic
        if (attempt < this.config.maxRetries) {
          console.log(`Retrying... Attempt ${attempt + 1}/${this.config.maxRetries}`)
          setTimeout(() => {
            this.sendToBackend(message, attempt + 1)
          }, this.config.retryDelay * attempt)
          return
        }

        // Max retries reached
        this.addMessage(
          "system",
          `Connection error: ${error.message}. Please check your internet connection and try again.`,
        )
      } finally {
        this.setLoading(false)
      }
    }

    setLoading(loading) {
      this.isLoading = loading
      this.updateStatus(loading ? "AI is thinking..." : `Connected to Agent: ${this.config.agentId}`)
      this.renderInputForm()

      if (loading) {
        this.addTypingIndicator()
      } else {
        this.removeTypingIndicator()
      }
    }

    addMessage(role, content) {
      const message = {
        id: ++this.messageId,
        role,
        content,
        timestamp: new Date().toISOString(),
      }

      this.messages.push(message)
      this.renderMessage(message)
      this.scrollToBottom()
      this.saveState("messages", this.messages)

      // Play sound notification
      if (this.config.enableSounds && role === "assistant") {
        this.playNotificationSound()
      }
    }

    renderMessage(message) {
      const messagesContainer = document.getElementById("chatMessages")
      const messageDiv = document.createElement("div")
      messageDiv.className = `message ${message.role}`
      messageDiv.id = `message-${message.id}`

      const timestamp = this.config.showTimestamps
        ? `<div class="message-timestamp">${new Date(message.timestamp).toLocaleTimeString()}</div>`
        : ""

      if (message.role === "system") {
        messageDiv.innerHTML = `
                    <div class="message-content">
                        ${message.content}
                        ${timestamp}
                    </div>
                `
      } else {
        const avatar =
          message.role === "assistant"
            ? '<div class="message-avatar bot">🤖</div>'
            : '<div class="message-avatar user">👤</div>'

        messageDiv.innerHTML = `
                    ${message.role === "assistant" ? avatar : ""}
                    <div class="message-content">
                        ${message.content}
                        ${timestamp}
                    </div>
                    ${message.role === "user" ? avatar : ""}
                `
      }

      messagesContainer.appendChild(messageDiv)
    }

    renderAllMessages() {
      this.clearMessages()
      this.messages.forEach((message) => this.renderMessage(message))
    }

    addTypingIndicator() {
      const messagesContainer = document.getElementById("chatMessages")
      const typingDiv = document.createElement("div")
      typingDiv.className = "message assistant"
      typingDiv.id = "typing-indicator"
      typingDiv.innerHTML = `
                <div class="message-avatar bot">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `
      messagesContainer.appendChild(typingDiv)
      this.scrollToBottom()
    }

    removeTypingIndicator() {
      const typingIndicator = document.getElementById("typing-indicator")
      if (typingIndicator) {
        typingIndicator.remove()
      }
    }

    clearMessages() {
      const messagesContainer = document.getElementById("chatMessages")
      messagesContainer.innerHTML = ""
    }

    updateStatus(status) {
      const statusElement = document.getElementById("chatStatus")
      if (statusElement) {
        statusElement.textContent = status
      }
    }

    scrollToBottom() {
      const messagesContainer = document.getElementById("chatMessages")
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }

    playNotificationSound() {
      if (!this.config.enableSounds) return

      // Create a simple notification sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch {
        // Ignore audio errors
      }
    }

    // Public API methods
    setAgentId(agentId) {
      this.config.agentId = agentId
      if (this.isConnected) {
        this.endSession()
      }
    }

    setBackendUrl(url) {
      this.config.backendUrl = url
    }

    open() {
      if (!this.isOpen) {
        this.toggleChat()
      }
    }

    close() {
      if (this.isOpen) {
        this.toggleChat()
      }
    }

    destroy() {
      const widget = document.getElementById("chatWidget")
      const styles = document.getElementById("chat-widget-styles")

      if (widget) widget.remove()
      if (styles) styles.remove()

      // Clear saved state
      if (this.config.rememberState) {
        ;["isOpen", "isConnected", "messages"].forEach((key) => {
          try {
            localStorage.removeItem(`chatWidget_${key}`)
          } catch {
            // Ignore errors
          }
        })
      }

      delete window.chatAgentWidget
      delete window.ChatAgentWidget
    }
  }

  // Auto-initialize when DOM is ready
  function initializeWidget() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        window.chatAgentWidget = new ChatAgentWidget()
        window.ChatAgentWidget = ChatAgentWidget
      })
    } else {
      // DOM is already ready
      window.chatAgentWidget = new ChatAgentWidget()
      window.ChatAgentWidget = ChatAgentWidget
    }
  }

  // Initialize the widget
  initializeWidget()
})()
