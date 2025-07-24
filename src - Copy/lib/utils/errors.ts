// src/lib/utils/errors.ts

export interface ApiError {
    message: string
    code?: string
    status?: number
    details?: any
  }
  
  export class AuthError extends Error {
    code: string
    status: number
  
    constructor(message: string, code: string = 'AUTH_ERROR', status: number = 401) {
      super(message)
      this.name = 'AuthError'
      this.code = code
      this.status = status
    }
  }
  
  export class ValidationError extends Error {
    code: string
    status: number
    field?: string
  
    constructor(message: string, field?: string, code: string = 'VALIDATION_ERROR') {
      super(message)
      this.name = 'ValidationError'
      this.code = code
      this.status = 400
      this.field = field
    }
  }
  
  export class NetworkError extends Error {
    code: string
    status: number
  
    constructor(message: string, status: number = 500, code: string = 'NETWORK_ERROR') {
      super(message)
      this.name = 'NetworkError'
      this.code = code
      this.status = status
    }
  }
  
  /**
   * Normalize different types of errors into a consistent format
   */
  export function normalizeError(error: unknown): ApiError {
    if (error instanceof AuthError || error instanceof ValidationError || error instanceof NetworkError) {
      return {
        message: error.message,
        code: error.code,
        status: error.status,
      }
    }
  
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        status: 500,
      }
    }
  
    if (typeof error === 'string') {
      return {
        message: error,
        code: 'UNKNOWN_ERROR',
        status: 500,
      }
    }
  
    if (typeof error === 'object' && error !== null) {
      const err = error as any
      return {
        message: err.message || err.error || 'Unknown error occurred',
        code: err.code || 'UNKNOWN_ERROR',
        status: err.status || 500,
        details: err,
      }
    }
  
    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500,
    }
  }
  
  /**
   * Get user-friendly error messages
   */
  export function getUserFriendlyErrorMessage(error: ApiError): string {
    const { code, message } = error
  
    switch (code) {
      case 'INVALID_CREDENTIALS':
      case 'SIGNIN_FAILED':
        return 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
      
      case 'USER_NOT_FOUND':
        return 'Không tìm thấy tài khoản với email này.'
      
      case 'EMAIL_ALREADY_EXISTS':
        return 'Email này đã được sử dụng. Vui lòng sử dụng email khác.'
      
      case 'USERNAME_TAKEN':
        return 'Tên người dùng đã được sử dụng. Vui lòng chọn tên khác.'
      
      case 'WEAK_PASSWORD':
        return 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.'
      
      case 'INVALID_EMAIL':
        return 'Email không hợp lệ. Vui lòng kiểm tra lại.'
      
      case 'TIKTOK_USERNAME_TAKEN':
        return 'TikTok username này đã được kết nối với tài khoản khác.'
      
      case 'TIKTOK_INVALID':
        return 'TikTok username không hợp lệ hoặc không tồn tại.'
      
      case 'INSUFFICIENT_CREDITS':
        return 'Không đủ credits để thực hiện hành động này.'
      
      case 'NETWORK_ERROR':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.'
      
      case 'SERVER_ERROR':
        return 'Lỗi máy chủ. Vui lòng thử lại sau.'
      
      case 'UNAUTHORIZED':
        return 'Bạn không có quyền truy cập. Vui lòng đăng nhập lại.'
      
      case 'FORBIDDEN':
        return 'Bạn không có quyền thực hiện hành động này.'
      
      case 'NOT_FOUND':
        return 'Không tìm thấy tài nguyên yêu cầu.'
      
      case 'RATE_LIMITED':
        return 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.'
      
      default:
        // Fallback to original message if it's user-friendly, otherwise use generic message
        if (message && message.length < 100 && !message.includes('Error:')) {
          return message
        }
        return 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    }
  }
  
  /**
   * Log errors for debugging while keeping user-friendly messages
   */
  export function logError(error: unknown, context?: string) {
    const normalizedError = normalizeError(error)
    
    console.error('Error occurred:', {
      context,
      message: normalizedError.message,
      code: normalizedError.code,
      status: normalizedError.status,
      details: normalizedError.details,
      timestamp: new Date().toISOString(),
    })
  
    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // captureException(error, { context, ...normalizedError })
    }
  }
  
  /**
   * Retry mechanism for failed requests
   */
  export async function retryAsync<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown
  
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          break
        }
  
        // Don't retry on certain errors
        const normalizedError = normalizeError(error)
        if (normalizedError.status && normalizedError.status < 500) {
          break
        }
  
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  
    throw lastError
  }
  
  /**
   * Check if error is retryable
   */
  export function isRetryableError(error: unknown): boolean {
    const normalizedError = normalizeError(error)
    
    // Retry on server errors (5xx) and network errors
    return (
    //   normalizedError.status >= 500 ||
      normalizedError.code === 'NETWORK_ERROR' ||
      normalizedError.code === 'TIMEOUT'
    )
  }