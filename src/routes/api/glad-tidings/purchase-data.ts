import { json } from '@tanstack/start'

const GLAD_TIDINGS_API_KEY = import.meta.env.VITE_GLAD_TIDINGS_API_KEY || ""
const GLAD_TIDINGS_BASE_URL = "https://api.gladtidings.app"

export async function POST({ request }: { request: Request }) {
  try {
    if (!GLAD_TIDINGS_API_KEY) {
      throw new Error("Glad Tidings API key not configured")
    }

    const body = await request.json()

    const response = await fetch(`${GLAD_TIDINGS_BASE_URL}/purchase/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GLAD_TIDINGS_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return json(data)
  } catch (error) {
    console.error("Error purchasing data:", error)
    return json({ error: "Failed to purchase data bundle" }, { status: 500 })
  }
}
