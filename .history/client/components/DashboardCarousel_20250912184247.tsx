import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DashboardImage {
  dashboard_image_id: number;
  dashboard_image_link: string;
  dashboard_image_order: number;
  created_at: string;
}

const DASHBOARD_IMAGE_API = 'http://0.0.0.0:9004/v1/products/dashboard-image/';
const CACHE_KEY = 'dashboard_images_cache';

const DashboardCarousel: React.FC = () => {
  const [images, setImages] = useState<DashboardImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preload image
  const preloadImage = (src: string) => {
    const img = new window.Image();
    img.src = src;
  };

  // Fetch and cache images
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setImages(parsed);
          setLoading(false);
          if (parsed.length > 0) preloadImage(parsed[0].dashboard_image_link);
        }
      } catch {}
    }
    fetch(DASHBOARD_IMAGE_API)
      .then(res => res.json())
      .then(result => {
        if (result.status === 1 && Array.isArray(result.data)) {
          const sorted = result.data.sort((a, b) => a.dashboard_image_order - b.dashboard_image_order);
          setImages(sorted);
          localStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
          if (sorted.length > 0) preloadImage(sorted[0].dashboard_image_link);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-slide
  useEffect(() => {
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % images.length);
      }, 3500);
      return () => intervalRef.current && clearInterval(intervalRef.current);
    }
  }, [images]);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent(current === 0 ? images.length - 1 : current - 1);
  const next = () => setCurrent((current + 1) % images.length);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
        No dashboard images found.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/7] rounded-lg overflow-hidden shadow-lg">
      <img
        src={images[current].dashboard_image_link}
        alt={`Dashboard ${current + 1}`}
        className="w-full h-full object-cover transition-all duration-700"
        style={{ minHeight: '300px' }}
      />
      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
            onClick={prev}
            aria-label="Previous image"
          >
            <ArrowLeft className="w-6 h-6 text-pink-500" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
            onClick={next}
            aria-label="Next image"
          >
            <ArrowRight className="w-6 h-6 text-pink-500" />
          </button>
        </>
      )}
      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((img, idx) => (
          <button
            key={img.dashboard_image_id}
            className={`w-3 h-3 rounded-full border-2 ${current === idx ? 'border-pink-500 bg-pink-500' : 'border-gray-300 bg-gray-200'} focus:outline-none`}
            onClick={() => goTo(idx)}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardCarousel;
