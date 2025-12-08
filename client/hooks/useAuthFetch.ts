import { useAuth } from '@/contexts/AuthContext';
import { fetchWithAuth, createAuthHeaders } from '@/utils/fetchWithAuth';

/**
 * Custom hook that provides a fetch function with automatic token expiration handling
 * Use this instead of regular fetch for authenticated API calls
 */
export function useAuthFetch() {
  const { user, handleTokenExpiration } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // Merge authorization header if user token exists
    const headers = createAuthHeaders(user?.token, options.headers as Record<string, string>);

    return fetchWithAuth(url, {
      ...options,
      headers,
      onTokenExpired: handleTokenExpiration,
    });
  };

  return authFetch;
}

