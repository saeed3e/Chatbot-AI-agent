import React, { useState } from 'react';
import { Key, ChevronRight, HelpCircle } from 'lucide-react';

interface WelcomeModalProps {
  onComplete: (apiKey: string) => void;
  onSkip: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');

  const steps = [
    {
      title: "Welcome to AI Chatbot! 👋",
      content: "Let's get you set up in just a few steps. This will only take a minute.",
      action: () => setStep(2)
    },
    {
      title: "Get Your API Key",
      content: (
        <div className="space-y-4">
          <p>To use the chatbot, you'll need an OpenRouter API key:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Visit <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenRouter's API key page</a></li>
            <li>Sign in with GitHub or Google</li>
            <li>Your API key will be displayed on the dashboard</li>
            <li>Copy your API key</li>
          </ol>
          <p className="text-sm text-gray-600 mt-2">
            OpenRouter provides access to various AI models including GPT-4, Claude, and more!
          </p>
        </div>
      ),
      action: () => setStep(3)
    },
    {
      title: "Enter Your API Key",
      content: (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value.trim())}
              placeholder="sk-..."
              autoFocus
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <HelpCircle className="absolute right-2 top-2 text-gray-400 cursor-help" 
              title="Your API key starts with 'sk-' and is kept secure in your browser" />
          </div>
          <p className="text-sm text-gray-600">
            Your API key is stored securely in your browser and never sent to our servers.
          </p>
        </div>
      ),
      action: () => {
        if (apiKey && apiKey.startsWith('sk-')) {
          onComplete(apiKey);
        }
      }
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {step === 2 && <Key className="w-5 h-5" />}
          {currentStep.title}
        </h2>
        
        <div className="min-h-[100px]">
          {currentStep.content}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
          
          <button
            onClick={currentStep.action}
            disabled={step === 3 && (!apiKey || !apiKey.startsWith('sk-'))}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
          >
            {step === 3 ? "Start Chatting" : "Continue"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center gap-2 pt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                i + 1 === step ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
