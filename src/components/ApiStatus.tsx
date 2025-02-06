import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ApiStatusProps {
  apiKey: string;
  onInvalidKey?: () => void;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({ apiKey, onInvalidKey }) => {
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!apiKey) {
      setStatus('invalid');
      return;
    }

    const checkApiKey = async () => {
      try {
        // Use a simple chat completion request to validate the API key
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'AI Chatbot'
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 10,
            temperature: 0.7,
            stream: false
          })
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message) {
          setStatus('valid');
          // Hide the status after 5 seconds if valid
          setTimeout(() => setIsVisible(false), 5000);
        } else {
          console.error('API Key validation failed:', data);
          setStatus('invalid');
          onInvalidKey?.();
        }
      } catch (error) {
        console.error('API Key validation error:', error);
        setStatus('invalid');
        onInvalidKey?.();
      }
    };

    checkApiKey();
  }, [apiKey]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg flex items-center gap-2 ${
      status === 'valid' ? 'bg-green-50 text-green-700' :
      status === 'invalid' ? 'bg-red-50 text-red-700' :
      'bg-yellow-50 text-yellow-700'
    }`}>
      {status === 'checking' && (
        <>
          <AlertTriangle className="w-5 h-5" />
          <span>Checking API key...</span>
        </>
      )}
      {status === 'valid' && (
        <>
          <CheckCircle className="w-5 h-5" />
          <span>API key verified</span>
        </>
      )}
      {status === 'invalid' && (
        <>
          <XCircle className="w-5 h-5" />
          <span>Invalid API key</span>
        </>
      )}
    </div>
  );
};
