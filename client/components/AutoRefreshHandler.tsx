import { useEffect } from 'react';

/**
 * AutoRefreshHandler Component
 * Automatically refreshes the page if the tab has been inactive for 30 minutes
 */
export default function AutoRefreshHandler() {
  useEffect(() => {
    let hiddenTime: number | null = null;
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - record the timestamp
        hiddenTime = Date.now();
      } else {
        // Tab became visible - check if 30 minutes have passed
        if (hiddenTime) {
          const timeHidden = Date.now() - hiddenTime;
          
          if (timeHidden >= THIRTY_MINUTES) {
            console.log('Tab was inactive for 30+ minutes. Refreshing page...');
            window.location.reload();
          }
          
          // Reset the hidden time
          hiddenTime = null;
        }
      }
    };

    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

