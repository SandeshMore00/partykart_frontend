import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardImage {
  dashboard_image_id: number;
  dashboard_image_link: string;
  dashboard_image_order: number;
  created_at: string;
}

const DASHBOARD_IMAGE_API = 'http://localhost:9004/v1/products/dashboard-image/';
const CACHE_KEY = 'dashboard_images_cache';

const DashboardCarousel: React.FC = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();  
  // const { user, isAdmin } = useAuth();
  const [images, setImages] = useState<DashboardImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageOrder, setImageOrder] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preload image
  const preloadImage = (src: string) => {
    const img = new window.Image();
    img.src = src;
  };

  // Fetch and cache images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Try to load from cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setImages(parsed);
              setLoading(false);
              if (parsed.length > 0) preloadImage(parsed[0].dashboard_image_link);
            }
          } catch (e) {
            console.warn('Failed to parse cached images:', e);
          }
        }

        // Fetch fresh data from API
        const response = await fetch(DASHBOARD_IMAGE_API);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.status === 1 && Array.isArray(result.data)) {
          const sorted = result.data.sort((a, b) => a.dashboard_image_order - b.dashboard_image_order);
          setImages(sorted);
          localStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
          if (sorted.length > 0) preloadImage(sorted[0].dashboard_image_link);
        } else {
          console.warn('Invalid API response format:', result);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard images:', error);
        // If we have cached data, keep using it
        if (images.length === 0) {
          setImages([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
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

  // Upload dashboard image
  const handleUploadImage = async () => {
    if (!selectedFile || !user?.token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('dashboard_image_order', imageOrder.toString());
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:9004/v1/products/dashboard-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Refresh images after successful upload
        await fetchImages();
        setShowUploadModal(false);
        setSelectedFile(null);
        setImageOrder(1);
        // Clear cache to force refresh
        localStorage.removeItem(CACHE_KEY);
      } else {
        console.error('Failed to upload image:', response.statusText);
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Delete dashboard image
  const handleDeleteImage = async (imageId: number) => {
    if (!user?.token) return;

    if (!confirm('Are you sure you want to delete this dashboard image?')) return;

    try {
      const response = await fetch(`http://localhost:9004/v1/products/delete/dashboard-image/${imageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        // Refresh images after successful deletion
        await fetchImages();
        // Clear cache to force refresh
        localStorage.removeItem(CACHE_KEY);
        // Adjust current index if needed
        if (current >= images.length - 1) {
          setCurrent(Math.max(0, images.length - 2));
        }
      } else {
        console.error('Failed to delete image:', response.statusText);
        alert('Failed to delete image. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  // Refetch images function
  const fetchImages = async () => {
    try {
      const response = await fetch(DASHBOARD_IMAGE_API);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.status === 1 && Array.isArray(result.data)) {
        const sorted = result.data.sort((a, b) => a.dashboard_image_order - b.dashboard_image_order);
        setImages(sorted);
        localStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
        if (sorted.length > 0) preloadImage(sorted[0].dashboard_image_link);
      } else {
        console.warn('Invalid API response format:', result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard images:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-500">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="text-lg font-semibold mb-1">No Dashboard Images</div>
        <div className="text-sm">Images will appear here when they are added to the dashboard.</div>
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
      
      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Image
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteImage(images[current].dashboard_image_id)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
            Order: {images[current]?.dashboard_image_order || 1}
          </div>
        </div>
      )}
      
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Dashboard Image</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setImageOrder(1);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={imageOrder}
                  onChange={(e) => setImageOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleUploadImage}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setImageOrder(1);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCarousel;
