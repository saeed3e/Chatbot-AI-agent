export const API_ENDPOINTS = {
  CHAT_COMPLETIONS: 'https://openrouter.ai/api/v1/chat/completions'
} as const;

export const STATUS_MESSAGES = {
  CHECKING: 'Checking API key...',
  VALID: 'API key verified',
  INVALID: 'Invalid API key'
} as const;

export const STATUS_STYLES = {
  checking: 'bg-yellow-50 text-yellow-700',
  valid: 'bg-green-50 text-green-700',
  invalid: 'bg-red-50 text-red-700'
} as const;
