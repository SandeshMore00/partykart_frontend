import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, List, Filter, SortAsc, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import config from '../config';

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_description: string;
  product_image: string[] | string;
  sub_category_id: number;
}

export default function ProductsBySubcategory() {
  // Track image index for each product
  const [imageIndexes, setImageIndexes] = useState<{ [productId: number]: number }>({});
  const { subCategoryId } = useParams<{ subCategoryId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high'>('name');
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const subcategoryName = searchParams.get('name') || 'Products';

  useEffect(() => {
    if (subCategoryId) {
      fetchProducts(parseInt(subCategoryId));
    }
  }, [subCategoryId]);

  useEffect(() => {
    // Sort products when sortBy changes
    let sorted = [...products];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'price_low':
        sorted.sort((a, b) => a.product_price - b.product_price);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.product_price - a.product_price);
        break;
    }
    setFilteredProducts(sorted);
  }, [products, sortBy]);

  const fetchProducts = async (subCategoryId: number) => {
    try {
      const headers: Record<string, string> = {};
      
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
  const response = await fetch(config.PRODUCTS_BY_SUBCATEGORY(subCategoryId), { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setProducts(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const images = Array.isArray(product.product_image)
      ? product.product_image
      : product.product_image ? [product.product_image] : [];
    addToCart({
      id: product.product_id,
      name: product.product_name,
      price: product.product_price,
      image: images[0] || '',
      description: product.product_description
    });
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            <h1 className="text-3xl font-bold text-gray-800">{subcategoryName}</h1>
            <p className="text-gray-600">{products.length} products found</p>
          </div>
        </div>

        {/* View and Sort Controls */}
        <div className="flex items-center space-x-4">
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

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-40">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12 text-lg font-semibold">
            No product listed
          </div>
        ) : (
          filteredProducts.map((product) => {
            // Normalize product_image to array
            const images = Array.isArray(product.product_image)
              ? product.product_image
              : product.product_image ? [product.product_image] : [];
            const currentIndex = imageIndexes[product.product_id] || 0;
            const showArrows = images.length > 1;
            return (
              <div
                key={product.product_id}
                className={viewMode === 'grid' ? 'bg-white rounded-lg shadow-md p-4 flex flex-col cursor-pointer hover:shadow-lg transition' : 'bg-white rounded-lg shadow-md p-4 flex flex-row items-center cursor-pointer hover:shadow-lg transition'}
                onClick={() => handleProductClick(product.product_id)}
              >
                <div className={viewMode === 'grid' ? 'mb-4 relative' : 'mr-4 w-32 h-32 flex-shrink-0 relative'}>
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentIndex]}
                        alt={product.product_name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      {showArrows && (
                        <>
                          <button
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10"
                            onClick={e => {
                              e.stopPropagation();
                              setImageIndexes(idx => ({
                                ...idx,
                                [product.product_id]: currentIndex === 0 ? images.length - 1 : currentIndex - 1
                              }));
                            }}
                            aria-label="Previous image"
                          >
                            <ArrowLeft className="w-4 h-4 text-pink-500" />
                          </button>
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10"
                            onClick={e => {
                              e.stopPropagation();
                              setImageIndexes(idx => ({
                                ...idx,
                                [product.product_id]: currentIndex === images.length - 1 ? 0 : currentIndex + 1
                              }));
                            }}
                            aria-label="Next image"
                          >
                            <ArrowLeft className="w-4 h-4 text-pink-500 rotate-180" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md text-gray-400">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.product_name}</h2>
                  <p className="text-gray-600 mb-2">{product.product_description}</p>
                  <div className="text-pink-600 font-bold text-lg mb-2">₹{product.product_price.toLocaleString('en-IN')}</div>
                  <Button size="sm" onClick={e => { e.stopPropagation(); handleAddToCart(product); }}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
