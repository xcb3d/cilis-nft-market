import { useState, useCallback } from 'react';

export const useFetchWithFallback = () => {
  const [error, setError] = useState(null);

  const fetchWithFallback = useCallback(async (url) => {
    setError(null);

    try {
      // If url is a string (not an array of fallbacks), just fetch it directly
      if (typeof url === 'string') {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      }
      
      // If we have an array of fallback URLs, try each one until one works
      if (Array.isArray(url)) {
        let lastError;
        
        for (const fallbackUrl of url) {
          try {
            const response = await fetch(fallbackUrl);
            if (response.ok) {
              console.log(`Successfully fetched from: ${fallbackUrl}`);
              return response;
            }
          } catch (err) {
            console.warn(`Failed to fetch from ${fallbackUrl}:`, err);
            lastError = err;
          }
        }
        
        // If all fallbacks failed, throw the last error
        throw lastError || new Error('All IPFS gateways failed');
      }
      
      throw new Error('Invalid URL format');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { fetchWithFallback, error };
};

export default useFetchWithFallback; 