import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { Button } from '@/components/ui/button';

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

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  product_description?: string;
}

const BrowseCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(config.CATEGORY_SERVICE_URL + '/v1/category');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      setCategories([]);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const response = await fetch(config.CATEGORY_DETAILS(categoryId), { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setSubcategories(result.data);
        } else {
          setSubcategories([]);
        }
      }
    } catch (error) {
      setSubcategories([]);
    }
  };

  const fetchProducts = async (subCategoryId: number) => {
    try {
      const response = await fetch(config.PRODUCTS_BY_SUBCATEGORY(subCategoryId), { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setProducts(result.data);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      setProducts([]);
    }
  };

  const fetchProductsByCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`${config.PRODUCTS_SERVICE_URL}/v1/products/category/${categoryId}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setProducts(result.data);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      setProducts([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-8 text-center text-pink-700 drop-shadow">Browse Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
        {categories.map((category) => {
          const isHovered = hoveredCategory === category.category_id;
          return (
            <div
              key={category.category_id}
              className={`relative group bg-white rounded-xl shadow-lg transition-all border border-pink-100 p-6 flex flex-col items-center cursor-pointer duration-200 ${isHovered ? 'z-10 scale-105 shadow-2xl' : 'hover:-translate-y-1 hover:scale-105 hover:shadow-2xl'}`}
              onMouseEnter={() => {
                setHoveredCategory(category.category_id);
                fetchSubcategories(category.category_id);
              }}
              onMouseLeave={() => {
                setHoveredCategory(null);
                setSubcategories([]);
              }}
              onClick={() => {
                setSelectedCategory(category.category_id);
                setSelectedSubcategory(null);
                fetchProductsByCategory(category.category_id);
              }}
            >
              {category.category_image ? (
                <img src={category.category_image} alt={category.category_name} className="w-20 h-20 object-cover rounded-full mb-4 border-2 border-pink-200 shadow" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-4 text-3xl text-pink-400 font-bold shadow">
                  {category.category_name.charAt(0)}
                </div>
              )}
              <div className="text-lg font-semibold text-pink-700 text-center mb-2">{category.category_name}</div>
              {/* Subcategories shown inside expanded card on hover */}
              {isHovered && subcategories.length > 0 && (
                <div className="w-full mt-4 bg-pink-50 rounded-lg shadow-inner p-2 animate-fade-in">
                  <div className="text-xs font-semibold text-pink-600 mb-2">Subcategories</div>
                  <div className="flex flex-col gap-1">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.sub_category_id}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedSubcategory(subcategory.sub_category_id);
                          setSelectedCategory(null);
                          fetchProducts(subcategory.sub_category_id);
                        }}
                        className="text-left px-3 py-1 rounded hover:bg-pink-100 text-sm text-pink-700 transition-colors"
                      >
                        {subcategory.sub_category_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Products Grid */}
      {(selectedSubcategory || selectedCategory) && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No product listed</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseCategories;
