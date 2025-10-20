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
  // Remove all inline expansion state
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

  // Remove all fetchSubcategories and fetchProducts logic

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-8 text-center text-pink-700 drop-shadow">Browse Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
        {categories.map((category) => (
          <div
            key={category.category_id}
            className="relative group bg-white rounded-xl shadow-lg transition-all border border-pink-100 p-6 flex flex-col items-center cursor-pointer duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
            onClick={() => navigate(`/categories/${category.category_id}`)}
          >
            {category.category_image ? (
              <img src={category.category_image} alt={category.category_name} className="w-20 h-20 object-cover rounded-full mb-4 border-2 border-pink-200 shadow" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-4 text-3xl text-pink-400 font-bold shadow">
                {category.category_name.charAt(0)}
              </div>
            )}
            <div className="text-lg font-semibold text-pink-700 text-center mb-2">{category.category_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseCategories;
