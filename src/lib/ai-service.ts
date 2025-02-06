import { AIConfig, AIMessage, AIProvider } from '../types/ai';
import { OpenAIProvider } from './providers/openai';

export class AIService {
  private provider: AIProvider;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.provider = this.initializeProvider(config);
  }

  private initializeProvider(config: AIConfig): AIProvider {
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey) throw new Error('OpenAI API key is required');
        return new OpenAIProvider(config.apiKey, config.modelName);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  async sendMessage(messages: AIMessage[], signal?: AbortSignal): Promise<string> {
    return this.provider.sendMessage(messages, signal);
  }

  updateConfig(newConfig: AIConfig) {
    this.config = newConfig;
    this.provider = this.initializeProvider(newConfig);
  }
}