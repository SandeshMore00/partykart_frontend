import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, List, Filter, SortAsc, Package, Search, X, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import config from '../config';

// Check if user can edit products
const canEditProducts = (isAdmin: () => boolean, isSuperAdmin: () => boolean) => isAdmin() || isSuperAdmin();

interface Product {
  product_id: number;
  product_name: string;
  product_price?: number;
  product_full_price?: number;
  product_description?: string;
  product_image?: string[] | string;
  sub_category_id?: number;
  stock?: number;
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
  // default to grid/box view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(9);
  const { addToCart } = useCart();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const canEdit = canEditProducts(isAdmin, isSuperAdmin);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const subcategoryName = searchParams.get('name') || 'Products';

  // Add Product Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    product_name: '',
    product_price: '',
    product_full_price: '',
    product_description: '',
    sub_category_id: '',
    file: null as File | null,
    // Optional shipping fields
    weight: '',
    length: '',
    width: '',
    height: '',
    origin_location: ''
  });
  const [productNameError, setProductNameError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [allProductNames, setAllProductNames] = useState<string[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Array<{ sub_category_id: number; sub_category_name: string }>>([]);

  useEffect(() => {
    if (subCategoryId) {
      fetchProducts(parseInt(subCategoryId), 1);
      setCurrentPage(1);
      
      // Auto-scroll on mobile to skip blank header space and show products properly
      if (window.innerWidth < 768) {
        setTimeout(() => {
          window.scrollTo({ top: 220, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [subCategoryId]);

  // Fetch all product names for duplicate check
  const fetchAllProductNames = async () => {
    try {
      const response = await fetch(config.PRODUCTS, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setAllProductNames(result.data.map((p: any) => p.product_name.toLowerCase()));
        }
      }
    } catch {}
  };

  // Fetch all subcategories for add product modal
  const fetchAllSubcategories = async () => {
    try {
      const response = await fetch(config.CATEGORY_SUBCATEGORY(), {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1) {
          setAllSubcategories(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setAllSubcategories([]);
    }
  };

  // Open add product modal
  const openAddProductModal = () => {
    setShowAddProductModal(true);
    resetProductForm();
    setProductNameError('');
    fetchAllProductNames();
    fetchAllSubcategories();
    // Pre-fill subcategory_id with current subcategory
    if (subCategoryId) {
      setProductForm(prev => ({ ...prev, sub_category_id: subCategoryId }));
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setProductForm({
      product_name: '',
      product_price: '',
      product_full_price: '',
      product_description: '',
      sub_category_id: subCategoryId || '',
      file: null,
      weight: '',
      length: '',
      width: '',
      height: '',
      origin_location: ''
    });
  };

  // Product name duplicate check
  useEffect(() => {
    if (!showAddProductModal || !productForm.product_name) {
      setProductNameError('');
      return;
    }
    if (allProductNames.includes(productForm.product_name.trim().toLowerCase())) {
      setProductNameError('Product name already exists. Please choose a different name.');
    } else {
      setProductNameError('');
    }
  }, [productForm.product_name, allProductNames, showAddProductModal]);

  // Price integer validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setProductForm({ ...productForm, product_price: value });
    }
  };

  // Full price integer validation
  const handleFullPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setProductForm({ ...productForm, product_full_price: value });
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.product_name || !productForm.sub_category_id) {
      setShowValidation(true);
      return;
    }
    if (productNameError) return;
    setShowValidation(false);

    try {
      const formData = new FormData();
      formData.append('product_name', productForm.product_name);
      // Only send product_price if user entered a value, otherwise don't pass the parameter
      if (productForm.product_price.trim()) {
        formData.append('product_price', productForm.product_price);
      }
      // Only send product_full_price if user entered a value
      if (productForm.product_full_price.trim()) {
        formData.append('product_full_price', productForm.product_full_price);
      }
      formData.append('product_description', productForm.product_description);
      formData.append('sub_category_id', productForm.sub_category_id);

      // Append optional shipping fields
      if (productForm.weight.trim()) {
        formData.append('weight', productForm.weight);
      }
      if (productForm.length.trim()) {
        formData.append('length', productForm.length);
      }
      if (productForm.width.trim()) {
        formData.append('width', productForm.width);
      }
      if (productForm.height.trim()) {
        formData.append('height', productForm.height);
      }
      if (productForm.origin_location.trim()) {
        formData.append('origin_location', productForm.origin_location);
      }

      if (productForm.file) {
        console.log('Appending file:', {
          name: productForm.file.name,
          size: productForm.file.size,
          type: productForm.file.type
        });
        formData.append('file', productForm.file, productForm.file.name);
      }

      const response = await fetch(config.CREATE_PRODUCTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowAddProductModal(false);
        resetProductForm();
        // Reload the page to show the new product
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    }
  };

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

  const fetchProducts = async (subCategoryId: number, page = 1) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(`${config.PRODUCTS_BY_SUBCATEGORY(subCategoryId)}?page=${page}&page_size=${pageSize}`, { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setProducts(result.data);
          setTotalPages(result.total_pages || 1);
          setTotalItems(result.total_items || result.data.length);
          setCurrentPage(result.page_no || page);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(config.PRODUCT_SEARCH(query));
      if (response.ok) {
        const result = await response.json();
        // Handle direct array response or wrapped response
        if (Array.isArray(result)) {
          setSearchResults(result);
          setShowSearchResults(true);
        } else if (result.status === 1 && result.data) {
          setSearchResults(result.data);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(true);
        }
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for 1 second
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(query);
      }, 1000);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    const images = Array.isArray(product.product_image)
      ? product.product_image
      : product.product_image ? [product.product_image] : [];
    addToCart({
      id: product.product_id,
      name: product.product_name,
      price: product.product_price,
      image: images[0] || '',
      description: product.product_description,
      available_stock: product.stock
    });
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleEditProduct = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    navigate(`/admin/edit-product/${productId}`);
  };

  const handleDeleteProduct = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(config.PRODUCT_DELETE(productId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        // Reload the page to show updated product listing
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.detail || error.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
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
      <div className="mb-6 space-y-4">
        <div className="flex items-start md:items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm md:text-base">Back</span>
          </Button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{subcategoryName}</h1>
            <p className="text-sm text-gray-600">
              Showing {products.length} of {totalItems} products
            </p>
          </div>
        </div>

        {/* Search Bar and Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Add Product Button (Admin Only) */}
          {canEdit && (
            <Button
              onClick={openAddProductModal}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
          
          {/* Search Bar */}
          <div className="relative w-full md:flex-1 md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => {
                      const images = Array.isArray(product.product_image)
                        ? product.product_image
                        : product.product_image ? [product.product_image] : [];
                      const mainImage = images[0] || '/placeholder.svg';
                      const hasImage = images.length > 0 && images[0];

                      return (
                        <div
                          key={product.product_id}
                          onClick={() => handleSearchResultClick(product.product_id)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {hasImage && (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              <img
                                src={mainImage}
                                alt={product.product_name}
                                className="w-full h-full object-contain p-1 rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{product.product_name}</h3>
                            {product.product_description && (
                              <p className="text-sm text-gray-600 truncate">{product.product_description}</p>
                            )}
                            {product.product_price && (
                              <div className="flex items-center gap-2 mt-1">
                                {product.product_full_price && product.product_full_price > product.product_price && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{product.product_full_price.toLocaleString('en-IN')}
                                  </span>
                                )}
                                <span className="text-sm font-semibold text-pink-600">
                                  ₹{product.product_price.toLocaleString('en-IN')}
                                </span>
                                {product.product_full_price && product.product_full_price > product.product_price && (
                                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    {Math.round(((product.product_full_price - product.product_price) / product.product_full_price) * 100)}% OFF
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-600">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls: desktop layout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden sm:block">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-44">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-[9999]">
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile filter toggle */}
            <button
              className="sm:hidden inline-flex items-center space-x-2 bg-pink-500 text-white px-3 py-2 rounded-md"
              onClick={() => setShowFilters(s => !s)}
              aria-label="Open filters"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>
          </div>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="mt-3 sm:hidden bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white rounded' : 'text-gray-600 rounded hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white rounded' : 'text-gray-600 rounded hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>Close</Button>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Sort</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-[9999]">
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Product List */}
      <div 
        id="product-list"
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-4'
        }
      >
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
                className={
                  viewMode === 'grid'
                    ? 'bg-white rounded-lg shadow-sm p-3 flex flex-col items-start cursor-pointer hover:shadow-md transition overflow-hidden relative group'
                    : 'bg-white rounded-lg shadow-md p-4 flex flex-row items-center cursor-pointer hover:shadow-lg transition relative group'
                }
                onClick={() => handleProductClick(product.product_id)}
              >
                {/* Admin Edit and Delete Buttons - appears on hover */}
                {canEdit && viewMode === 'grid' && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={e => handleEditProduct(e, product.product_id)}
                      className="bg-white/90 hover:bg-white shadow-md text-pink-600"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={e => handleDeleteProduct(e, product.product_id)}
                      className="bg-white/90 hover:bg-white shadow-md"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
                  <div className={viewMode === 'grid' ? 'mb-3 relative w-full' : 'mr-4 w-32 h-32 flex-shrink-0 relative'}>
                  {images.length > 0 ? (
                    <>
                        <div className={viewMode === 'grid' ? 'w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden rounded-md' : 'w-32 h-32 bg-gray-50 flex items-center justify-center overflow-hidden rounded-md'}>
                          <img
                            src={images[currentIndex]}
                            alt={product.product_name}
                            className="w-full h-full object-contain p-1"
                            loading="lazy"
                            decoding="async"
                            fetchPriority={currentIndex === 0 && imageIndexes[product.product_id] === undefined ? "high" : "low"}
                          />
                        </div>
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
                  <h2 className={viewMode === 'grid' ? 'text-sm font-semibold text-gray-800 mb-1' : 'text-lg font-semibold text-gray-800 mb-2'}>{product.product_name}</h2>
                  <p className={viewMode === 'grid' ? 'text-sm text-gray-600 mb-2 max-h-10 overflow-hidden' : 'text-gray-600 mb-2'}>{product.product_description}</p>
                  <div className="flex flex-col gap-1 mb-2">
                    {product.product_full_price && product.product_full_price > product.product_price && (
                      <div className="flex items-center gap-2">
                        <span className={viewMode === 'grid' ? 'text-xs text-gray-400 line-through' : 'text-sm text-gray-400 line-through'}>
                          ₹{product.product_full_price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          {Math.round(((product.product_full_price - product.product_price) / product.product_full_price) * 100)}% OFF
                        </span>
                      </div>
                    )}
                    <div className={viewMode === 'grid' ? 'text-pink-600 font-semibold text-sm' : 'text-pink-600 font-bold text-lg'}>₹{product.product_price.toLocaleString('en-IN')}</div>
                  </div>
                  {product.stock !== undefined && product.stock <= 5 && (
                    <>
                      {product.stock > 0 && (
                        <div className="text-orange-600 text-xs font-semibold mb-2">
                          Only {product.stock} left in stock!
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="text-red-600 text-xs font-semibold mb-2">
                          Out of stock
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" onClick={e => { e.stopPropagation(); handleAddToCart(product); }}>
                      Add
                    </Button>
                    {viewMode !== 'grid' && (
                      <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleProductClick(product.product_id); }}>
                        View
                      </Button>
                    )}
                    {canEdit && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={e => handleEditProduct(e, product.product_id)}
                          className="text-pink-600 border-pink-200 hover:bg-pink-50"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={e => handleDeleteProduct(e, product.product_id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              if (subCategoryId) {
                fetchProducts(parseInt(subCategoryId), newPage);
              }
            }}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCurrentPage(pageNum);
                    if (subCategoryId) {
                      fetchProducts(parseInt(subCategoryId), pageNum);
                    }
                  }}
                  className={currentPage === pageNum ? "bg-pink-500 hover:bg-pink-600" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              if (subCategoryId) {
                fetchProducts(parseInt(subCategoryId), newPage);
              }
            }}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          
          <span className="text-sm text-gray-600 ml-2">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Product</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddProductModal(false);
                  resetProductForm();
                  setProductNameError('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product_name">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  value={productForm.product_name}
                  onChange={(e) => setProductForm({...productForm, product_name: e.target.value})}
                  required
                />
                {productNameError && (
                  <div className="text-red-500 text-sm mt-1">{productNameError}</div>
                )}
              </div>
              <div>
                <Label htmlFor="product_price">Selling Price (Optional)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={productForm.product_price}
                  onChange={handlePriceChange}
                  placeholder="Enter price or leave empty"
                />
              </div>
              <div>
                <Label htmlFor="product_full_price">Original/Full Price (Optional)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={productForm.product_full_price}
                  onChange={handleFullPriceChange}
                  placeholder="Enter original price or leave empty"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if no discount. This shows crossed-out price.</p>
              </div>
              <div>
                <Label htmlFor="product_description">Description (Optional)</Label>
                <Input
                  value={productForm.product_description}
                  onChange={(e) => setProductForm({...productForm, product_description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="sub_category_id">Subcategory <span className="text-red-500">*</span></Label>
                <Select
                  value={productForm.sub_category_id}
                  onValueChange={(value) => setProductForm({...productForm, sub_category_id: value})}
                  required
                >
                  <SelectTrigger className="w-full z-[110] relative">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto z-[9999] relative">
                    {allSubcategories.map((subcategory) => (
                      <SelectItem 
                        key={subcategory.sub_category_id} 
                        value={subcategory.sub_category_id.toString()}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {subcategory.sub_category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Information Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Shipping Information (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                      placeholder="e.g., 1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="origin_location">Origin Location</Label>
                    <Input
                      id="origin_location"
                      value={productForm.origin_location}
                      onChange={(e) => setProductForm({...productForm, origin_location: e.target.value})}
                      placeholder="e.g., New York, USA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.length}
                      onChange={(e) => setProductForm({...productForm, length: e.target.value})}
                      placeholder="e.g., 25.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.width}
                      onChange={(e) => setProductForm({...productForm, width: e.target.value})}
                      placeholder="e.g., 15.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.height}
                      onChange={(e) => setProductForm({...productForm, height: e.target.value})}
                      placeholder="e.g., 10.5"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="product_file">Product Image (Optional)</Label>
                <Input
                  id="product_file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      // Validate file type
                      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                      if (!validTypes.includes(file.type)) {
                        alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
                        e.target.value = '';
                        return;
                      }
                      // Validate file size (500 KB)
                      if (file.size > 512000) {
                        alert(`Image is too large. Maximum size is 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB`);
                        e.target.value = '';
                        return;
                      }
                    }
                    setProductForm({...productForm, file});
                  }}
                />
                {productForm.file && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {productForm.file.name} ({(productForm.file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Maximum size: 500 KB for optimal performance
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateProduct}
                  className="flex-1"
                  disabled={
                    !productForm.product_name ||
                    !productForm.sub_category_id ||
                    productNameError !== ''
                  }
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddProductModal(false);
                    resetProductForm();
                    setProductNameError('');
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
}
