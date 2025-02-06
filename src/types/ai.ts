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

export interface AIModelCategory {
  name: string;
  models: AIModel[];
}

export const AVAILABLE_MODELS: AIModelCategory[] = [
  {
    name: 'Large Models',
    models: [
      {
        id: 'meta-llama/llama-3.1-70b-instruct:free',
        name: 'Llama 3.1 70B',
        description: 'Powerful large language model with broad capabilities'
      },
      {
        id: 'qwen/qwen2.5-vl-72b-instruct:free',
        name: 'Qwen 2.5 72B',
        description: 'Advanced model with strong reasoning abilities'
      },
      {
        id: 'sophosympatheia/rogue-rose-103b-v0.2:free',
        name: 'Rogue Rose 103B',
        description: 'Largest free model with extensive knowledge'
      }
    ]
  },
  {
    name: 'Fast & Efficient',
    models: [
      {
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B',
        description: 'Fast and efficient for quick responses'
      },
      {
        id: 'google/gemini-2.0-flash-lite-preview-02-05:free',
        name: 'Gemini Flash Lite',
        description: 'Quick responses with good accuracy'
      },
      {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B',
        description: 'Balanced performance and reliability'
      },
      {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek R1',
        description: 'Efficient model for various tasks'
      },
      {
        id: 'qwen/qwen-vl-plus:free',
        name: 'Qwen VL Plus',
        description: 'Versatile model with visual capabilities'
      }
    ]
  }
];