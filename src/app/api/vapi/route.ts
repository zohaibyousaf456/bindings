import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY
  const VAPI_BASE_URL = process.env.VAPI_BASE_URL || "https://api.vapi.ai"
  const VAPI_AGENT_ID = process.env.VAPI_AGENT_ID

  if (!VAPI_PRIVATE_KEY || !VAPI_AGENT_ID) {
    return NextResponse.json(
      { error: "Server configuration error: VAPI_PRIVATE_KEY or VAPI_AGENT_ID not set." },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        agentId: VAPI_AGENT_ID,
        type: "web", // Initiating a web call
        // For text-only, Vapi still needs a 'call' session.
        // You might configure your agent in Vapi dashboard to handle text input.
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Vapi API error:", errorData)
      return NextResponse.json(
        { error: "Failed to create Vapi web call", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ callId: data.id })
  } catch (error) {
    console.error("Error creating Vapi web call:", error)
    return NextResponse.json({ error: "Internal server error while creating Vapi web call" }, { status: 500 })
  }
}
