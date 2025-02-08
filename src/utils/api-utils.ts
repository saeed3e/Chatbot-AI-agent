export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = { maxRetries: 3, baseDelay: 1000, maxDelay: 5000 }
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error instanceof ApiError && error.statusCode) {
        if ([401, 403, 422].includes(error.statusCode)) {
          throw error;
        }
      }

      if (attempt < config.maxRetries - 1) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
