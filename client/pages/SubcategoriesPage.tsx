import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import config from '../config';

interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  sub_category_image?: string | null;
  category_id: number;
}

const SubcategoriesPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
    }
  }, [categoryId]);

  const fetchSubcategories = async (id: string) => {
    try {
      // const response = await fetch(`${config.CATEGORY_SERVICE_URL}/v1/category/details/${id}`);
      const response = await fetch(config.CATEGORY_DETAILS(id));

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading subcategories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 flex items-center space-x-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>
      <h1 className="text-3xl font-bold mb-8 text-center text-pink-700 drop-shadow">Subcategories</h1>
      {subcategories.length === 0 ? (
        <div className="text-center text-gray-500">No subcategories found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
          {subcategories.map((subcat) => (
            <div
              key={subcat.sub_category_id}
              className="bg-white rounded-xl shadow-lg border border-pink-100 p-6 flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:scale-105 hover:shadow-2xl transition-all duration-200"
              onClick={() => navigate(`/products/subcategory/${subcat.sub_category_id}`)}
            >
              {subcat.sub_category_image ? (
                <img src={subcat.sub_category_image} alt={subcat.sub_category_name} className="w-20 h-20 object-cover rounded-full mb-4 border-2 border-pink-200 shadow" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-4 text-3xl text-pink-400 font-bold shadow">
                  {subcat.sub_category_name.charAt(0)}
                </div>
              )}
              <div className="text-lg font-semibold text-pink-700 text-center mb-2">{subcat.sub_category_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubcategoriesPage;
