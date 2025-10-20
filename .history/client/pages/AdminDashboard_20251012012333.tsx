import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Users, BarChart3, Settings, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import config from '../config';

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_description: string;
  stock?: number;
  sub_category_id: number;
  
}

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

interface OrderAlert {
  order_alert_id: number;
  buy_product_id: number;
  order_id: number;
  total_amount: number;
  delivery_status: string;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string;
  is_canceled: boolean;
  canceled_by: number | null;
  canceled_at: string | null;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderAlert[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<SubCategory | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    product_name: '',
    product_price: '',
    product_description: '',
    sub_category_id: '',
    file: null as File | null
  });
  const [categoryForm, setCategoryForm] = useState({
    category_name: ''
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    sub_category_name: '',
    category_id: ''
  });

  // Validation state
  const [showValidation, setShowValidation] = useState(false);
  const [productNameError, setProductNameError] = useState('');
  const [categoryNameError, setCategoryNameError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [subcategoryNameError, setSubcategoryNameError] = useState('');
  const [subcategorySuccess, setSubcategorySuccess] = useState('');
  const [allProductNames, setAllProductNames] = useState<string[]>([]);

  // Track original product for update diff
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!user || (!isAdmin() && !isSuperAdmin())) {
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate, isAdmin, isSuperAdmin]);

  useEffect(() => {
    // Filter products based on search term
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

  // Fetch all product names for duplicate check when modal opens
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
        if (result.status === 1 && result.data) {
          setSubcategories(result.data);
        }
      }
    } catch {}
  };

  // Open modal and fetch product names and subcategories for add product only
  const openAddProductModal = () => {
    setShowProductModal(true);
    setEditingProduct(null);
    resetProductForm();
    setProductNameError('');
    fetchAllProductNames();
    fetchAllSubcategories();
  };

  const fetchDashboardData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${user?.token}`
      };

      // Fetch products
      const productsResponse = await fetch(config.PRODUCTS, { headers });
      if (productsResponse.ok) {
        const productsResult = await productsResponse.json();
        if (productsResult.status === 1 && productsResult.data) {
          setProducts(productsResult.data);
          setStats(prev => ({ ...prev, totalProducts: productsResult.data.length }));
        }
      }

      // Fetch categories
      const categoriesResponse = await fetch(config.CATEGORY_SERVICE_URL, { headers });
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.status === 1 && categoriesResult.data) {
          setCategories(categoriesResult.data);
        }
      }

      // Fetch all subcategories for product creation
      const fetchSubcategories = async () => {
        try {
          const headers = {
            'Authorization': `Bearer ${user?.token}`
          };
          const response = await fetch(config.CATEGORY_SUBCATEGORY(), { headers });
          if (response.ok) {
            const result = await response.json();
            if (result.status === 1 && result.data) {
              setSubcategories(result.data);
            }
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      };
      await fetchSubcategories();

      // TODO: Fetch other analytics data when APIs are available
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    console.log('Fetching orders...');
    setOrdersLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      console.log('Making request to:', config.ORDER_ALERT);
      console.log('Headers:', headers);

      // const response = await fetch('http://localhost:9024/v1/order_alert/', {
      const response = await fetch(config.ORDER_ALERT, {
        method: 'GET',
        headers
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        if (result.status === 1 && result.data) {
          setOrders(result.data);
          console.log('Orders set:', result.data);
        }
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0 && !ordersLoading) {
      fetchOrders();
    }
  }, [activeTab, orders.length, ordersLoading]);

  // Product name duplicate check
  useEffect(() => {
    if (!showProductModal || !productForm.product_name) {
      setProductNameError('');
      return;
    }
    if (allProductNames.includes(productForm.product_name.trim().toLowerCase())) {
      setProductNameError('Product name already exists. Please choose a different name.');
    } else {
      setProductNameError('');
    }
  }, [productForm.product_name, allProductNames, showProductModal]);

  // Price integer validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setProductForm({ ...productForm, product_price: value });
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.product_name || !productForm.product_price || !productForm.sub_category_id) {
      setShowValidation(true);
      return;
    }
    if (productNameError) return;
    setShowValidation(false);

    try {
      const formData = new FormData();
      formData.append('product_name', productForm.product_name);
      formData.append('product_price', productForm.product_price);
      formData.append('product_description', productForm.product_description);
      formData.append('sub_category_id', productForm.sub_category_id);

      if (productForm.file) {
        formData.append('file', productForm.file);
      }

      const response = await fetch(config.PRODUCTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        fetchDashboardData();
        setShowProductModal(false);
        resetProductForm();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(config.PRODUCTS + `/${productId}/delete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.product_id !== productId));
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    const formData = new FormData();
    let hasChange = false;
    if (productForm.product_name !== originalProduct?.product_name) {
      formData.append('product_name', productForm.product_name);
      hasChange = true;
    }
    if (productForm.product_price !== originalProduct?.product_price.toString()) {
      formData.append('product_price', productForm.product_price);
      hasChange = true;
    }
    if (productForm.product_description !== originalProduct?.product_description) {
      formData.append('product_description', productForm.product_description);
      hasChange = true;
    }
    if (productForm.sub_category_id !== originalProduct?.sub_category_id.toString()) {
      formData.append('sub_category_id', productForm.sub_category_id);
      hasChange = true;
    }
    if (productForm.file) {
      formData.append('file', productForm.file);
      hasChange = true;
    }
    if (!hasChange) {
      alert('No changes detected. Please update at least one field.');
      return;
    }
    try {
      const response = await fetch(config.API.products.update(editingProduct.product_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        fetchDashboardData();
        setShowProductModal(false);
        setEditingProduct(null);
        setOriginalProduct(null);
        resetProductForm();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setOriginalProduct(product);
    setProductForm({
      product_name: product.product_name,
      product_price: product.product_price.toString(),
      product_description: product.product_description,
      sub_category_id: product.sub_category_id.toString(),
      file: null
    });
    setShowProductModal(true);
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.category_name) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setCategoryNameError('');
    setCategorySuccess('');

    // Always fetch latest categories before duplicate check
    try {
      const headers = { 'Authorization': `Bearer ${user?.token}` };
      const categoriesResponse = await fetch(config.CATEGORY_SERVICE_URL, { headers });
      let latestCategories = categories;
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.status === 1 && categoriesResult.data) {
          latestCategories = categoriesResult.data;
        }
      }
      const duplicate = latestCategories.some(
        c => c.category_name.trim().toLowerCase() === categoryForm.category_name.trim().toLowerCase()
      );
      if (duplicate) {
        setCategoryNameError('Same category available');
        return;
      }

      const formData = new FormData();
      formData.append('category_name', categoryForm.category_name);

      const response = await fetch(config.API.category.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        setCategorySuccess('Category created successfully');
        fetchDashboardData();
        setTimeout(() => {
          setShowCategoryModal(false);
          setCategoryForm({ category_name: '' });
          setCategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCategoryNameError(error.detail || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setCategoryNameError('Error creating category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setCategoryNameError('');
    setCategorySuccess('');
    try {
      const response = await fetch(config.API.category.delete(categoryId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        setCategorySuccess('Category deleted successfully');
        setCategories(categories.filter(c => c.category_id !== categoryId));
        setTimeout(() => {
          setCategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCategoryNameError(error.detail || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setCategoryNameError('Error deleting category');
    }
  };

  const handleUpdateCategory = async () => {
    setCategoryNameError('');
    setCategorySuccess('');
    // Always fetch latest categories before duplicate check
    try {
      const headers = { 'Authorization': `Bearer ${user?.token}` };
      const categoriesResponse = await fetch(config.CATEGORY_SERVICE_URL, { headers });
      let latestCategories = categories;
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.status === 1 && categoriesResult.data) {
          latestCategories = categoriesResult.data;
        }
      }
      // Prevent duplicate name (except for the current category)
      const duplicate = latestCategories.some(
        c => c.category_name.trim().toLowerCase() === categoryForm.category_name.trim().toLowerCase() && c.category_id !== editingCategory?.category_id
      );
      if (duplicate) {
        setCategoryNameError('Same category available');
        return;
      }
      const formData = new FormData();
      formData.append('category_name', categoryForm.category_name);
      const response = await fetch(config.API.category.update(editingCategory?.category_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        setCategorySuccess('Category updated successfully');
        fetchDashboardData();
        setTimeout(() => {
          setShowCategoryModal(false);
          setCategoryForm({ category_name: '' });
          setCategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCategoryNameError(error.detail || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setCategoryNameError('Error updating category');
    }
  };

  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ category_name: category.category_name });
    setShowCategoryModal(true);
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryForm.sub_category_name || !subcategoryForm.category_id) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setSubcategoryNameError('');
    setSubcategorySuccess('');

    // Fetch all subcategories for duplicate check
    try {
      const headers = { 'Authorization': `Bearer ${user?.token}` };
      const subcategoriesResponse = await fetch(config.CATEGORY_SUBCATEGORY(), { headers });
      let latestSubcategories = subcategories;
      if (subcategoriesResponse.ok) {
        const subcategoriesResult = await subcategoriesResponse.json();
        if (subcategoriesResult.status === 1 && subcategoriesResult.data) {
          latestSubcategories = subcategoriesResult.data;
        }
      }
      // Check for duplicate subcategory name (case-insensitive)
      const duplicate = latestSubcategories.some(
        s => s.sub_category_name.trim().toLowerCase() === subcategoryForm.sub_category_name.trim().toLowerCase()
      );
      if (duplicate) {
        setSubcategoryNameError('Sub category already present');
        return;
      }
      const formData = new FormData();
      formData.append('sub_category_name', subcategoryForm.sub_category_name);
      formData.append('category_id', subcategoryForm.category_id);
      const response = await fetch(config.CATEGORY_SUBCATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        setSubcategorySuccess('Sub category created successfully');
        fetchDashboardData();
        setTimeout(() => {
          setShowSubcategoryModal(false);
          setSubcategoryForm({ sub_category_name: '', category_id: '' });
          setSubcategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setSubcategoryNameError(error.detail || 'Failed to create subcategory');
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      setSubcategoryNameError('Error creating subcategory');
    }
  };

  const handleDeleteSubcategory = async (subCategoryId: number) => {
    setSubcategoryNameError('');
    setSubcategorySuccess('');
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      const response = await fetch(config.API.category.subCategoryDelete(subCategoryId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        setSubcategorySuccess('Sub category deleted successfully');
        setSubcategories(subcategories.filter(s => s.sub_category_id !== subCategoryId));
        setTimeout(() => {
          setSubcategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setSubcategoryNameError(error.detail || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setSubcategoryNameError('Error deleting subcategory');
    }
  };

  const handleUpdateSubcategory = async () => {
    setSubcategoryNameError('');
    setSubcategorySuccess('');
    // Always fetch latest subcategories before duplicate check
    try {
      const headers = { 'Authorization': `Bearer ${user?.token}` };
      const subcategoriesResponse = await fetch(config.CATEGORY_SUBCATEGORY(), { headers });
      let latestSubcategories = subcategories;
      if (subcategoriesResponse.ok) {
        const subcategoriesResult = await subcategoriesResponse.json();
        if (subcategoriesResult.status === 1 && subcategoriesResult.data) {
          latestSubcategories = subcategoriesResult.data;
        }
      }
      // Prevent duplicate name (except for the current subcategory)
      const duplicate = latestSubcategories.some(
        s => s.sub_category_name.trim().toLowerCase() === subcategoryForm.sub_category_name.trim().toLowerCase() && s.sub_category_id !== editingSubcategory?.sub_category_id
      );
      if (duplicate) {
        setSubcategoryNameError('Sub category already present');
        return;
      }
      const formData = new FormData();
      formData.append('sub_category_name', subcategoryForm.sub_category_name);
      formData.append('category_id', subcategoryForm.category_id);
      const response = await fetch(config.API.category.subCategoryUpdate(editingSubcategory?.sub_category_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        setSubcategorySuccess('Sub category updated successfully');
        fetchDashboardData();
        setTimeout(() => {
          setShowSubcategoryModal(false);
          setSubcategoryForm({ sub_category_name: '', category_id: '' });
          setSubcategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setSubcategoryNameError(error.detail || 'Failed to update subcategory');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      setSubcategoryNameError('Error updating subcategory');
    }
  };

  const handleOpenEditSubcategory = (subcategory: SubCategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({ sub_category_name: subcategory.sub_category_name, category_id: subcategory.category_id.toString() });
    setShowSubcategoryModal(true);
  };

  // Reset product form helper
  const resetProductForm = () => {
    setProductForm({
      product_name: '',
      product_price: '',
      product_description: '',
      sub_category_id: '',
      file: null
    });
  };

  // Ensure filteredProducts is always an array
  const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={openAddProductModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <Button onClick={openAddProductModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
          <div className="mb-4">
            <Label htmlFor="search">Search Products</Label>
            <Input
              id="search"
              placeholder="Search by product name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {safeFilteredProducts.map(product => (
                <Card key={product.product_id}>
                  <CardHeader>
                    <CardTitle>{product.product_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 mb-2">
                      Price: ₹{product.product_price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Description: {product.product_description}
                    </div>
                    <div className="flex justify-between">
                      <Button
                        onClick={() => openEditProduct(product)}
                        variant="outline"
                        className="mr-2"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteProduct(product.product_id)}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="categories">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Button onClick={() => setShowCategoryModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
              {categories.map(category => (
                <Card key={category.category_id} className="min-w-0 group relative">
                  <CardHeader>
                    <CardTitle className="truncate" title={category.category_name}>{category.category_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <Button
                        onClick={() => handleOpenEditCategory(category)}
                        variant="outline"
                        className="mr-2"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.category_id)}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                    <CategorySubcategoryHover categoryId={category.category_id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="subcategories">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Subcategories</h2>
            <Button onClick={() => setShowSubcategoryModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subcategories.map(subcategory => (
                <Card key={subcategory.sub_category_id}>
                  <CardHeader>
                    <CardTitle>{subcategory.sub_category_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <Button
                        onClick={() => handleOpenEditSubcategory(subcategory)}
                        variant="outline"
                        className="mr-2"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteSubcategory(subcategory.sub_category_id)}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="orders">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Orders</h2>
            <Button onClick={() => fetchOrders()} disabled={ordersLoading}>
              <Package className="w-4 h-4 mr-2" />
              {ordersLoading ? 'Loading...' : 'Refresh Orders'}
            </Button>
          </div>
          {ordersLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders found</h3>
              <p className="text-gray-500">Orders will appear here when customers place them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.order_alert_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Order #{order.order_id}
                      </CardTitle>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.delivery_status === 'Delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.delivery_status === 'Undelivered'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.delivery_status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Order Alert ID</h4>
                        <p className="text-gray-600">{order.order_alert_id}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Buy Product ID</h4>
                        <p className="text-gray-600">{order.buy_product_id}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Total Amount</h4>
                        <p className="text-lg font-bold text-pink-600">₹{order.total_amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Created By</h4>
                        <p className="text-gray-600">User #{order.created_by}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-1">Created At</h4>
                          <p className="text-gray-600">
                            {new Date(order.created_at).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-1">Updated At</h4>
                          <p className="text-gray-600">
                            {order.updated_at ? new Date(order.updated_at).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Not updated'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {order.is_canceled && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-1">Order Canceled</h4>
                        <p className="text-red-600 text-sm">
                          Canceled by: {order.canceled_by ? `User #${order.canceled_by}` : 'System'}
                        </p>
                        {order.canceled_at && (
                          <p className="text-red-600 text-sm">
                            Canceled at: {new Date(order.canceled_at).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view order details
                          console.log('View order details:', order);
                        }}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {order.delivery_status === 'Undelivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement mark as delivered
                            console.log('Mark as delivered:', order);
                          }}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  setOriginalProduct(null);
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
                {editingProduct && (
                  <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.product_name}</span></div>
                )}
              </div>
              <div>
                <Label htmlFor="product_price">Price <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={productForm.product_price}
                  onChange={handlePriceChange}
                  required
                />
                {editingProduct && (
                  <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.product_price}</span></div>
                )}
              </div>
              <div>
                <Label htmlFor="product_description">Description (Optional)</Label>
                <Input
                  value={productForm.product_description}
                  onChange={(e) => setProductForm({...productForm, product_description: e.target.value})}
                />
                {editingProduct && (
                  <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.product_description}</span></div>
                )}
              </div>
              <div>
                <Label htmlFor="sub_category_id">Subcategory <span className="text-red-500">*</span></Label>
                <Select
                  value={productForm.sub_category_id}
                  onValueChange={(value) => setProductForm({...productForm, sub_category_id: value})}
                  required
                >
                  <SelectTrigger className="z-[110] relative">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent className="z-[120] relative">
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.sub_category_id} value={subcategory.sub_category_id.toString()}>
                        {subcategory.sub_category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingProduct && (
                  <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.sub_category_id}</span></div>
                )}
              </div>
              <div>
                {/* <Label htmlFor="product_file">Product Image (Optional)</Label>
                <Input
                  id="product_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProductForm({...productForm, file});
                  }} */}
                  <Label htmlFor="product_files">Product Images (Optional, Multiple)</Label>
                  <Input
                    id="product_files"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setProductForm({ ...productForm, files });
                    }}
                  />
                  {productForm.files?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Selected: {productForm.files.length} image{productForm.files.length > 1 ? 's' : ''}
                    </div>
                  )}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  className="flex-1"
                  disabled={
                    !productForm.product_name ||
                    !productForm.product_price ||
                    !productForm.sub_category_id ||
                    productNameError !== ''
                  }
                >
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    setOriginalProduct(null);
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

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-4">
              <Label htmlFor="category_name">Category Name</Label>
              <Input
                value={categoryForm.category_name}
                onChange={(e) => {
                  setCategoryForm({...categoryForm, category_name: e.target.value});
                  setCategoryNameError('');
                  setCategorySuccess('');
                }}
              />
              {showValidation && !categoryForm.category_name && (
                <div className="text-red-500 text-sm mt-1">Category name is required</div>
              )}
              {categoryNameError && (
                <div className="text-red-500 text-sm mt-1">{categoryNameError}</div>
              )}
              {categorySuccess && (
                <div className="text-green-600 text-sm mt-1">{categorySuccess}</div>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                className="mr-2"
                disabled={loading}
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
              <Button variant="ghost" onClick={() => setShowSubcategoryModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-4">
              <Label htmlFor="sub_category_name">Subcategory Name</Label>
              <Input
                value={subcategoryForm.sub_category_name}
                onChange={(e) => {
                  setSubcategoryForm({...subcategoryForm, sub_category_name: e.target.value});
                  setSubcategoryNameError('');
                  setSubcategorySuccess('');
                }}
              />
              {showValidation && !subcategoryForm.sub_category_name && (
                <div className="text-red-500 text-sm mt-1">Subcategory name is required</div>
              )}
              {subcategoryNameError && (
                <div className="text-red-500 text-sm mt-1">{subcategoryNameError}</div>
              )}
              {subcategorySuccess && (
                <div className="text-green-600 text-sm mt-1">{subcategorySuccess}</div>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={subcategoryForm.category_id}
                onValueChange={(value) => setSubcategoryForm({...subcategoryForm, category_id: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.category_id} value={category.category_id.toString()}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showValidation && !subcategoryForm.category_id && (
                <div className="text-red-500 text-sm mt-1">Category is required</div>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={editingSubcategory ? handleUpdateSubcategory : handleCreateSubcategory}
                className="mr-2"
                disabled={loading}
              >
                {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSubcategoryModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Find Us Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Find Us</h2>
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
  );
}

function CategorySubcategoryHover({ categoryId }: { categoryId: number }) {
  const [subcategories, setSubcategories] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const lastFetchedId = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    setSubcategories(null);
    lastFetchedId.current = categoryId;
    fetch(config.CATEGORY_DETAILS(categoryId))
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const result = await res.json();
        if (mounted && lastFetchedId.current === categoryId) {
          if (result && result.data && Array.isArray(result.data.subcategories) && result.data.subcategories.length > 0) {
            setSubcategories(result.data.subcategories);
          } else {
            setSubcategories([]);
          }
        }
      })
      .catch(() => {
        if (mounted && lastFetchedId.current === categoryId) setError(true);
      })
      .finally(() => {
        if (mounted && lastFetchedId.current === categoryId) setLoading(false);
      });
    return () => { mounted = false; };
  }, [categoryId]);

  return (
    <div className="absolute left-0 right-0 bottom-0 bg-white bg-opacity-90 text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {loading ? 'Loading...' : error || !subcategories ? 'No subcategory' : subcategories.length === 0 ? 'No subcategory' : `${subcategories.length} subcategories`}
    </div>
  );
}
