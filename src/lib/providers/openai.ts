import { AIMessage, AIProvider } from '../../types/ai';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'deepseek/deepseek-r1-distill-llama-70b:free') {
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
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Chat Application'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('No response content received');
      }

      return data.choices[0].message.content;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw error;
      }
      console.error('Error calling OpenRouter API:', error);
      throw new Error('Failed to get response from AI model');
    }
  }
}