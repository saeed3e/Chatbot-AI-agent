import React, { memo, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useApiStatus, ApiStatus as StatusType } from '../hooks/useApiStatus';
import { STATUS_MESSAGES, STATUS_STYLES } from '../config/constants';

interface ApiStatusProps {
  apiKey: string;
  onInvalidKey?: () => void;
}

interface StatusIconProps {
  status: StatusType;
}

const StatusIcon = memo<StatusIconProps>(({ status }) => {
  switch (status) {
    case 'checking':
      return <AlertTriangle className="w-5 h-5" data-testid="AlertTriangle-icon" />;
    case 'valid':
      return <CheckCircle className="w-5 h-5" data-testid="CheckCircle-icon" />;
    case 'invalid':
      return <XCircle className="w-5 h-5" data-testid="XCircle-icon" />;
  }
});

StatusIcon.displayName = 'StatusIcon';

export const ApiStatus = memo<ApiStatusProps>(({ apiKey, onInvalidKey }) => {
  const handleInvalidKey = useCallback(() => {
    onInvalidKey?.();
  }, [onInvalidKey]);

  const { status, isVisible } = useApiStatus(apiKey, handleInvalidKey);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg flex items-center gap-2 ${STATUS_STYLES[status]}`}
      role="status"
      aria-live="polite"
    >
      <StatusIcon status={status} />
      <span>{STATUS_MESSAGES[status]}</span>
    </div>
  );
});

ApiStatus.displayName = 'ApiStatus';
