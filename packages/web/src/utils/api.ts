/**
 * Backend API client
 *
 * Connects to the Bun/Hono backend for IPFS pinning and enriched score data.
 * Falls back gracefully if backend is not available.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ApiResponse<TData> {
  data: TData
}

interface ApiError {
  error: string
  message: string
}

// ─── Pin Invoice to IPFS ─────────────────────────────────────────────

export interface PinRequest {
  file: File
  invoiceNumber: string
  dueDate: string
  counterparty: string
  amount: string
  currency: string
  receiver: string
  senderName?: string
  receiverName?: string
  note?: string
}

export interface PinResponse {
  ipfsUri: string
  fileUri: string
  fileHash: string
  metadata: {
    name: string
    description: string
    image: string
    properties: Record<string, any>
    attributes: Array<{ trait_type: string; value: string }>
  }
}

export async function pinToIPFS(data: PinRequest): Promise<PinResponse> {
  const formData = new FormData()
  
  // Required fields
  formData.append('file', data.file)
  formData.append('invoiceNumber', data.invoiceNumber)
  formData.append('dueDate', data.dueDate)
  formData.append('counterparty', data.counterparty)
  formData.append('amount', data.amount)
  formData.append('currency', data.currency.toUpperCase())
  formData.append('receiver', data.receiver)
  
  // Optional fields
  if (data.senderName) formData.append('senderName', data.senderName)
  if (data.receiverName) formData.append('receiverName', data.receiverName)
  if (data.note) formData.append('note', data.note)

  // Add timeout for large file uploads (60 seconds)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60_000)

  try {
    const res = await fetch(`${API_URL}/pin`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const err: ApiError = await res.json()
      throw new Error(err.message || 'Failed to pin to IPFS')
    }

    const json: ApiResponse<PinResponse> = await res.json()
    return json.data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Upload timeout - please try again')
    }
    throw err
  }
}

// ─── Get User Score ──────────────────────────────────────────────────

export interface ScoreResponse {
  address: string
  score: number
  tier: 1 | 2 | 3
  derivedTier: 1 | 2 | 3
  needsUpgrade: boolean
  maxLTV: number
  borrowRateBps: number
  apr: number
  nextTierAt: number | null
  repaymentsToNextTier: number | null
  collateral: string
  debt: string
  maxBorrow: string
  deposited: number
}

export async function getScore(address: string): Promise<ScoreResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(`${API_URL}/score/${address}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const err: ApiError = await res.json()
      throw new Error(err.message || 'Failed to fetch score')
    }

    const json: ApiResponse<ScoreResponse> = await res.json()
    return json.data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timeout - please try again')
    }
    throw err
  }
}

// ─── Health Check ────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5_000)

  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error('Backend not reachable')
    }

    const json: ApiResponse<{ status: string }> = await res.json()
    return json.data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Health check timeout')
    }
    throw err
  }
}
