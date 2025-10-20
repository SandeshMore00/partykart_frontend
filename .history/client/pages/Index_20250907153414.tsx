import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import config from '../config';

interface Category {
  category_id: number;
  category_name: string;
  category_image?: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  category_id: number;
}

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  product_description?: string;
}

interface ApiResponse {
  contact?: {
    information_description: {
      email?: string;
      'phone No.'?: number;
    };
  };
  visit_Our_Store?: {
    information_description: {
      Address?: string;
      'email id'?: string;
      'phone No'?: string;
    };
  };
  About_PartyKart?: {
    information_description: {
      data?: string;
    };
  };
  Policies?: {
    information_description: {
      data?: string;
    };
  };
}

export default function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<ApiResponse>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBrowseCategories, setShowBrowseCategories] = useState(false);
  const [browseSubcategories, setBrowseSubcategories] = useState<SubCategory[]>([]);
  const [browseHoveredCategory, setBrowseHoveredCategory] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample carousel images (would come from API in real implementation)
  const carouselImages = [
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=400&fit=crop'
  ];

  useEffect(() => {
    fetchCategories();
    fetchStoreInfo();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const fetchCategories = async () => {
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch('/api/categories', { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(`/api/categories/${categoryId}/subcategories`, { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          // Handle single subcategory or array of subcategories
          const subcategoriesData = Array.isArray(result.data) ? result.data : [result.data];
          setSubcategories(subcategoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchProducts = async (subCategoryId: number) => {
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(`/api/products/subcategory/${subCategoryId}`, { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setProducts(result.data);
          setSelectedSubcategory(subCategoryId);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch('/api/user/information');
      if (response.ok) {
        const data = await response.json();
        setStoreInfo(data);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  const fetchBrowseSubcategories = async (categoryId: number) => {
    try {
      const response = await fetch(config.CATEGORY_DETAILS(categoryId), { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setBrowseSubcategories(result.data);
        }
      }
    } catch (error) {
      setBrowseSubcategories([]);
    }
  };

  const handleCategoryHover = (categoryId: number) => {
    setHoveredCategory(categoryId);
    fetchSubcategories(categoryId);
  };

  const handleSubcategoryClick = (subCategoryId: number) => {
    fetchProducts(subCategoryId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.product_id,
      name: product.product_name,
      price: product.product_price,
      image: product.product_image,
      description: product.product_description
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="relative h-96 overflow-hidden rounded-lg mx-4 mb-8">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {carouselImages.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-4xl font-bold mb-4">Welcome to The PartyKart</h2>
                  <p className="text-xl">Your one-stop shop for all party supplies!</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Carousel Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Browse Categories Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full"
            onClick={() => navigate('/browse-categories')}
          >
            Browse Categories
          </Button>
        </div>
      </section>

      {/* Products Grid (when subcategory is selected) */}
      {selectedSubcategory && products.length > 0 && (
        <section className="container mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div onClick={() => navigate(`/product/${product.product_id}`)}>
                  <img
                    src={product.product_image}
                    alt={product.product_name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{product.product_name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.product_description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-pink-600">
                        ₹{product.product_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    size="sm"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Store Information Sections */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Visit Our Store */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-pink-500" />
                Visit Our Store
              </h2>
              <div className="space-y-2 text-gray-600">
                <p>{storeInfo.visit_Our_Store?.information_description.Address || '123 Baker Street\nSweet Valley Plaza\nNew York, NY 10001'}</p>

                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <a
                    href={`tel:${storeInfo.visit_Our_Store?.information_description['phone No'] || '(555) 123-CAKE'}`}
                    className="hover:text-pink-600"
                  >
                    {storeInfo.visit_Our_Store?.information_description['phone No'] || '(555) 123-CAKE'}
                  </a>
                </p>

                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <a
                    href={`mailto:${storeInfo.visit_Our_Store?.information_description['email id'] || 'hello@party-kart.com'}`}
                    className="hover:text-pink-600"
                  >
                    {storeInfo.visit_Our_Store?.information_description['email id'] || 'hello@party-kart.com'}
                  </a>
                </p>
              </div>
            </div>

            {/* About PartyKart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-pink-500" />
                About PartyKart
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {storeInfo.About_PartyKart?.information_description.data ||
                 'Your premier destination for professional cake making supplies. We provide high-quality ingredients, tools, and decorations to help you create unforgettable celebrations. From beginners to professional bakers, we have everything you need.'}
              </p>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Policies</h2>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-pink-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-pink-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-pink-600 transition-colors">Return & Exchange</a></li>
                <li><a href="#" className="hover:text-pink-600 transition-colors">Shipping Information</a></li>
                <li><a href="#" className="hover:text-pink-600 transition-colors">Bulk Order Discounts</a></li>
              </ul>
            </div>
          </div>

          {/* Google Maps placeholder */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Find Us</h2>
              <div className="w-full h-64 rounded-lg overflow-hidden shadow">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.690915397131!2d73.10673197390224!3d18.98925298219753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7e9f3d3acc655%3A0x5c1a172ba4771e04!2sBaking%20World!5e0!3m2!1sen!2sin!4v1757237930429!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Find Us on Google Maps"
                ></iframe>
                <div className="text-center mt-2">
                  <a
                    href="https://maps.app.goo.gl/o5rnE3qc2WhWEBSdA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 underline text-sm"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
