export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: any
  headers?: Record<string, string>
  token?: string
}

class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body, headers = {}, token } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new Error('Network error. Please check your connection.')
  }
}

// Specific API methods
export const fetchUsers = async (filters?: {
  role?: string
  status?: string
  search?: string
}) => {
  const params = new URLSearchParams()
  if (filters?.role) params.append('role', filters.role)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.search) params.append('search', filters.search)

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/users${query}`)
}

export const updateUserStatus = async (
  userId: string,
  status: string,
  token: string
) => {
  return apiRequest(`/users/${userId}`, {
    method: 'PATCH',
    body: { verification_status: status },
    token,
  })
}

export const fetchDonations = async (filters?: {
  status?: string
  startDate?: string
  endDate?: string
}) => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('start_date', filters.startDate)
  if (filters?.endDate) params.append('end_date', filters.endDate)

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/donations${query}`)
}

export const fetchVerificationRequests = async (status?: string) => {
  const query = status ? `?status=${status}` : ''
  return apiRequest(`/verifications${query}`)
}

export const reviewVerification = async (
  requestId: string,
  decision: 'approved' | 'rejected',
  reason?: string,
  token?: string
) => {
  return apiRequest(`/verifications/${requestId}`, {
    method: 'PATCH',
    body: { status: decision, rejection_reason: reason },
    token,
  })
}

export const fetchDashboardStats = async () => {
  return apiRequest('/dashboard/stats')
}

export { ApiError }
