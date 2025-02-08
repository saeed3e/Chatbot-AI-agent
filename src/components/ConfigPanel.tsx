import React from 'react';
import { AlertCircle, Save, X } from 'lucide-react';
import { AVAILABLE_MODELS } from '../types/ai';

interface ConfigPanelProps {
  apiKey: string;
  selectedModel: string;
  configError: string;
  onApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApiKeyKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onModelSelect: (modelId: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  apiKey,
  selectedModel,
  configError,
  onApiKeyChange,
  onApiKeyKeyPress,
  onModelSelect,
  onSave,
  onClose,
}) => {
  return (
    <div className="p-4 bg-gray-50 border-b space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={onApiKeyChange}
          onKeyPress={onApiKeyKeyPress}
          placeholder="Enter your OpenRouter API key"
          className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            configError ? 'border-red-500' : ''
          }`}
        />
        {configError && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle size={16} />
            {configError}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          AI Model
        </label>
        {AVAILABLE_MODELS.map((category) => (
          <div key={category.name} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 bg-gray-100 p-2 rounded">
              {category.name}
            </h3>
            <div className="space-y-2">
              {category.models.map((model) => (
                <div
                  key={model.id}
                  className={`relative flex items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedModel === model.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                  onClick={() => onModelSelect(model.id)}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="model"
                      checked={selectedModel === model.id}
                      onChange={() => {}}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <label className="font-medium text-gray-900">
                      {model.name}
                    </label>
                    <p className="text-gray-500 text-sm mt-1">{model.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          <X size={20} className="inline-block mr-1" />
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          <Save size={20} className="inline-block mr-1" />
          Save
        </button>
      </div>
    </div>
  );
};
