import { renderHook, act } from '@testing-library/react-hooks';
import { useApiStatus } from '../useApiStatus';
import { ApiService } from '../../services/api.service';

jest.mock('../../services/api.service');

describe('useApiStatus', () => {
  const mockApiKey = 'test-api-key';
  const mockOnInvalidKey = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    (ApiService.getInstance as jest.Mock).mockReturnValue({
      validateApiKey: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should initialize with checking status and visible', () => {
    const { result } = renderHook(() => useApiStatus(mockApiKey, mockOnInvalidKey));
    
    expect(result.current.status).toBe('checking');
    expect(result.current.isVisible).toBe(true);
  });

  it('should set invalid status when API key is empty', () => {
    const { result } = renderHook(() => useApiStatus('', mockOnInvalidKey));
    
    expect(result.current.status).toBe('invalid');
    expect(result.current.isVisible).toBe(true);
  });

  it('should set valid status and hide after timeout when API key is valid', async () => {
    const apiService = ApiService.getInstance();
    (apiService.validateApiKey as jest.Mock).mockResolvedValueOnce(true);

    const { result, waitForNextUpdate } = renderHook(() => 
      useApiStatus(mockApiKey, mockOnInvalidKey)
    );

    await waitForNextUpdate();

    expect(result.current.status).toBe('valid');
    expect(result.current.isVisible).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('should set invalid status and call onInvalidKey when API key is invalid', async () => {
    const apiService = ApiService.getInstance();
    (apiService.validateApiKey as jest.Mock).mockResolvedValueOnce(false);

    const { result, waitForNextUpdate } = renderHook(() => 
      useApiStatus(mockApiKey, mockOnInvalidKey)
    );

    await waitForNextUpdate();

    expect(result.current.status).toBe('invalid');
    expect(result.current.isVisible).toBe(true);
    expect(mockOnInvalidKey).toHaveBeenCalled();
  });
});
