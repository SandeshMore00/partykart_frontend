import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

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

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
      
      // const response = await fetch('http://localhost:9008/v1/category/', { headers });
      const response = await fetch(`${config./v1/category/', { headers });
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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(`http://localhost:9008/v1/category/sub-category/${categoryId}`, { headers });
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

  const handleCategoryHover = (categoryId: number) => {
    setHoveredCategory(categoryId);
    fetchSubcategories(categoryId);
  };

  const handleSubcategoryClick = (subCategoryId: number, subCategoryName: string) => {
    // Navigate to products page with subcategory
    navigate(`/products/subcategory/${subCategoryId}?name=${encodeURIComponent(subCategoryName)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <span className="ml-4 text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Browse Categories</h1>
            <p className="text-gray-600">{categories.length} categories available</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Display */}
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Grid className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories found</h3>
          <p className="text-gray-500">Categories will appear here once they are added.</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            : "space-y-4"
        }>
          {categories.map((category) => (
            viewMode === 'grid' ? (
              /* Grid View */
              <div
                key={category.category_id}
                className="relative"
                onMouseEnter={() => handleCategoryHover(category.category_id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {category.category_image ? (
                      <img
                        src={category.category_image}
                        alt={category.category_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🎉</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-center text-gray-800 text-sm">
                      {category.category_name}
                    </h3>
                  </div>
                </div>

                {/* Subcategories Dropdown */}
                {hoveredCategory === category.category_id && subcategories.length > 0 && (
                  <div className="absolute top-full left-0 z-50 bg-white shadow-xl rounded-lg border border-gray-200 mt-2 min-w-[220px] max-w-[280px] animate-in slide-in-from-top-2 duration-200">
                    <div className="py-3">
                      <div className="px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-100">
                        {category.category_name}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {subcategories.map((subcategory) => (
                          <button
                            key={subcategory.sub_category_id}
                            onClick={() => handleSubcategoryClick(subcategory.sub_category_id, subcategory.sub_category_name)}
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="flex items-center">
                              <span className="text-pink-400 mr-2">•</span>
                              {subcategory.sub_category_name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <div
                key={category.category_id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                onMouseEnter={() => handleCategoryHover(category.category_id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="flex items-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    {category.category_image ? (
                      <img
                        src={category.category_image}
                        alt={category.category_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🎉</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {category.category_name}
                    </h3>
                    <p className="text-gray-500 text-sm">Click to view subcategories</p>
                  </div>
                </div>

                {/* Subcategories Dropdown for List View */}
                {hoveredCategory === category.category_id && subcategories.length > 0 && (
                  <div className="absolute right-0 top-0 z-50 bg-white shadow-xl rounded-lg border border-gray-200 ml-4 min-w-[220px] max-w-[280px]">
                    <div className="py-3">
                      <div className="px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-100">
                        {category.category_name}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {subcategories.map((subcategory) => (
                          <button
                            key={subcategory.sub_category_id}
                            onClick={() => handleSubcategoryClick(subcategory.sub_category_id, subcategory.sub_category_name)}
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="flex items-center">
                              <span className="text-pink-400 mr-2">•</span>
                              {subcategory.sub_category_name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        
        .duration-200 {
          animation-duration: 200ms;
        }
      `}</style>
    </div>
  );
}
