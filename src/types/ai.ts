export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  name: string;
  sendMessage: (messages: AIMessage[], signal?: AbortSignal) => Promise<string>;
}

export interface AIConfig {
  provider: string;
  apiKey?: string;
  modelName?: string;
  temperature?: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'deepseek/deepseek-r1-distill-llama-70b:free',
    name: 'DeepSeek R1 70B',
    description: 'Powerful open-source language model'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
    description: 'Efficient and accurate instruction-following model'
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'OpenChat 7B',
    description: 'Open-source conversational AI'
  },
  {
    id: 'gryphe/mythomist-7b:free',
    name: 'MythoMist 7B',
    description: 'Creative and engaging conversational model'
  }
];