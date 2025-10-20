import { ShieldCheck } from "lucide-react";
import DashboardCarousel from "@/components/DashboardCarousel";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail } from 'lucide-react';
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
  const [showBrowseCategories, setShowBrowseCategories] = useState(false);
  const [browseSubcategories, setBrowseSubcategories] = useState<SubCategory[]>([]);
  const [browseHoveredCategory, setBrowseHoveredCategory] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    fetchCategories();
    fetchStoreInfo();
  }, []);


  const fetchCategories = async () => {
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      // const response = await fetch('http://localhost:9008/v1/category/', { headers });
      const response = await fetch(`${config.CATEGORY_SERVICE_URL}/v1/category/`, { headers });
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

      // const response = await fetch(`http://localhost:9008/v1/category/sub-category/${categoryId}`, { headers });
      const response = await fetch(`${config.CATEGORY_SERVICE_URL}/v1/category/sub-category/${categoryId}`, { headers });
      if (response.ok) {
        const result = await response.json();
        {/* Dashboard Image Carousel */}
        <div className="mb-10">
          <DashboardCarousel />
        </div>
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

      // const response = await fetch(`http://localhost:9004/v1/products/sub_category/${subCategoryId}`, { headers });
      const response = await fetch(`${config.CATEGORY_SERVICE_URL}/v1/products/sub_category/${subCategoryId}`, { headers });
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
      const response = await fetch(`${config.}/v1/user/information/`);
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


  return (
    <div className="min-h-screen">
      {/* Dashboard Image Carousel */}
      <div className="mb-10">
        <DashboardCarousel />
      </div>

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
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                <MapPin className="w-5 h-5 mr-2 text-pink-500" />
                Visit Our Store
              </h2>
              <div className="space-y-2 text-gray-700" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontWeight: 500 }}>
                <p className="text-lg font-semibold">SHREE GANESHA ENTERPRISES</p>
                <p>Shop no 01, Tilak road, kashyap hall, Opp. ramdas maruti mandir, near Annapurna, Old panvel, district-raigad, pin-410206, maharashtra, INDIA.</p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-pink-500" />
                  <a href="tel:+918779319669" className="hover:text-pink-600" style={{ wordBreak: 'break-all' }}>
                    +91 8779319669
                  </a>
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-pink-500" />
                  <a href="mailto:thepartykartservice@gmail.com" className="hover:text-pink-600" style={{ wordBreak: 'break-all' }}>
                    thepartykartservice@gmail.com
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
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p className="font-semibold">Order Easily!</p>
                <p>Instant Checkout with our full fledge ecommerce checkout.</p>
                <p className="font-semibold">Online 24x7 Avail!</p>
                <p>Whatever your order, our CS (Customer Service) will be happy to serve.</p>
                <p className="font-semibold">Top Notch Quality</p>
                <p>We ensure that the products we send meet the buyer's expectations.</p>
              </div>
            </div>

            {/* Policy Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                <ShieldCheck className="w-5 h-5 mr-2 text-pink-500" />
                Policy
              </h2>
              <div className="space-y-2 text-gray-700" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontWeight: 500 }}>
                <p className="text-lg font-semibold">Our Policies</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><a href="/policy/privacy" className="text-blue-700 hover:underline">Privacy Policy</a></li>
                  <li><a href="/policy/terms" className="text-blue-700 hover:underline">Terms of Service</a></li>
                  <li><a href="/policy/refund" className="text-blue-700 hover:underline">Return & Exchange</a></li>
                  <li><a href="/policy/shipping" className="text-blue-700 hover:underline">Shipping Information</a></li>
                  <li><a href="/policy/bulk" className="text-blue-700 hover:underline">Bulk Order Discounts</a></li>
                </ul>
              </div>
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
