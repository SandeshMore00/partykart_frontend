import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Users, BarChart3, Settings, Plus, Edit, Trash2, Search, X, Video, ChevronDown, ChevronRight, GraduationCap, FolderOpen, Layers, ExternalLink } from 'lucide-react';
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
  product_full_price?: number;
  product_description: string;
  stock?: number;
  sub_category_id: number;
  // Shipping fields
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  origin_location?: string;
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
  sub_category_image?: string | null;
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

// Course-related interfaces
interface CourseCategory {
  category_id: number;
  category_name: string;
}

interface CourseSubcategory {
  sub_category_id: number;
  sub_category_name: string;
  category_id: number;
}

interface Course {
  course_id: number;
  course_name: string;
  course_link: string;
  course_subcategory: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  
  // Product search states
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [showProductSearchResults, setShowProductSearchResults] = useState(false);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const productSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    file: null as File | null,
    // Optional shipping fields
    weight: '',
    length: '',
    width: '',
    height: '',
    origin_location: ''
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
  
  // Subcategory image states
  const [selectedSubcategoryImage, setSelectedSubcategoryImage] = useState<File | null>(null);
  const [subcategoryImagePreview, setSubcategoryImagePreview] = useState<string | null>(null);
  const [removeExistingSubcategoryImage, setRemoveExistingSubcategoryImage] = useState(false);

  // Track original product for update diff
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

  // Course management states
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [courseSubcategories, setCourseSubcategories] = useState<CourseSubcategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  
  // Course category modal states
  const [showCourseCategoryModal, setShowCourseCategoryModal] = useState(false);
  const [editingCourseCategory, setEditingCourseCategory] = useState<CourseCategory | null>(null);
  const [courseCategoryForm, setCourseCategoryForm] = useState({ category_name: '' });
  const [courseCategoryError, setCourseCategoryError] = useState('');
  const [courseCategorySuccess, setCourseCategorySuccess] = useState('');
  
  // Course subcategory modal states
  const [showCourseSubcategoryModal, setShowCourseSubcategoryModal] = useState(false);
  const [editingCourseSubcategory, setEditingCourseSubcategory] = useState<CourseSubcategory | null>(null);
  const [courseSubcategoryForm, setCourseSubcategoryForm] = useState({ sub_category_name: '', category_id: '' });
  const [courseSubcategoryError, setCourseSubcategoryError] = useState('');
  const [courseSubcategorySuccess, setCourseSubcategorySuccess] = useState('');
  
  // Course modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ course_name: '', course_link: '', course_subcategory: '' });
  const [courseError, setCourseError] = useState('');
  const [courseSuccess, setCourseSuccess] = useState('');
  
  // Expanded categories/subcategories for hierarchical display
  const [expandedCourseCategories, setExpandedCourseCategories] = useState<Set<number>>(new Set());
  const [expandedCourseSubcategories, setExpandedCourseSubcategories] = useState<Set<number>>(new Set());
  
  // Subcategories per category (fetched on expand)
  const [categorySubcategories, setCategorySubcategories] = useState<Record<number, CourseSubcategory[]>>({});
  const [loadingCategorySubcategories, setLoadingCategorySubcategories] = useState<Set<number>>(new Set());
  
  // All subcategories for course dropdown
  const [allCourseSubcategories, setAllCourseSubcategories] = useState<CourseSubcategory[]>([]);
  const [loadingAllSubcategories, setLoadingAllSubcategories] = useState(false);
  
  // Course search states
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseSearchResults, setCourseSearchResults] = useState<Course[]>([]);
  const [showCourseSearchResults, setShowCourseSearchResults] = useState(false);
  const [courseSearchLoading, setCourseSearchLoading] = useState(false);
  const courseSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || (!isAdmin() && !isSuperAdmin())) {
      navigate('/');
      return;
    }
    
    fetchDashboardData();
    
    // Auto-scroll on mobile to skip blank header space and show content properly
    if (window.innerWidth < 768) {
      setTimeout(() => {
        window.scrollTo({ top: 220, behavior: 'smooth' });
      }, 100);
    }
  }, [user, navigate, isAdmin, isSuperAdmin]);

  useEffect(() => {
    // Always show products from current page (search is disabled with pagination)
    setFilteredProducts(products);
  }, [products]);

  // Cleanup product search timeout on unmount
  useEffect(() => {
    return () => {
      if (productSearchTimeoutRef.current) {
        clearTimeout(productSearchTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup course search timeout on unmount
  useEffect(() => {
    return () => {
      if (courseSearchTimeoutRef.current) {
        clearTimeout(courseSearchTimeoutRef.current);
      }
    };
  }, []);

  // Product search handlers
  const searchProductsAPI = async (query: string) => {
    if (!query.trim()) {
      setProductSearchResults([]);
      setShowProductSearchResults(false);
      return;
    }

    setProductSearchLoading(true);
    try {
      const response = await fetch(config.PRODUCT_ADMIN_SEARCH(query), {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result)) {
          setProductSearchResults(result);
          setShowProductSearchResults(true);
        } else if (result.status === 1 && result.data) {
          setProductSearchResults(result.data);
          setShowProductSearchResults(true);
        } else {
          setProductSearchResults([]);
          setShowProductSearchResults(true);
        }
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProductSearchResults([]);
    } finally {
      setProductSearchLoading(false);
    }
  };

  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setProductSearchQuery(query);

    if (productSearchTimeoutRef.current) {
      clearTimeout(productSearchTimeoutRef.current);
    }

    if (query.trim()) {
      productSearchTimeoutRef.current = setTimeout(() => {
        searchProductsAPI(query);
      }, 1000);
    } else {
      setProductSearchResults([]);
      setShowProductSearchResults(false);
    }
  };

  const handleProductSearchResultClick = (productId: number) => {
    navigate(`/admin/edit-product/${productId}`);
    setProductSearchQuery('');
    setShowProductSearchResults(false);
  };

  const clearProductSearch = () => {
    setProductSearchQuery('');
    setProductSearchResults([]);
    setShowProductSearchResults(false);
    if (productSearchTimeoutRef.current) {
      clearTimeout(productSearchTimeoutRef.current);
    }
  };

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
        if (result.status === 1) {
          setSubcategories(result.data || []);
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

  const fetchDashboardData = async (page = 1, size = pageSize) => {
    try {
      const headers = {
        'Authorization': `Bearer ${user?.token}`
      };

      // Fetch products with pagination
      const productsResponse = await fetch(`${config.ALL_PRODUCTS}?page=${page}&page_size=${size}`, { headers });
      if (productsResponse.ok) {
        const productsResult = await productsResponse.json();
        if (productsResult.status === 1) {
          setProducts(productsResult.data || []);
          setTotalPages(productsResult.total_pages || 1);
          setTotalItems(productsResult.total_items || 0);
          setCurrentPage(productsResult.page_no || page);
          setStats(prev => ({ ...prev, totalProducts: productsResult.total_items || 0 }));
        }
      }

      // Fetch categories
      const categoriesResponse = await fetch(config.FETCH_CATEGORY, { headers });
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.status === 1) {
          setCategories(categoriesResult.data || []);
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
            if (result.status === 1) {
              setSubcategories(result.data || []);
            }
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          setSubcategories([]);
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
  }, [activeTab]);

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
        fetchDashboardData(currentPage, pageSize);
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
      const response = await fetch(config.PRODUCT_DELETE(productId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        // Refresh the products list to show updated data
        await fetchDashboardData(currentPage, pageSize);
        alert('Product deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || error.message || 'Failed to delete product');
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
    
    // Check shipping fields for changes
    if (productForm.weight !== (originalProduct?.weight?.toString() || '')) {
      formData.append('weight', productForm.weight);
      hasChange = true;
    }
    if (productForm.length !== (originalProduct?.length?.toString() || '')) {
      formData.append('length', productForm.length);
      hasChange = true;
    }
    if (productForm.width !== (originalProduct?.width?.toString() || '')) {
      formData.append('width', productForm.width);
      hasChange = true;
    }
    if (productForm.height !== (originalProduct?.height?.toString() || '')) {
      formData.append('height', productForm.height);
      hasChange = true;
    }
    if (productForm.origin_location !== (originalProduct?.origin_location || '')) {
      formData.append('origin_location', productForm.origin_location);
      hasChange = true;
    }
    
    if (productForm.file) {
      console.log('Appending file for update:', {
        name: productForm.file.name,
        size: productForm.file.size,
        type: productForm.file.type
      });
      formData.append('file', productForm.file, productForm.file.name);
      hasChange = true;
    }
    if (!hasChange) {
      alert('No changes detected. Please update at least one field.');
      return;
    }
    try {
      const response = await fetch(config.PRODUCT_UPDATE(editingProduct.product_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        fetchDashboardData(currentPage, pageSize);
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
      file: null,
      // Set shipping fields
      weight: product.weight?.toString() || '',
      length: product.length?.toString() || '',
      width: product.width?.toString() || '',
      height: product.height?.toString() || '',
      origin_location: product.origin_location || ''
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
      const categoriesResponse = await fetch(config.FETCH_CATEGORY, { headers });
      let latestCategories = categories;
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.status === 1) {
          latestCategories = categoriesResult.data || [];
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

      const response = await fetch(config.CATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        setCategorySuccess('Category created successfully');
        fetchDashboardData(currentPage, pageSize);
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
      const response = await fetch(config.CATEGORY_DELETE(categoryId), {
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
      const categoriesResponse = await fetch(config.FETCH_CATEGORY, { headers });
      let latestCategories = categories;
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.status === 1) {
          latestCategories = categoriesResult.data || [];
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
      const response = await fetch(config.CATEGORY_UPDATE(editingCategory?.category_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        setCategorySuccess('Category updated successfully');
        fetchDashboardData(currentPage, pageSize);
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

  // Subcategory image handlers
  const handleSubcategoryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setSubcategoryNameError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 512000) {
      setSubcategoryNameError(`Image is too large. Maximum size is 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB`);
      return;
    }

    setSubcategoryNameError('');
    setSelectedSubcategoryImage(file);
    setRemoveExistingSubcategoryImage(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSubcategoryImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSubcategoryImage = () => {
    setSelectedSubcategoryImage(null);
    if (editingSubcategory?.sub_category_image) {
      setRemoveExistingSubcategoryImage(true);
      setSubcategoryImagePreview(null);
    } else {
      setSubcategoryImagePreview(null);
    }
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
      
      // Add image if selected
      if (selectedSubcategoryImage) {
        formData.append('file', selectedSubcategoryImage);
      }
      
      const response = await fetch(config.CATEGORY_SUBCATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        setSubcategorySuccess('Sub category created successfully');
        fetchDashboardData(currentPage, pageSize);
        setTimeout(() => {
          setShowSubcategoryModal(false);
          setSubcategoryForm({ sub_category_name: '', category_id: '' });
          setSubcategorySuccess('');
          setSelectedSubcategoryImage(null);
          setSubcategoryImagePreview(null);
          setRemoveExistingSubcategoryImage(false);
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
      const response = await fetch(config.CATEGORY_SUBCATEGORY_DELETE(subCategoryId), {
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
    
    if (!editingSubcategory) return;
    
    // Check if there are any changes first
    const nameChanged = subcategoryForm.sub_category_name.trim() !== editingSubcategory.sub_category_name;
    const categoryChanged = subcategoryForm.category_id !== editingSubcategory.category_id.toString();
    const imageChanged = selectedSubcategoryImage !== null || removeExistingSubcategoryImage;
    
    if (!nameChanged && !categoryChanged && !imageChanged) {
      setSubcategoryNameError('No changes detected');
      return;
    }
    
    // Only check for duplicate if name is being changed
    if (nameChanged) {
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
      } catch (error) {
        console.error('Error checking duplicates:', error);
      }
    }
    
    try {
      const formData = new FormData();
      
      // Only append name if changed
      if (nameChanged) {
        formData.append('sub_category_name', subcategoryForm.sub_category_name.trim());
      }
      
      // Only append category_id if changed
      if (categoryChanged) {
        formData.append('category_id', subcategoryForm.category_id);
      }
      
      // Only append image if new image selected or removing existing
      if (selectedSubcategoryImage) {
        formData.append('file', selectedSubcategoryImage);
      } else if (removeExistingSubcategoryImage) {
        formData.append('remove_image', 'true');
      }
      
      const response = await fetch(config.CATEGORY_SUBCATEGORY_UPDATE(editingSubcategory?.sub_category_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      if (response.ok) {
        setSubcategorySuccess('Sub category updated successfully');
        fetchDashboardData(currentPage, pageSize);
        setTimeout(() => {
          setShowSubcategoryModal(false);
          setSubcategoryForm({ sub_category_name: '', category_id: '' });
          setSubcategorySuccess('');
          setSelectedSubcategoryImage(null);
          setSubcategoryImagePreview(null);
          setRemoveExistingSubcategoryImage(false);
          setEditingSubcategory(null);
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
    setSelectedSubcategoryImage(null);
    setSubcategoryImagePreview(subcategory.sub_category_image || null);
    setRemoveExistingSubcategoryImage(false);
    setSubcategoryNameError('');
    setSubcategorySuccess('');
    setShowSubcategoryModal(true);
  };

  // =============================================
  // COURSE MANAGEMENT FUNCTIONS
  // =============================================

  // Fetch all course data
  const fetchCourseData = async () => {
    setCoursesLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      // Fetch course categories
      const categoriesRes = await fetch(config.COURSE_CATEGORY_LIST, { headers });
      if (categoriesRes.ok) {
        const result = await categoriesRes.json();
        if (result.status === 1 && result.data) {
          setCourseCategories(result.data);
        } else if (Array.isArray(result)) {
          setCourseCategories(result);
        }
      }

      // Fetch course subcategories
      const subcategoriesRes = await fetch(config.COURSE_SUBCATEGORY_LIST, { headers });
      if (subcategoriesRes.ok) {
        const result = await subcategoriesRes.json();
        if (result.status === 1 && result.data) {
          setCourseSubcategories(result.data);
        } else if (Array.isArray(result)) {
          setCourseSubcategories(result);
        }
      }

      // Fetch courses
      const coursesRes = await fetch(config.COURSES_LIST, { headers });
      if (coursesRes.ok) {
        const result = await coursesRes.json();
        if (result.status === 1 && result.data) {
          setCourses(result.data);
        } else if (Array.isArray(result)) {
          setCourses(result);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch courses when courses tab is active
  useEffect(() => {
    if (activeTab === 'courses' && courseCategories.length === 0 && !coursesLoading) {
      fetchCourseData();
    }
  }, [activeTab]);

  // Fetch subcategories for a specific category
  const fetchSubcategoriesForCategory = async (categoryId: number) => {
    if (loadingCategorySubcategories.has(categoryId)) return;
    
    setLoadingCategorySubcategories(prev => new Set(prev).add(categoryId));
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(config.COURSE_SUBCATEGORY_BY_CATEGORY(categoryId), { headers });
      if (response.ok) {
        const result = await response.json();
        const subcategories = Array.isArray(result) ? result : (result.data || []);
        setCategorySubcategories(prev => ({ ...prev, [categoryId]: subcategories }));
      }
    } catch (error) {
      console.error('Error fetching subcategories for category:', error);
    } finally {
      setLoadingCategorySubcategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  };

  // Toggle expanded categories/subcategories (accordion style - only one open at a time)
  const toggleCourseCategory = async (categoryId: number) => {
    const isCurrentlyExpanded = expandedCourseCategories.has(categoryId);
    
    // Close all categories and subcategories, then open only the selected one if it was closed
    setExpandedCourseCategories(prev => {
      if (prev.has(categoryId)) {
        // If clicking on already expanded category, close it
        return new Set();
      } else {
        // Close all and open only this one
        return new Set([categoryId]);
      }
    });
    
    // Reset subcategories expansion when switching categories
    if (!isCurrentlyExpanded) {
      setExpandedCourseSubcategories(new Set());
    }
    
    // Fetch subcategories if expanding and not already loaded
    if (!isCurrentlyExpanded && !categorySubcategories[categoryId]) {
      fetchSubcategoriesForCategory(categoryId);
    }
  };

  const toggleCourseSubcategory = (subcategoryId: number) => {
    setExpandedCourseSubcategories(prev => {
      if (prev.has(subcategoryId)) {
        // If clicking on already expanded subcategory, close it
        return new Set();
      } else {
        // Close all and open only this one
        return new Set([subcategoryId]);
      }
    });
  };

  // ---- Course Category CRUD ----
  const handleCreateCourseCategory = async () => {
    if (!courseCategoryForm.category_name.trim()) {
      setCourseCategoryError('Category name is required');
      return;
    }
    setCourseCategoryError('');
    setCourseCategorySuccess('');

    // Check for duplicate
    const duplicate = courseCategories.some(
      c => c.category_name.trim().toLowerCase() === courseCategoryForm.category_name.trim().toLowerCase()
    );
    if (duplicate) {
      setCourseCategoryError('Course category already exists');
      return;
    }

    try {
      const response = await fetch(config.COURSE_CATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ category_name: courseCategoryForm.category_name.trim() })
      });

      if (response.ok) {
        setCourseCategorySuccess('Course category created successfully');
        await fetchCourseData();
        setTimeout(() => {
          setShowCourseCategoryModal(false);
          setCourseCategoryForm({ category_name: '' });
          setCourseCategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCourseCategoryError(error.detail || 'Failed to create course category');
      }
    } catch (error) {
      console.error('Error creating course category:', error);
      setCourseCategoryError('Error creating course category');
    }
  };

  const handleUpdateCourseCategory = async () => {
    if (!editingCourseCategory) return;
    if (!courseCategoryForm.category_name.trim()) {
      setCourseCategoryError('Category name is required');
      return;
    }
    setCourseCategoryError('');
    setCourseCategorySuccess('');

    // Check for duplicate (excluding current)
    const duplicate = courseCategories.some(
      c => c.category_name.trim().toLowerCase() === courseCategoryForm.category_name.trim().toLowerCase() 
        && c.category_id !== editingCourseCategory.category_id
    );
    if (duplicate) {
      setCourseCategoryError('Course category already exists');
      return;
    }

    try {
      const response = await fetch(config.COURSE_CATEGORY_UPDATE(editingCourseCategory.category_id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ category_name: courseCategoryForm.category_name.trim() })
      });

      if (response.ok) {
        setCourseCategorySuccess('Course category updated successfully');
        await fetchCourseData();
        setTimeout(() => {
          setShowCourseCategoryModal(false);
          setEditingCourseCategory(null);
          setCourseCategoryForm({ category_name: '' });
          setCourseCategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCourseCategoryError(error.detail || 'Failed to update course category');
      }
    } catch (error) {
      console.error('Error updating course category:', error);
      setCourseCategoryError('Error updating course category');
    }
  };

  const handleDeleteCourseCategory = async (categoryId: number) => {
    // Check if category has subcategories
    const hasSubcategories = courseSubcategories.some(s => s.category_id === categoryId);
    if (hasSubcategories) {
      alert('Cannot delete category with existing subcategories. Please delete subcategories first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this course category?')) return;

    try {
      const response = await fetch(config.COURSE_CATEGORY_DELETE(categoryId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        setCourseCategories(courseCategories.filter(c => c.category_id !== categoryId));
        alert('Course category deleted successfully');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete course category');
      }
    } catch (error) {
      console.error('Error deleting course category:', error);
      alert('Error deleting course category');
    }
  };

  const openEditCourseCategory = (category: CourseCategory) => {
    setEditingCourseCategory(category);
    setCourseCategoryForm({ category_name: category.category_name });
    setCourseCategoryError('');
    setCourseCategorySuccess('');
    setShowCourseCategoryModal(true);
  };

  // ---- Course Subcategory CRUD ----
  const handleCreateCourseSubcategory = async () => {
    if (!courseSubcategoryForm.sub_category_name.trim()) {
      setCourseSubcategoryError('Subcategory name is required');
      return;
    }
    if (!courseSubcategoryForm.category_id) {
      setCourseSubcategoryError('Please select a category');
      return;
    }
    setCourseSubcategoryError('');
    setCourseSubcategorySuccess('');

    // Check for duplicate in the selected category's subcategories
    const categoryId = parseInt(courseSubcategoryForm.category_id);
    const existingSubs = categorySubcategories[categoryId] || [];
    const duplicate = existingSubs.some(
      s => s.sub_category_name.trim().toLowerCase() === courseSubcategoryForm.sub_category_name.trim().toLowerCase()
    );
    if (duplicate) {
      setCourseSubcategoryError('Course subcategory already exists in this category');
      return;
    }

    try {
      const response = await fetch(config.COURSE_SUBCATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          sub_category_name: courseSubcategoryForm.sub_category_name.trim(),
          category_id: parseInt(courseSubcategoryForm.category_id)
        })
      });

      if (response.ok) {
        setCourseSubcategorySuccess('Course subcategory created successfully');
        // Refresh subcategories for this category
        const categoryId = parseInt(courseSubcategoryForm.category_id);
        await fetchSubcategoriesForCategory(categoryId);
        setTimeout(() => {
          setShowCourseSubcategoryModal(false);
          setCourseSubcategoryForm({ sub_category_name: '', category_id: '' });
          setCourseSubcategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCourseSubcategoryError(error.detail || 'Failed to create course subcategory');
      }
    } catch (error) {
      console.error('Error creating course subcategory:', error);
      setCourseSubcategoryError('Error creating course subcategory');
    }
  };

  const handleUpdateCourseSubcategory = async () => {
    if (!editingCourseSubcategory) return;
    if (!courseSubcategoryForm.sub_category_name.trim()) {
      setCourseSubcategoryError('Subcategory name is required');
      return;
    }
    setCourseSubcategoryError('');
    setCourseSubcategorySuccess('');

    // Check for duplicate (excluding current) in the current category's subcategories
    const currentCatSubs = categorySubcategories[editingCourseSubcategory.category_id] || [];
    const duplicate = currentCatSubs.some(
      s => s.sub_category_name.trim().toLowerCase() === courseSubcategoryForm.sub_category_name.trim().toLowerCase()
        && s.sub_category_id !== editingCourseSubcategory.sub_category_id
    );
    if (duplicate) {
      setCourseSubcategoryError('Course subcategory already exists');
      return;
    }

    try {
      const response = await fetch(config.COURSE_SUBCATEGORY_UPDATE(editingCourseSubcategory.sub_category_id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          sub_category_name: courseSubcategoryForm.sub_category_name.trim()
        })
      });

      if (response.ok) {
        setCourseSubcategorySuccess('Course subcategory updated successfully');
        // Refresh subcategories for this category
        await fetchSubcategoriesForCategory(editingCourseSubcategory.category_id);
        setTimeout(() => {
          setShowCourseSubcategoryModal(false);
          setEditingCourseSubcategory(null);
          setCourseSubcategoryForm({ sub_category_name: '', category_id: '' });
          setCourseSubcategorySuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCourseSubcategoryError(error.detail || 'Failed to update course subcategory');
      }
    } catch (error) {
      console.error('Error updating course subcategory:', error);
      setCourseSubcategoryError('Error updating course subcategory');
    }
  };

  const handleDeleteCourseSubcategory = async (subcategoryId: number, categoryId: number) => {
    // Check if subcategory has courses
    const hasCourses = courses.some(c => c.course_subcategory === subcategoryId);
    if (hasCourses) {
      alert('Cannot delete subcategory with existing courses. Please delete courses first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this course subcategory?')) return;

    try {
      const response = await fetch(config.COURSE_SUBCATEGORY_DELETE(subcategoryId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        // Refresh subcategories for this category
        await fetchSubcategoriesForCategory(categoryId);
        alert('Course subcategory deleted successfully');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete course subcategory');
      }
    } catch (error) {
      console.error('Error deleting course subcategory:', error);
      alert('Error deleting course subcategory');
    }
  };

  const openEditCourseSubcategory = (subcategory: CourseSubcategory) => {
    setEditingCourseSubcategory(subcategory);
    setCourseSubcategoryForm({ 
      sub_category_name: subcategory.sub_category_name, 
      category_id: subcategory.category_id.toString() 
    });
    setCourseSubcategoryError('');
    setCourseSubcategorySuccess('');
    setShowCourseSubcategoryModal(true);
  };

  // ---- Course CRUD ----
  
  // Fetch all subcategories for course dropdown
  const fetchAllCourseSubcategories = async () => {
    setLoadingAllSubcategories(true);
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(config.COURSE_SUBCATEGORY_LIST, { headers });
      if (response.ok) {
        const result = await response.json();
        const subcategories = Array.isArray(result) ? result : (result.data || []);
        setAllCourseSubcategories(subcategories);
      }
    } catch (error) {
      console.error('Error fetching all subcategories:', error);
    } finally {
      setLoadingAllSubcategories(false);
    }
  };
  
  // Open course modal and fetch subcategories
  const openAddCourseModal = (preselectedSubcategoryId?: string) => {
    setShowCourseModal(true);
    setEditingCourse(null);
    setCourseForm({ 
      course_name: '', 
      course_link: '', 
      course_subcategory: preselectedSubcategoryId || '' 
    });
    setCourseError('');
    setCourseSuccess('');
    fetchAllCourseSubcategories();
  };
  
  // Course search functions
  const searchCoursesAPI = async (query: string) => {
    if (!query.trim()) {
      setCourseSearchResults([]);
      setShowCourseSearchResults(false);
      return;
    }

    setCourseSearchLoading(true);
    try {
      const response = await fetch(config.COURSES_SEARCH(query), {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result)) {
          setCourseSearchResults(result);
          setShowCourseSearchResults(true);
        } else if (result.status === 1 && result.data) {
          setCourseSearchResults(result.data);
          setShowCourseSearchResults(true);
        } else {
          setCourseSearchResults([]);
          setShowCourseSearchResults(true);
        }
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      setCourseSearchResults([]);
    } finally {
      setCourseSearchLoading(false);
    }
  };

  const handleCourseSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCourseSearchQuery(query);

    if (courseSearchTimeoutRef.current) {
      clearTimeout(courseSearchTimeoutRef.current);
    }

    if (query.trim()) {
      courseSearchTimeoutRef.current = setTimeout(() => {
        searchCoursesAPI(query);
      }, 500);
    } else {
      setCourseSearchResults([]);
      setShowCourseSearchResults(false);
    }
  };

  const clearCourseSearch = () => {
    setCourseSearchQuery('');
    setCourseSearchResults([]);
    setShowCourseSearchResults(false);
    if (courseSearchTimeoutRef.current) {
      clearTimeout(courseSearchTimeoutRef.current);
    }
  };

  // Get subcategory name for search results
  const getSubcategoryNameById = (subcategoryId: number) => {
    const sub = allCourseSubcategories.find(s => s.sub_category_id === subcategoryId);
    return sub?.sub_category_name || 'Unknown';
  };
  
  const getYoutubeThumbnail = (url: string) => {
    let match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/);
    if (match) return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
    match = url.match(/youtube\.com\/shorts\/([^&\n?#]+)/);
    if (match) return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
    return "";
  };

  const handleCreateCourse = async () => {
    if (!courseForm.course_name.trim()) {
      setCourseError('Course name is required');
      return;
    }
    if (!courseForm.course_link.trim()) {
      setCourseError('Course link is required');
      return;
    }
    if (!courseForm.course_subcategory) {
      setCourseError('Please select a subcategory');
      return;
    }
    setCourseError('');
    setCourseSuccess('');

    try {
      const response = await fetch(config.COURSES_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          course_name: courseForm.course_name.trim(),
          course_link: courseForm.course_link.trim(),
          course_subcategory: parseInt(courseForm.course_subcategory)
        })
      });

      if (response.ok) {
        setCourseSuccess('Course created successfully');
        await fetchCourseData();
        setTimeout(() => {
          setShowCourseModal(false);
          setCourseForm({ course_name: '', course_link: '', course_subcategory: '' });
          setCourseSuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCourseError(error.detail || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setCourseError('Error creating course');
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    if (!courseForm.course_name.trim()) {
      setCourseError('Course name is required');
      return;
    }
    if (!courseForm.course_link.trim()) {
      setCourseError('Course link is required');
      return;
    }
    setCourseError('');
    setCourseSuccess('');

    try {
      const response = await fetch(config.COURSES_UPDATE(editingCourse.course_id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          course_name: courseForm.course_name.trim(),
          course_link: courseForm.course_link.trim(),
          sub_category_id: parseInt(courseForm.course_subcategory)
        })
      });

      if (response.ok) {
        setCourseSuccess('Course updated successfully');
        await fetchCourseData();
        setTimeout(() => {
          setShowCourseModal(false);
          setEditingCourse(null);
          setCourseForm({ course_name: '', course_link: '', course_subcategory: '' });
          setCourseSuccess('');
        }, 1500);
      } else {
        const error = await response.json();
        setCourseError(error.detail || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setCourseError('Error updating course');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(config.COURSES_DELETE(courseId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.course_id !== courseId));
        alert('Course deleted successfully');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course');
    }
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      course_name: course.course_name,
      course_link: course.course_link,
      course_subcategory: course.course_subcategory.toString()
    });
    setCourseError('');
    setCourseSuccess('');
    setShowCourseModal(true);
    fetchAllCourseSubcategories();
  };

  // Helper functions to get counts
  const getSubcategoriesForCategory = (categoryId: number) => {
    return categorySubcategories[categoryId] || [];
  };

  const getCoursesForSubcategory = (subcategoryId: number) => {
    return courses.filter(c => c.course_subcategory === subcategoryId);
  };

  const getCategoryName = (categoryId: number) => {
    return courseCategories.find(c => c.category_id === categoryId)?.category_name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId: number) => {
    return courseSubcategories.find(s => s.sub_category_id === subcategoryId)?.sub_category_name || 'Unknown';
  };

  // Reset product form helper
  const resetProductForm = () => {
    setProductForm({
      product_name: '',
      product_price: '',
      product_description: '',
      sub_category_id: '',
      file: null,
      // Reset shipping fields
      weight: '',
      length: '',
      width: '',
      height: '',
      origin_location: ''
    });
  };

  // Ensure filteredProducts is always an array
  const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate('/admin/add-product')}>
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
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Products</h2>
                <span className="text-sm text-gray-500">
                  Showing {products.length} of {totalItems} products
                </span>
              </div>
              <Button onClick={() => navigate('/admin/add-product')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Product Search Bar */}
            <div className="relative max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={productSearchQuery}
                  onChange={handleProductSearchChange}
                  className="pl-10 pr-10"
                />
                {productSearchQuery && (
                  <button
                    onClick={clearProductSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showProductSearchResults && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                  {productSearchLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Searching...</p>
                    </div>
                  ) : productSearchResults.length > 0 ? (
                    <div className="py-2">
                      {productSearchResults.map((product) => (
                        <div
                          key={product.product_id}
                          onClick={() => handleProductSearchResultClick(product.product_id)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{product.product_name}</h3>
                            {product.product_description && (
                              <p className="text-sm text-gray-600 truncate">{product.product_description}</p>
                            )}
                            {product.product_price && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-pink-600">
                                  ₹{product.product_price.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-600">
                      <Package className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No products found for "{productSearchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                      Price: 
                      {product.product_full_price && product.product_full_price > product.product_price && (
                        <>
                          <span className="line-through text-gray-400 ml-1">
                            ₹{product.product_full_price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </span>
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded ml-2">
                            {Math.round(((product.product_full_price - product.product_price) / product.product_full_price) * 100)}% OFF
                          </span>
                        </>
                      )}
                      <span className={product.product_full_price && product.product_full_price > product.product_price ? "font-semibold text-pink-600 ml-2" : "ml-1"}>
                        ₹{product.product_price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Description: {product.product_description}
                    </div>
                    {product.stock !== undefined && (
                      <div className={`text-sm font-semibold mb-2 ${
                        product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        Stock: {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : product.stock}
                      </div>
                    )}
                    <div className="flex justify-between">
                      <Button
                        onClick={() => navigate(`/admin/edit-product/${product.product_id}`)}
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
          
          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchDashboardData(newPage, pageSize);
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
                        fetchDashboardData(pageNum, pageSize);
                      }}
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
                  fetchDashboardData(newPage, pageSize);
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
                <Card key={category.category_id} className="min-w-0 group relative flex flex-col">
                  <CardHeader>
                    <CardTitle className="truncate" title={category.category_name}>{category.category_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleOpenEditCategory(category)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.category_id)}
                        variant="destructive"
                        size="sm"
                        className="w-full"
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
            <Button onClick={() => {
              setEditingSubcategory(null);
              setSubcategoryForm({ sub_category_name: '', category_id: '' });
              setSelectedSubcategoryImage(null);
              setSubcategoryImagePreview(null);
              setRemoveExistingSubcategoryImage(false);
              setSubcategoryNameError('');
              setSubcategorySuccess('');
              setShowSubcategoryModal(true);
            }} className="bg-pink-500 hover:bg-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No subcategories found</h3>
              <p className="text-gray-500">Create your first subcategory to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {subcategories.map(subcategory => (
                <div 
                  key={subcategory.sub_category_id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Subcategory Image */}
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100">
                    {subcategory.sub_category_image ? (
                      <img 
                        src={subcategory.sub_category_image} 
                        alt={subcategory.sub_category_name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-white">
                            {subcategory.sub_category_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                      {subcategory.sub_category_name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {categories.find(c => c.category_id === subcategory.category_id)?.category_name || 'Unknown Category'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenEditSubcategory(subcategory)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteSubcategory(subcategory.sub_category_id)}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
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
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="overflow-x-hidden">
          <div className="space-y-4 sm:space-y-6">
            {/* Header with action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                <h2 className="text-lg sm:text-xl font-semibold">Course Management</h2>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setShowCourseCategoryModal(true);
                    setEditingCourseCategory(null);
                    setCourseCategoryForm({ category_name: '' });
                    setCourseCategoryError('');
                    setCourseCategorySuccess('');
                  }}
                  variant="outline"
                  size="sm"
                  className="border-pink-500 text-pink-600 hover:bg-pink-50 text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Category
                </Button>
                <Button
                  onClick={() => {
                    setShowCourseSubcategoryModal(true);
                    setEditingCourseSubcategory(null);
                    setCourseSubcategoryForm({ sub_category_name: '', category_id: '' });
                    setCourseSubcategoryError('');
                    setCourseSubcategorySuccess('');
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                  disabled={courseCategories.length === 0}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Subcategory
                </Button>
                <Button
                  onClick={() => openAddCourseModal()}
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600 text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Course
                </Button>
                <Button
                  onClick={fetchCourseData}
                  variant="outline"
                  size="sm"
                  disabled={coursesLoading}
                  className="text-xs sm:text-sm"
                >
                  {coursesLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
            </div>

            {/* Course Search Bar */}
            <div className="relative max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearchQuery}
                  onChange={handleCourseSearchChange}
                  onFocus={() => {
                    if (allCourseSubcategories.length === 0) {
                      fetchAllCourseSubcategories();
                    }
                  }}
                  className="pl-10 pr-10"
                />
                {courseSearchQuery && (
                  <button
                    onClick={clearCourseSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showCourseSearchResults && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                  {courseSearchLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Searching...</p>
                    </div>
                  ) : courseSearchResults.length > 0 ? (
                    <div className="py-2">
                      {courseSearchResults.map((course) => (
                        <div
                          key={course.course_id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            openEditCourse(course);
                            clearCourseSearch();
                          }}
                        >
                          {course.course_link && (
                            <img
                              src={getYoutubeThumbnail(course.course_link)}
                              alt={course.course_name}
                              className="w-16 h-12 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{course.course_name}</h3>
                            <p className="text-xs text-gray-500">
                              Subcategory: {getSubcategoryNameById(course.course_subcategory)}
                            </p>
                          </div>
                          <a
                            href={course.course_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-600">
                      <Video className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No courses found for "{courseSearchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:pt-4">
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-pink-100 rounded-lg">
                      <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-500">Categories</p>
                      <p className="text-lg sm:text-2xl font-bold">{courseCategories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:pt-4">
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-500">Subcategories</p>
                      <p className="text-lg sm:text-2xl font-bold">{courseSubcategories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:pt-4">
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-500">Courses</p>
                      <p className="text-lg sm:text-2xl font-bold">{courses.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loading state */}
            {coursesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              </div>
            ) : courseCategories.length === 0 ? (
              /* Empty state */
              <Card className="p-12 text-center">
                <GraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Course Categories</h3>
                <p className="text-gray-500 mb-4">Start by creating a course category to organize your courses.</p>
                <Button
                  onClick={() => {
                    setShowCourseCategoryModal(true);
                    setEditingCourseCategory(null);
                    setCourseCategoryForm({ category_name: '' });
                  }}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Category
                </Button>
              </Card>
            ) : (
              /* Hierarchical course display */
              <div className="space-y-3 sm:space-y-4">
                {courseCategories.map(category => {
                  const subcategoriesForCategory = getSubcategoriesForCategory(category.category_id);
                  const isExpanded = expandedCourseCategories.has(category.category_id);

                  return (
                    <Card key={category.category_id} className="overflow-hidden">
                      {/* Category Header */}
                      <div 
                        className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-pink-100 cursor-pointer hover:from-pink-100 hover:to-pink-150 transition-colors"
                        onClick={() => toggleCourseCategory(category.category_id)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 shrink-0" />
                          )}
                          <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 shrink-0 hidden sm:block" />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-pink-800 text-sm sm:text-base truncate">{category.category_name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditCourseCategory(category)}
                            className="text-pink-600 hover:text-pink-800 hover:bg-pink-200 h-8 w-8 p-0"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourseCategory(category.category_id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {isExpanded && (
                        <div className="pl-3 sm:pl-6 border-l-4 border-pink-200">
                          {loadingCategorySubcategories.has(category.category_id) ? (
                            <div className="p-4 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                              <span className="ml-2 text-sm text-gray-500">Loading subcategories...</span>
                            </div>
                          ) : subcategoriesForCategory.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <p className="text-sm">No subcategories yet.</p>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                  setShowCourseSubcategoryModal(true);
                                  setCourseSubcategoryForm({ sub_category_name: '', category_id: category.category_id.toString() });
                                }}
                                className="text-blue-600"
                              >
                                Add first subcategory
                              </Button>
                            </div>
                          ) : (
                            subcategoriesForCategory.map(subcategory => {
                              const coursesForSubcategory = getCoursesForSubcategory(subcategory.sub_category_id);
                              const isSubExpanded = expandedCourseSubcategories.has(subcategory.sub_category_id);

                              return (
                                <div key={subcategory.sub_category_id} className="border-b border-gray-100 last:border-b-0">
                                  {/* Subcategory Header */}
                                  <div 
                                    className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => toggleCourseSubcategory(subcategory.sub_category_id)}
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                      {isSubExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                                      )}
                                      <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0 hidden sm:block" />
                                      <div className="min-w-0">
                                        <h4 className="font-medium text-blue-800 text-sm truncate">{subcategory.sub_category_name}</h4>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditCourseSubcategory(subcategory)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 h-7 w-7 p-0"
                                      >
                                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCourseSubcategory(subcategory.sub_category_id, subcategory.category_id)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-100 h-7 w-7 p-0"
                                      >
                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Courses */}
                                  {isSubExpanded && (
                                    <div className="pl-4 sm:pl-8 py-2 bg-gray-50">
                                      {coursesForSubcategory.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                          <p className="text-sm">No courses yet.</p>
                                          <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => openAddCourseModal(subcategory.sub_category_id.toString())}
                                            className="text-green-600"
                                          >
                                            Add first course
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-2">
                                          {coursesForSubcategory.map(course => (
                                            <Card key={course.course_id} className="overflow-hidden group">
                                              {course.course_link && (
                                                <a
                                                  href={course.course_link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block relative aspect-video bg-gray-100"
                                                >
                                                  <img
                                                    src={getYoutubeThumbnail(course.course_link)}
                                                    alt={course.course_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                      e.currentTarget.src = '/placeholder.svg';
                                                    }}
                                                  />
                                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                                      <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-white border-b-6 border-b-transparent ml-1"></div>
                                                    </div>
                                                  </div>
                                                </a>
                                              )}
                                              <CardContent className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                  <h5 className="font-medium text-sm line-clamp-2 flex-1">{course.course_name}</h5>
                                                  <div className="flex gap-1 shrink-0">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => openEditCourse(course)}
                                                      className="h-7 w-7 p-0"
                                                    >
                                                      <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => handleDeleteCourse(course.course_id)}
                                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                    <a
                                                      href={course.course_link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="h-7 w-7 p-0 inline-flex items-center justify-center hover:bg-gray-100 rounded"
                                                    >
                                                      <ExternalLink className="w-3 h-3 text-gray-600" />
                                                    </a>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          ))}
                                          {/* Add Course Card */}
                                          <Card 
                                            className="overflow-hidden border-2 border-dashed border-green-300 hover:border-green-500 cursor-pointer transition-colors flex items-center justify-center min-h-[150px]"
                                            onClick={() => openAddCourseModal(subcategory.sub_category_id.toString())}
                                          >
                                            <CardContent className="p-4 text-center">
                                              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                                                <Plus className="w-6 h-6 text-green-600" />
                                              </div>
                                              <p className="text-sm font-medium text-green-600">Add Course</p>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="product_price">Selling Price (Optional)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={productForm.product_price}
                  onChange={handlePriceChange}
                  placeholder="Enter price or leave empty"
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
                  <SelectTrigger className="w-full z-[110] relative">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto z-[9999] relative">
                    {subcategories.map((subcategory) => (
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
                {editingProduct && (
                  <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.sub_category_id}</span></div>
                )}
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
                    {editingProduct && (
                      <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.weight || 'Not set'}</span></div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="origin_location">Origin Location</Label>
                    <Input
                      id="origin_location"
                      value={productForm.origin_location}
                      onChange={(e) => setProductForm({...productForm, origin_location: e.target.value})}
                      placeholder="e.g., New York, USA"
                    />
                    {editingProduct && (
                      <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.origin_location || 'Not set'}</span></div>
                    )}
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
                    {editingProduct && (
                      <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.length || 'Not set'}</span></div>
                    )}
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
                    {editingProduct && (
                      <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.width || 'Not set'}</span></div>
                    )}
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
                    {editingProduct && (
                      <div className="text-xs text-gray-500 mt-1">Previous: <span className="font-mono">{originalProduct?.height || 'Not set'}</span></div>
                    )}
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
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  className="flex-1"
                  disabled={
                    !productForm.product_name ||
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
              <Button variant="ghost" onClick={() => {
                setShowSubcategoryModal(false);
                setSelectedSubcategoryImage(null);
                setSubcategoryImagePreview(null);
                setRemoveExistingSubcategoryImage(false);
                setEditingSubcategory(null);
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-4">
              <Label htmlFor="sub_category_name">Subcategory Name <span className="text-red-500">*</span></Label>
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
            </div>
            <div className="mb-4">
              <Label htmlFor="category_id">Category <span className="text-red-500">*</span></Label>
              <Select
                value={subcategoryForm.category_id}
                onValueChange={(value) => setSubcategoryForm({...subcategoryForm, category_id: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto z-[9999]">
                  {categories.map(category => (
                    <SelectItem 
                      key={category.category_id} 
                      value={category.category_id.toString()}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showValidation && !subcategoryForm.category_id && (
                <div className="text-red-500 text-sm mt-1">Category is required</div>
              )}
            </div>
            
            {/* Subcategory Image */}
            <div className="mb-4">
              <Label>Subcategory Image (Optional)</Label>
              <p className="text-xs text-gray-500 mb-2">
                Recommended: 400×300 pixels • Max size: 500 KB • Formats: JPEG, PNG, GIF, WebP
              </p>
              
              {/* Image Preview */}
              {subcategoryImagePreview ? (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={subcategoryImagePreview} 
                    alt="Subcategory preview" 
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveSubcategoryImage}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Package className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-pink-600">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">400×300 px recommended</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleSubcategoryImageSelect}
                  />
                </label>
              )}
              
              {/* Upload new image when there's already a preview */}
              {subcategoryImagePreview && (
                <label className="mt-2 inline-flex items-center gap-2 text-sm text-pink-600 cursor-pointer hover:text-pink-700">
                  <Package className="w-4 h-4" />
                  <span>Upload different image</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleSubcategoryImageSelect}
                  />
                </label>
              )}
            </div>
            
            {subcategoryNameError && (
              <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{subcategoryNameError}</div>
            )}
            {subcategorySuccess && (
              <div className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{subcategorySuccess}</div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubcategoryModal(false);
                  setSelectedSubcategoryImage(null);
                  setSubcategoryImagePreview(null);
                  setRemoveExistingSubcategoryImage(false);
                  setEditingSubcategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingSubcategory ? handleUpdateSubcategory : handleCreateSubcategory}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Course Category Modal */}
      {showCourseCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                {editingCourseCategory ? 'Edit Course Category' : 'Add Course Category'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowCourseCategoryModal(false);
                  setEditingCourseCategory(null);
                  setCourseCategoryForm({ category_name: '' });
                  setCourseCategoryError('');
                  setCourseCategorySuccess('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-4">
              <Label htmlFor="course_category_name">Category Name <span className="text-red-500">*</span></Label>
              <Input
                id="course_category_name"
                value={courseCategoryForm.category_name}
                onChange={(e) => {
                  setCourseCategoryForm({ ...courseCategoryForm, category_name: e.target.value });
                  setCourseCategoryError('');
                  setCourseCategorySuccess('');
                }}
                placeholder="e.g., Programming, Marketing"
              />
              {courseCategoryError && (
                <div className="text-red-500 text-sm mt-1">{courseCategoryError}</div>
              )}
              {courseCategorySuccess && (
                <div className="text-green-600 text-sm mt-1">{courseCategorySuccess}</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={editingCourseCategory ? handleUpdateCourseCategory : handleCreateCourseCategory}
                disabled={!courseCategoryForm.category_name.trim()}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {editingCourseCategory ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCourseCategoryModal(false);
                  setEditingCourseCategory(null);
                  setCourseCategoryForm({ category_name: '' });
                  setCourseCategoryError('');
                  setCourseCategorySuccess('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Course Subcategory Modal */}
      {showCourseSubcategoryModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCourseSubcategoryModal(false);
              setEditingCourseSubcategory(null);
              setCourseSubcategoryForm({ sub_category_name: '', category_id: '' });
              setCourseSubcategoryError('');
              setCourseSubcategorySuccess('');
            }
          }}
        >
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                {editingCourseSubcategory ? 'Edit Course Subcategory' : 'Add Course Subcategory'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowCourseSubcategoryModal(false);
                  setEditingCourseSubcategory(null);
                  setCourseSubcategoryForm({ sub_category_name: '', category_id: '' });
                  setCourseSubcategoryError('');
                  setCourseSubcategorySuccess('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {courseCategories.length === 0 ? (
              <div className="text-center py-6">
                <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">Please create a course category first.</p>
                <Button
                  onClick={() => {
                    setShowCourseSubcategoryModal(false);
                    setShowCourseCategoryModal(true);
                  }}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course_subcategory_name">Subcategory Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="course_subcategory_name"
                    value={courseSubcategoryForm.sub_category_name}
                    onChange={(e) => {
                      setCourseSubcategoryForm({ ...courseSubcategoryForm, sub_category_name: e.target.value });
                      setCourseSubcategoryError('');
                      setCourseSubcategorySuccess('');
                    }}
                    placeholder="e.g., Python, JavaScript"
                  />
                </div>
                <div>
                  <Label htmlFor="course_subcategory_category">Category <span className="text-red-500">*</span></Label>
                  <Select
                    value={courseSubcategoryForm.category_id}
                    onValueChange={(value) => setCourseSubcategoryForm({ ...courseSubcategoryForm, category_id: value })}
                    disabled={!!editingCourseSubcategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto z-[10000]">
                      {courseCategories.map(category => (
                        <SelectItem 
                          key={category.category_id} 
                          value={category.category_id.toString()}
                        >
                          {category.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingCourseSubcategory && (
                    <p className="text-xs text-gray-500 mt-1">Category cannot be changed. Delete and create a new subcategory if needed.</p>
                  )}
                </div>
                {courseSubcategoryError && (
                  <div className="text-red-500 text-sm">{courseSubcategoryError}</div>
                )}
                {courseSubcategorySuccess && (
                  <div className="text-green-600 text-sm">{courseSubcategorySuccess}</div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCourseSubcategoryModal(false);
                      setEditingCourseSubcategory(null);
                      setCourseSubcategoryForm({ sub_category_name: '', category_id: '' });
                      setCourseSubcategoryError('');
                      setCourseSubcategorySuccess('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingCourseSubcategory ? handleUpdateCourseSubcategory : handleCreateCourseSubcategory}
                    disabled={!courseSubcategoryForm.sub_category_name.trim() || !courseSubcategoryForm.category_id}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {editingCourseSubcategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowCourseModal(false);
                  setEditingCourse(null);
                  setCourseForm({ course_name: '', course_link: '', course_subcategory: '' });
                  setCourseError('');
                  setCourseSuccess('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course_name">Course Name <span className="text-red-500">*</span></Label>
                <Input
                  id="course_name"
                  value={courseForm.course_name}
                  onChange={(e) => {
                    setCourseForm({ ...courseForm, course_name: e.target.value });
                    setCourseError('');
                    setCourseSuccess('');
                  }}
                  placeholder="e.g., Python for Beginners"
                />
              </div>
              <div>
                <Label htmlFor="course_link">Course Link (YouTube) <span className="text-red-500">*</span></Label>
                <Input
                  id="course_link"
                  value={courseForm.course_link}
                  onChange={(e) => {
                    setCourseForm({ ...courseForm, course_link: e.target.value });
                    setCourseError('');
                    setCourseSuccess('');
                  }}
                  placeholder="https://youtube.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">Supports regular YouTube videos and Shorts</p>
              </div>
              <div>
                <Label htmlFor="course_subcategory">Subcategory <span className="text-red-500">*</span></Label>
                <Select
                  value={courseForm.course_subcategory}
                  onValueChange={(value) => setCourseForm({ ...courseForm, course_subcategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingAllSubcategories ? "Loading..." : "Select a subcategory"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto z-[10000]">
                    {loadingAllSubcategories ? (
                      <div className="p-2 text-center text-gray-500 text-sm">Loading subcategories...</div>
                    ) : allCourseSubcategories.length === 0 ? (
                      <div className="p-2 text-center text-gray-500 text-sm">No subcategories available</div>
                    ) : (
                      courseCategories.map(category => {
                        const subs = allCourseSubcategories.filter(s => s.category_id === category.category_id);
                        if (subs.length === 0) return null;
                        return (
                          <div key={category.category_id}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 sticky top-0">
                              {category.category_name}
                            </div>
                            {subs.map(subcategory => (
                              <SelectItem 
                                key={subcategory.sub_category_id} 
                                value={subcategory.sub_category_id.toString()}
                              >
                                {subcategory.sub_category_name}
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Preview */}
              {courseForm.course_link && getYoutubeThumbnail(courseForm.course_link) && (
                <div>
                  <Label>Preview</Label>
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={getYoutubeThumbnail(courseForm.course_link)}
                      alt="Video preview"
                      className="w-full aspect-video object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              {courseError && (
                <div className="text-red-500 text-sm">{courseError}</div>
              )}
              {courseSuccess && (
                <div className="text-green-600 text-sm">{courseSuccess}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                disabled={!courseForm.course_name.trim() || !courseForm.course_link.trim() || !courseForm.course_subcategory}
                className="bg-green-500 hover:bg-green-600"
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCourseModal(false);
                  setEditingCourse(null);
                  setCourseForm({ course_name: '', course_link: '', course_subcategory: '' });
                  setCourseError('');
                  setCourseSuccess('');
                }}
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
