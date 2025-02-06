import { AIMessage, AIProvider } from '../../types/ai';

export class OpenAIProvider implements AIProvider {
  name = 'OpenRouter';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'mistralai/mistral-7b-instruct:free') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async sendMessage(messages: AIMessage[], signal?: AbortSignal): Promise<string> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.href, // Using full URL as required by OpenRouter
          'X-Title': 'AI Chat Application'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message ||
          `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      
      // Add detailed logging for debugging
      console.log('OpenRouter API Response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response format from API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw error;
      }
      console.error('Error calling OpenRouter API:', error);
      throw error; // Throw the original error to preserve the error message
    }
  }
}