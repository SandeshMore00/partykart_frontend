import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Global component that intercepts all fetch requests to handle token expiration
 * This component should be placed at the root level of the app
 */
export function TokenExpirationHandler() {
  const { handleTokenExpiration, user } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;

    // Override the global fetch function
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Check if the response is 401 Unauthorized (token expired)
        if (response.status === 401) {
          // Clone the response before consuming it
          const clonedResponse = response.clone();
          
          // Try to parse the error message
          try {
            const errorData = await clonedResponse.json();
            
            // Check for common token expiration messages
            const isTokenExpired = 
              errorData.detail?.toLowerCase().includes('token') ||
              errorData.detail?.toLowerCase().includes('expired') ||
              errorData.detail?.toLowerCase().includes('unauthorized') ||
              errorData.message?.toLowerCase().includes('token') ||
              errorData.message?.toLowerCase().includes('expired') ||
              errorData.message?.toLowerCase().includes('unauthorized');

            if (isTokenExpired || response.status === 401) {
              // Show a user-friendly message (only once)
              if (!hasShownToast.current && user) {
                hasShownToast.current = true;
                toast.error('Session expired', {
                  description: 'Your session has expired. Please login again.',
                  duration: 3000,
                });
              }
              console.warn('Session expired. Logging out...');
              
              // Delay slightly to allow toast to show and any pending operations to complete
              setTimeout(() => {
                handleTokenExpiration();
              }, 500);
            }
          } catch (parseError) {
            // If we can't parse the response, still handle 401 as token expiration
            if (!hasShownToast.current && user) {
              hasShownToast.current = true;
              toast.error('Session expired', {
                description: 'Your session has expired. Please login again.',
                duration: 3000,
              });
            }
            console.warn('Session expired (401). Logging out...');
            setTimeout(() => {
              handleTokenExpiration();
            }, 500);
          }
        }

        return response;
      } catch (error) {
        // Network error or other fetch errors
        throw error;
      }
    };

    // Cleanup: restore the original fetch when component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, [handleTokenExpiration, user]);

  // Reset toast flag when user changes (new login)
  useEffect(() => {
    if (user) {
      hasShownToast.current = false;
    }
  }, [user]);

  // This component doesn't render anything
  return null;
}

