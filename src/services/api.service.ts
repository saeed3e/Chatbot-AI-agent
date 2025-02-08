import { API_ENDPOINTS } from '../config/constants';

export class ApiService {
  private static instance: ApiService;
  
  private constructor() {}
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT_COMPLETIONS, {
        method: 'POST',
        headers: this.getHeaders(apiKey),
        body: JSON.stringify(this.getValidationPayload())
      });

      const data = await response.json();
      return response.ok && Boolean(data.choices?.[0]?.message);
    } catch (error) {
      console.error('API validation error:', error);
      return false;
    }
  }

  private getHeaders(apiKey: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'AI Chatbot'
    };
  }

  private getValidationPayload(): Record<string, any> {
    return {
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 10,
      temperature: 0.7,
      stream: false
    };
  }
}
