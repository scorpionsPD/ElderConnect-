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
  private userId: string | null = null

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
      this.userId = localStorage.getItem('user_id')
    }
  }

  /**
   * Set auth token
   */
  setToken(token: string): void {
    this.token = token
    // Extract user_id from token payload
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(this.decodeBase64Url(parts[1]))
        this.userId = payload.user_id || payload.sub || null
      }
    } catch (e) {
      console.warn('Failed to extract user_id from token')
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      if (this.userId) {
        localStorage.setItem('user_id', this.userId)
      }
    }
  }

  setUserId(userId: string | null): void {
    this.userId = userId
    if (typeof window !== 'undefined') {
      if (userId) {
        localStorage.setItem('user_id', userId)
      } else {
        localStorage.removeItem('user_id')
      }
    }
  }

  private decodeBase64Url(value: string): string {
    // JWT segments are base64url; normalize for atob.
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
    return atob(`${normalized}${padding}`)
  }

  private getEffectiveUserId(): string | null {
    if (this.userId) return this.userId
    if (typeof window === 'undefined') return null

    const storedUserId = localStorage.getItem('user_id')
    if (storedUserId) {
      this.userId = storedUserId
      return storedUserId
    }

    const savedUserData = localStorage.getItem('user_data')
    if (!savedUserData) return null

    try {
      const parsed = JSON.parse(savedUserData)
      const id = typeof parsed?.id === 'string' ? parsed.id : null
      if (id) {
        this.userId = id
        localStorage.setItem('user_id', id)
      }
      return id
    } catch {
      return null
    }
  }

  private attachUserIdentityHeaders(headers: HeadersInit): HeadersInit {
    const effectiveUserId = this.getEffectiveUserId()
    if (!effectiveUserId) return headers
    const mutableHeaders: Record<string, string> =
      headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : Array.isArray(headers)
          ? Object.fromEntries(headers)
          : { ...(headers as Record<string, string>) }
    mutableHeaders['X-User-Token'] = effectiveUserId
    mutableHeaders['X-User-Id'] = effectiveUserId
    return mutableHeaders
  }

  /**
   * Clear auth token
   */
  clearToken(): void {
    this.token = null
    this.userId = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_id')
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

    // Edge Functions are protected by Supabase JWT verification.
    // Use anon key for Authorization; app-specific identity is sent via X-User-Token.
    if (includeAuth && anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`
      headers['apikey'] = anonKey
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
    const includeAuth = !(options.headers && 'Authorization' in options.headers)

    const requestInit: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...(options.headers || {})
      }
    }

    try {
      let response = await fetch(url, requestInit)
      let payload = await this.parseResponsePayload(response)

      // Retry once for transient upstream failures from edge/gateway.
      if (this.shouldRetry(response.status, payload)) {
        response = await fetch(url, requestInit)
        payload = await this.parseResponsePayload(response)
      }

      if (!response.ok) {
        return {
          success: false,
          error: this.extractErrorMessage(response.status, payload)
        }
      }

      const normalizedData =
        payload && typeof payload === 'object' && 'data' in payload
          ? payload.data
          : payload

      return {
        ...(payload && typeof payload === 'object' ? payload : {}),
        success: payload?.success ?? true,
        data: normalizedData,
        message: payload?.message,
        error: payload?.error
      } as ApiResponse<T>
    } catch (error) {
      return {
        success: false,
        error: this.extractNetworkError(error)
      }
    }
  }

  private async parseResponsePayload(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      return response.json()
    }

    const text = await response.text()
    return { error: text || `Request failed with status ${response.status}` }
  }

  private shouldRetry(status: number, payload: any): boolean {
    const text = String(payload?.error || payload?.message || '').toLowerCase()
    const transientStatus = status === 502 || status === 503 || status === 504
    const upstreamFailure =
      text.includes('upstream connect error') ||
      text.includes('local connection failure') ||
      text.includes('socket creation failure')

    return transientStatus || upstreamFailure
  }

  private extractErrorMessage(status: number, payload: any): string {
    const rawMessage = String(payload?.error || payload?.message || '').trim()
    const normalized = rawMessage.toLowerCase()

    if (
      normalized.includes('upstream connect error') ||
      normalized.includes('local connection failure') ||
      normalized.includes('socket creation failure')
    ) {
      return 'Verification service is temporarily unavailable. Please try again in a few seconds.'
    }

    if (rawMessage) {
      return rawMessage
    }

    return `Request failed with status ${status}`
  }

  private extractNetworkError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error)
    if (
      message.toLowerCase().includes('failed to fetch') ||
      message.toLowerCase().includes('networkerror')
    ) {
      return 'Network error. Please check your internet connection and try again.'
    }

    return message || 'Network request failed'
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
      headers: this.getServiceHeaders(),
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
      headers: this.getServiceHeaders(),
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
      headers: this.getServiceHeaders(),
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
      headers: this.getServiceHeaders(),
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
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/get-profile', {
      method: 'GET',
      headers
    })
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Record<string, any>): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/get-profile', {
      method: 'PUT',
      headers,
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
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/companion-requests', {
      method: 'GET',
      headers
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
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/companion-requests', {
      method: 'POST',
      headers,
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

  // ============================================================================
  // FAMILY CONNECTION APIs
  // ============================================================================

  async getFamilyElders(): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/family-elders', {
      method: 'GET',
      headers
    })
  }

  async addFamilyElder(elderEmail: string, relationship: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/family-elders', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        elder_email: elderEmail,
        relationship
      })
    })
  }

  async updateFamilyElder(connectionId: string, relationship: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/family-elders/${connectionId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ relationship })
    })
  }

  async removeFamilyElder(connectionId: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/family-elders/${connectionId}`, {
      method: 'DELETE',
      headers
    })
  }

  async getElderFamilyMembers(): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/elder-family-members', {
      method: 'GET',
      headers
    })
  }

  async addElderFamilyMember(
    familyEmail: string,
    relationship: string,
    accessLevel: string = 'VIEW_ALL'
  ): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/elder-family-members', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        family_email: familyEmail,
        relationship,
        access_level: accessLevel
      })
    })
  }

  async updateElderFamilyMember(
    connectionId: string,
    updates: { relationship?: string; access_level?: string }
  ): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/elder-family-members/${connectionId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    })
  }

  async removeElderFamilyMember(connectionId: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/elder-family-members/${connectionId}`, {
      method: 'DELETE',
      headers
    })
  }

  async resendElderFamilyInvitation(invitationId: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/elder-family-members', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resend_invitation_id: invitationId
      })
    })
  }

  async getCompanionMessages(requestId: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/companion-messages?request_id=${encodeURIComponent(requestId)}`, {
      method: 'GET',
      headers
    })
  }

  async sendCompanionMessage(requestId: string, messageText: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/companion-messages?request_id=${encodeURIComponent(requestId)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message_text: messageText
      })
    })
  }

  private getServiceHeaders(): HeadersInit {
    const headers: HeadersInit = {}
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`
      headers['apikey'] = anonKey
    }
    return headers
  }

  /**
   * Accept companion request (for volunteers)
   */
  async acceptCompanionRequest(requestId: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/companion-requests/${requestId}/accept`, {
      method: 'POST',
      headers
    })
  }

  async completeCompanionRequest(requestId: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/companion-requests/${requestId}/complete`, {
      method: 'POST',
      headers
    })
  }

  // ============================================================================
  // HEALTH CHECKIN APIs
  // ============================================================================

  /**
   * Get health check-ins for user
   */
  async getHealthCheckins(limit: number = 30, offset: number = 0): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/health-checkins?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers
    })
  }

  async getHealthCheckinsForElder(
    elderUserId: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(
      `/health-checkins?limit=${limit}&offset=${offset}&elder_user_id=${encodeURIComponent(elderUserId)}`,
      {
        method: 'GET',
        headers
      }
    )
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
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/health-checkins', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mood,
        energy_level,
        sleep_hours,
        medications_taken,
        notes
      })
    })
  }

  /**
   * Get current user's preferences
   */
  async getUserPreferences(): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/user-preferences', {
      method: 'GET',
      headers
    })
  }

  /**
   * Update current user's preferences
   */
  async updateUserPreferences(updates: Record<string, any>): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/user-preferences', {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    })
  }

  async getFamilyMessages(elderUserId: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/family-messages?elder_user_id=${encodeURIComponent(elderUserId)}`, {
      method: 'GET',
      headers
    })
  }

  async sendFamilyMessage(elderUserId: string, messageText: string): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request(`/family-messages?elder_user_id=${encodeURIComponent(elderUserId)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message_text: messageText
      })
    })
  }

  async triggerEmergencyAlert(
    alertType: 'HEALTH_EMERGENCY' | 'SECURITY_THREAT' | 'ACCIDENT' | 'OTHER',
    description?: string,
    latitude?: number,
    longitude?: number
  ): Promise<ApiResponse> {
    const headers: HeadersInit = this.attachUserIdentityHeaders(this.getServiceHeaders())
    return this.request('/emergency-handler', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: this.getEffectiveUserId(),
        alertType,
        description,
        latitude,
        longitude
      })
    })
  }
}

// Create and export singleton instance
const apiClient = new ApiClient()
export default apiClient
