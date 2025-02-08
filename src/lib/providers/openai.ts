import { AIMessage, AIProvider } from '../../types/ai';
import { withRetry, ApiError } from '../../utils/api-utils';

interface OpenAIConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export class OpenAIProvider implements AIProvider {
  name = 'OpenRouter';
  private apiKey: string;
  private model: string;
  private config: OpenAIConfig;

  constructor(
    apiKey: string,
    model = 'mistralai/mistral-7b-instruct:free',
    config: OpenAIConfig = {}
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.config = {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      ...config
    };
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'AI Chat Application'
    };
  }

  private getRequestBody(messages: AIMessage[], stream = true): string {
    return JSON.stringify({
      model: this.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      stream,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP,
      frequency_penalty: this.config.frequencyPenalty,
      presence_penalty: this.config.presencePenalty,
    });
  }

  async sendMessage(
    messages: AIMessage[],
    signal?: AbortSignal,
    onStream?: (chunk: string) => void
  ): Promise<string> {
    return withRetry(async () => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: this.getHeaders(),
          body: this.getRequestBody(messages, !!onStream),
          signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new ApiError(
            errorData?.error?.message || `API request failed with status ${response.status}`,
            response.status,
            errorData
          );
        }

        if (onStream && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullResponse = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() !== '');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content) {
                      fullResponse += content;
                      onStream(content);
                    }
                  } catch (e) {
                    console.error('Error parsing streaming response:', e);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
          return fullResponse;
        }

        const data = await response.json();

        // Handle both streaming and non-streaming response formats
        const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.delta?.content;
        if (!content) {
          console.error('Invalid API response:', data);
          throw new ApiError(
            'Invalid response format from API',
            undefined,
            data
          );
        }

        return content;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(
          'Failed to send message',
          undefined,
          error
        );
      }
    });
  }
}