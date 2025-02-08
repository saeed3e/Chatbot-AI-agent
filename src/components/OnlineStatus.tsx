import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OnlineStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`fixed top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full ${
      isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span className="text-sm">Online</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span className="text-sm">Offline</span>
        </>
      )}
    </div>
  );
};
