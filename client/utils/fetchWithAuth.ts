// Custom fetch wrapper that handles token expiration automatically
// This should be used instead of regular fetch for authenticated requests

interface FetchWithAuthOptions extends RequestInit {
  onTokenExpired?: () => void;
}

/**
 * Custom fetch wrapper that automatically handles 401 (Unauthorized) responses
 * Triggers token expiration handler when token is invalid/expired
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { onTokenExpired, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);

    // Check if token expired (401 Unauthorized)
    if (response.status === 401) {
      // Call the token expiration handler if provided
      if (onTokenExpired) {
        onTokenExpired();
      }
    }

    return response;
  } catch (error) {
    // Network error or other fetch errors
    throw error;
  }
}

/**
 * Helper to create headers with Authorization token
 */
export function createAuthHeaders(token?: string, additionalHeaders: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

