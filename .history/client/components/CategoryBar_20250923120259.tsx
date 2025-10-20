import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import config from '../config';

interface Category {
  category_id: number;
  category_name: string;
  category_image?: string;
}

interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  category_id: number;
}

export default function CategoryBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null); // for click
  const [loading, setLoading] = useState(true);
  // Track if mouse is over dropdown or category
  const [dropdownHovered, setDropdownHovered] = useState(false);
  const [categoryHovered, setCategoryHovered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch('http://localhost:9008/v1/category/', { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      setSubcategories([]); // Clear previous
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      const response = await fetch(config.CATEGORY_DETAILS(categoryId), {
        method: 'GET',
        headers
      });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data && Array.isArray(result.data)) {
          setSubcategories(result.data);
        } else {
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      setSubcategories([]);
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleCategoryHover = (categoryId: number) => {
    setHoveredCategory(categoryId);
    fetchSubcategories(categoryId);
  };

  const handleCategoryClick = (categoryId: number) => {
    setActiveCategory(categoryId);
    fetchSubcategories(categoryId);
  };

  // Click-away handler
  useEffect(() => {
    if (!activeCategory) return;
    const handleClickAway = (e: MouseEvent) => {
      const dropdown = document.getElementById('category-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setActiveCategory(null);
        setSubcategories([]);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [activeCategory]);

  const handleSubcategoryClick = (subCategoryId: number, subCategoryName: string) => {
    // Navigate to products page with subcategory
    navigate(`/products/subcategory/${subCategoryId}?name=${encodeURIComponent(subCategoryName)}`);
  };

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-100 w-full z-30" style={{ position: 'relative', top: 0 }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm w-full z-30" style={{ position: 'relative', top: 0, marginTop: '128px' }}>
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-wrap items-center py-2 sm:py-3 gap-1 sm:gap-2 md:gap-4 lg:gap-6">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="relative flex-shrink-0"
              onMouseEnter={() => { handleCategoryHover(category.category_id); setCategoryHovered(true); }}
              onMouseLeave={() => setCategoryHovered(false)}
            >
              {/* Category Button */}
              <button
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200 whitespace-nowrap group ${activeCategory === category.category_id ? 'bg-pink-100 text-pink-600' : ''}`}
                onClick={() => handleCategoryClick(category.category_id)}
              >
                <span className="font-medium">{category.category_name}</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:rotate-180 transition-transform duration-200" />
              </button>
            </div>
          ))}
        </div>
        {/* Subcategories Dropdown (block, pushes content down) */}
        {(hoveredCategory && (categoryHovered || dropdownHovered) || activeCategory) && (
          <div
            id="category-dropdown"
            className="w-full bg-white shadow-xl rounded-lg border border-gray-200 mt-2 animate-in slide-in-from-top duration-200"
            onMouseEnter={() => setDropdownHovered(true)}
            onMouseLeave={() => { setDropdownHovered(false); setCategoryHovered(false); setHoveredCategory(null); }}
          >
            <div className="py-2">
              <div className="px-3 py-2 text-sm font-semibold text-gray-500 border-b border-gray-100 flex items-center justify-between">
                {categories.find(c => c.category_id === (activeCategory || hoveredCategory))?.category_name}
                {activeCategory && (
                  <button
                    className="text-xs text-pink-600 hover:underline ml-2"
                    onClick={() => { setActiveCategory(null); setSubcategories([]); }}
                  >Back</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {subcategories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">No subcategories</div>
                ) : (
                  subcategories.map((subcategory) => (
                    <button
                      key={subcategory.sub_category_id}
                      onClick={() => handleSubcategoryClick(subcategory.sub_category_id, subcategory.sub_category_name)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    >
                      {subcategory.sub_category_name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
