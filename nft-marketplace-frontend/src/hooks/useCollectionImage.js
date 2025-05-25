import { useState, useEffect } from 'react';
import { normalizeIPFSUrl, loadImageWithFallback } from '../services/ipfs';

export const useCollectionImage = (imageUrl, type = 'logo') => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl) {
        setImage(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Normalize URL
        const normalizedUrl = normalizeIPFSUrl(imageUrl);
        
        // Try loading with fallback
        const loadedUrl = await loadImageWithFallback(normalizedUrl);
        setImage(loadedUrl);
      } catch (err) {
        console.error(`Error loading ${type}:`, err);
        setError(err.message);
        // Set default placeholder image based on type
        setImage(type === 'logo' 
          ? '/images/default-logo.png'
          : '/images/default-banner.png'
        );
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imageUrl, type]);

  return { image, loading, error };
}; 