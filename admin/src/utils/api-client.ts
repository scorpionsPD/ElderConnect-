/**
 * API Client for ElderConnect+ Backend
 * Handles all API calls to Supabase Edge Functions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:54321/functions/v1'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.loadToken()
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  /**
   * Set auth token
   */
  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  /**
   * Clear auth token
   */
  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  /**
   * Get auth headers
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Always include Authorization header (required by Supabase Edge Functions)
    if (anonKey) {
      if (this.token) {
        // Use user token if available
        headers['Authorization'] = `Bearer ${this.token}`
      } else {
        // Fallback to anon key
        headers['Authorization'] = `Bearer ${anonKey}`
      }
    }

    return headers
  }

  /**
   * Make API request (public for custom endpoints)
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const includeAuth = options.headers && 'Authorization' in options.headers
      ? false
      : !endpoint.includes('/auth/')

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...(options.headers || {})
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`
      }
    }

    return data
  }

  /**
   * Make API request (private for internal use)
   */
  private async privateRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request(endpoint, options)
  }

  // ============================================================================
  // AUTHENTICATION APIs
  // ============================================================================

  /**
   * Send OTP code to email or phone
   */
  async sendOTP(email?: string, phone_number?: string): Promise<ApiResponse> {
    return this.request('/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        email,
        phone_number
      })
    })
  }

  /**
   * Verify OTP code and get auth token
   */
  async verifyOTP(code: string, email?: string, phone_number?: string): Promise<ApiResponse> {
    return this.request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        code,
        email,
        phone_number
      })
    })
  }

  /**
   * Signup new user
   */
  async signup(
    email: string,
    role: string,
    first_name: string,
    phone_number?: string,
    date_of_birth?: string
  ): Promise<ApiResponse> {
    const signupPayload = {
      email,
      role,
      first_name,
      phone_number,
      date_of_birth
    }

    const response = await this.request('/signup', {
      method: 'POST',
      body: JSON.stringify(signupPayload)
    })

    // Backward compatibility for older deployed signup function versions
    // that still require a non-empty last_name field.
    if (response.success || !response.error?.toLowerCase().includes('last_name')) {
      return response
    }

    const inferredLastName = first_name.trim().includes(' ')
      ? first_name.trim().split(/\s+/).slice(1).join(' ')
      : first_name.trim()

    return this.request('/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...signupPayload,
        last_name: inferredLastName || first_name
      })
    })
  }

  // ============================================================================
  // USER PROFILE APIs
  // ============================================================================

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse> {
    return this.request('/get-profile', {
      method: 'GET'
    })
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Record<string, any>): Promise<ApiResponse> {
    return this.request('/get-profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  // ============================================================================
  // COMPANION REQUEST APIs
  // ============================================================================

  /**
   * List companion requests
   */
  async getCompanionRequests(): Promise<ApiResponse> {
    return this.request('/companion-requests', {
      method: 'GET'
    })
  }

  /**
   * Create new companion request (for elders)
   */
  async createCompanionRequest(
    activity_type: string,
    description?: string,
    preferred_time_start?: string,
    preferred_time_end?: string,
    location_latitude?: number,
    location_longitude?: number
  ): Promise<ApiResponse> {
    return this.request('/companion-requests', {
      method: 'POST',
      body: JSON.stringify({
        activity_type,
        description,
        preferred_time_start,
        preferred_time_end,
        location_latitude,
        location_longitude
      })
    })
  }

  /**
   * Accept companion request (for volunteers)
   */
  async acceptCompanionRequest(requestId: string): Promise<ApiResponse> {
    return this.request(`/companion-requests/${requestId}/accept`, {
      method: 'POST'
    })
  }

  // ============================================================================
  // HEALTH CHECKIN APIs
  // ============================================================================

  /**
   * Get health check-ins for user
   */
  async getHealthCheckins(limit: number = 30, offset: number = 0): Promise<ApiResponse> {
    return this.request(`/health-checkins?limit=${limit}&offset=${offset}`, {
      method: 'GET'
    })
  }

  /**
   * Submit health check-in
   */
  async submitHealthCheckin(
    mood: string,
    energy_level: number,
    sleep_hours: number,
    medications_taken: boolean,
    notes?: string
  ): Promise<ApiResponse> {
    return this.request('/health-checkins', {
      method: 'POST',
      body: JSON.stringify({
        mood,
        energy_level,
        sleep_hours,
        medications_taken,
        notes
      })
    })
  }
}

// Create and export singleton instance
const apiClient = new ApiClient()
export default apiClient
