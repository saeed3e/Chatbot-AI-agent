import { ApiService } from '../api.service';
import { API_ENDPOINTS } from '../../config/constants';

describe('ApiService', () => {
  let apiService: ApiService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    apiService = ApiService.getInstance();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = ApiService.getInstance();
    const instance2 = ApiService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: 'Hello' }] })
      });

      const result = await apiService.validateApiKey(mockApiKey);
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        API_ENDPOINTS.CHAT_COMPLETIONS,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );
    });

    it('should return false for invalid API key', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid API key' })
      });

      const result = await apiService.validateApiKey(mockApiKey);
      expect(result).toBe(false);
    });

    it('should return false when API call throws error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.validateApiKey(mockApiKey);
      expect(result).toBe(false);
    });
  });
});
