import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, X, FolderOpen, Upload, Trash2, ImageIcon } from 'lucide-react';
import config from '../config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  category_id: number;
  category_name: string;
  category_image?: string;
}

const BrowseCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ category_name: '' });
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Image states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
    // Auto-scroll on mobile to skip blank header space and show content properly
    if (window.innerWidth < 768) {
      setTimeout(() => {
        window.scrollTo({ top: 220, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(config.FETCH_CATEGORY);
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

  const openEditCategoryModal = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
    setCategoryForm({ category_name: category.category_name });
    setCategoryError('');
    setCategorySuccess('');
    setSelectedImage(null);
    setImagePreview(category.category_image || null);
    setRemoveExistingImage(false);
    setShowCategoryModal(true);
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ category_name: '' });
    setCategoryError('');
    setCategorySuccess('');
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setShowCategoryModal(true);
  };

  const closeModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ category_name: '' });
    setCategoryError('');
    setCategorySuccess('');
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setCategoryError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 512000) {
      setCategoryError(`Image is too large. Maximum size is 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB`);
      return;
    }

    setCategoryError('');
    setSelectedImage(file);
    setRemoveExistingImage(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (editingCategory?.category_image) {
      setRemoveExistingImage(true);
      setImagePreview(null);
    } else {
      setImagePreview(null);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.category_name.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    setCategoryError('');
    setCategorySuccess('');

    // Check for duplicate
    const duplicate = categories.some(
      c => c.category_name.trim().toLowerCase() === categoryForm.category_name.trim().toLowerCase()
    );
    if (duplicate) {
      setCategoryError('Category already exists');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('category_name', categoryForm.category_name.trim());
      
      if (selectedImage) {
        formData.append('file', selectedImage);
      }

      const response = await fetch(config.CATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        setCategorySuccess('Category created successfully');
        await fetchCategories();
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        const error = await response.json();
        setCategoryError(error.detail || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setCategoryError('Error creating category');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!categoryForm.category_name.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    setCategoryError('');
    setCategorySuccess('');

    // Check if there are any changes first
    const nameChanged = categoryForm.category_name.trim() !== editingCategory.category_name;
    const imageChanged = selectedImage !== null || removeExistingImage;
    
    if (!nameChanged && !imageChanged) {
      setCategoryError('No changes detected');
      return;
    }

    // Only check for duplicate if name is being changed
    if (nameChanged) {
      const duplicate = categories.some(
        c => c.category_name.trim().toLowerCase() === categoryForm.category_name.trim().toLowerCase()
          && c.category_id !== editingCategory.category_id
      );
      if (duplicate) {
        setCategoryError('Category already exists');
        return;
      }
    }

    setSaving(true);
    try {
      const formData = new FormData();
      
      // Only append name if changed
      if (nameChanged) {
        formData.append('category_name', categoryForm.category_name.trim());
      }
      
      // Only append image if new image selected or removing existing
      if (selectedImage) {
        formData.append('file', selectedImage);
      } else if (removeExistingImage) {
        // Send empty string or flag to remove image
        formData.append('remove_image', 'true');
      }

      const response = await fetch(config.CATEGORY_UPDATE(editingCategory.category_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        setCategorySuccess('Category updated successfully');
        await fetchCategories();
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        const error = await response.json();
        setCategoryError(error.detail || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setCategoryError('Error updating category');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = isAdmin() || isSuperAdmin();

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-center text-pink-700 drop-shadow">Browse Categories</h1>
        {canEdit && (
          <Button
            onClick={openAddCategoryModal}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.category_id}
            className="relative group bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-pink-100"
            onClick={() => navigate(`/categories/${category.category_id}`)}
          >
            {/* Category Image */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100">
            {category.category_image ? (
                <img 
                  src={category.category_image} 
                  alt={category.category_name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-white">
                      {category.category_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
              </div>
            )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Edit Button (Admin only) */}
              {canEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white shadow-md"
                  onClick={(e) => openEditCategoryModal(category, e)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {/* Category Name */}
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                {category.category_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Click to explore</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Categories</h3>
          <p className="text-gray-500">Categories will appear here when added.</p>
          {canEdit && (
            <Button
              onClick={openAddCategoryModal}
              className="mt-4 bg-pink-500 hover:bg-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Category
            </Button>
          )}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div 
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <Label htmlFor="category_name">Category Name <span className="text-red-500">*</span></Label>
                <Input
                  id="category_name"
                  value={categoryForm.category_name}
                  onChange={(e) => {
                    setCategoryForm({ ...categoryForm, category_name: e.target.value });
                    setCategoryError('');
                    setCategorySuccess('');
                  }}
                  placeholder="Enter category name"
                  className="mt-1"
                />
              </div>

              {/* Category Image */}
              <div>
                <Label>Category Image (Optional)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Recommended: 400×300 pixels • Max size: 500 KB • Formats: JPEG, PNG, GIF, WebP
                </p>
                
                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={imagePreview} 
                      alt="Category preview" 
                      className="w-full h-40 object-cover"
                      loading="eager"
                      decoding="async"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-pink-600">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">400×300 px recommended</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
                
                {/* Upload new image when there's already a preview */}
                {imagePreview && (
                  <label className="mt-2 inline-flex items-center gap-2 text-sm text-pink-600 cursor-pointer hover:text-pink-700">
                    <Upload className="w-4 h-4" />
                    <span>Upload different image</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>

              {categoryError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{categoryError}</div>
              )}
              {categorySuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{categorySuccess}</div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={!categoryForm.category_name.trim() || saving}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingCategory ? 'Update Category' : 'Create Category'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseCategories;
