import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, X, Trash2, FolderOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import config from '../config';
import { useAuth } from '@/contexts/AuthContext';

interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  sub_category_image?: string | null;
  category_id: number;
}

interface Category {
  category_id: number;
  category_name: string;
}

const SubcategoriesPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  
  // Modal states
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<SubCategory | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({ sub_category_name: '', category_id: '' });
  const [subcategoryError, setSubcategoryError] = useState('');
  const [subcategorySuccess, setSubcategorySuccess] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Image states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
      fetchCategories();
      // Auto-scroll on mobile to skip blank header space and show content properly
      if (window.innerWidth < 768) {
        setTimeout(() => {
          window.scrollTo({ top: 220, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [categoryId]);

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
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (id: string) => {
    try {
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

  const openEditSubcategoryModal = (subcategory: SubCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubcategory(subcategory);
    setSubcategoryForm({ 
      sub_category_name: subcategory.sub_category_name, 
      category_id: subcategory.category_id.toString() 
    });
    setSubcategoryError('');
    setSubcategorySuccess('');
    setSelectedImage(null);
    setImagePreview(subcategory.sub_category_image || null);
    setRemoveExistingImage(false);
    setShowSubcategoryModal(true);
  };

  const openAddSubcategoryModal = () => {
    setEditingSubcategory(null);
    setSubcategoryForm({ sub_category_name: '', category_id: categoryId || '' });
    setSubcategoryError('');
    setSubcategorySuccess('');
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setShowSubcategoryModal(true);
  };

  const closeModal = () => {
    setShowSubcategoryModal(false);
    setEditingSubcategory(null);
    setSubcategoryForm({ sub_category_name: '', category_id: '' });
    setSubcategoryError('');
    setSubcategorySuccess('');
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
      setSubcategoryError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 512000) {
      setSubcategoryError(`Image is too large. Maximum size is 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB`);
      return;
    }

    setSubcategoryError('');
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
    if (editingSubcategory?.sub_category_image) {
      setRemoveExistingImage(true);
      setImagePreview(null);
    } else {
      setImagePreview(null);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryForm.sub_category_name.trim()) {
      setSubcategoryError('Subcategory name is required');
      return;
    }
    if (!subcategoryForm.category_id) {
      setSubcategoryError('Category is required');
      return;
    }
    setSubcategoryError('');
    setSubcategorySuccess('');

    // Check for duplicate
    const duplicate = subcategories.some(
      s => s.sub_category_name.trim().toLowerCase() === subcategoryForm.sub_category_name.trim().toLowerCase()
    );
    if (duplicate) {
      setSubcategoryError('Subcategory already exists');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('sub_category_name', subcategoryForm.sub_category_name.trim());
      formData.append('category_id', subcategoryForm.category_id);
      
      if (selectedImage) {
        formData.append('file', selectedImage);
      }

      const response = await fetch(config.CATEGORY_SUBCATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        setSubcategorySuccess('Subcategory created successfully');
        if (categoryId) {
          await fetchSubcategories(categoryId);
        }
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        const error = await response.json();
        setSubcategoryError(error.detail || 'Failed to create subcategory');
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      setSubcategoryError('Error creating subcategory');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return;
    if (!subcategoryForm.sub_category_name.trim()) {
      setSubcategoryError('Subcategory name is required');
      return;
    }
    setSubcategoryError('');
    setSubcategorySuccess('');

    // Check if there are any changes first
    const nameChanged = subcategoryForm.sub_category_name.trim() !== editingSubcategory.sub_category_name;
    const categoryChanged = subcategoryForm.category_id !== editingSubcategory.category_id.toString();
    const imageChanged = selectedImage !== null || removeExistingImage;
    
    if (!nameChanged && !categoryChanged && !imageChanged) {
      setSubcategoryError('No changes detected');
      return;
    }

    // Only check for duplicate if name is being changed
    if (nameChanged) {
      const duplicate = subcategories.some(
        s => s.sub_category_name.trim().toLowerCase() === subcategoryForm.sub_category_name.trim().toLowerCase()
          && s.sub_category_id !== editingSubcategory.sub_category_id
      );
      if (duplicate) {
        setSubcategoryError('Subcategory already exists');
        return;
      }
    }

    setSaving(true);
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
      if (selectedImage) {
        formData.append('file', selectedImage);
      } else if (removeExistingImage) {
        formData.append('remove_image', 'true');
      }

      const response = await fetch(config.CATEGORY_SUBCATEGORY_UPDATE(editingSubcategory.sub_category_id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (response.ok) {
        setSubcategorySuccess('Subcategory updated successfully');
        if (categoryId) {
          await fetchSubcategories(categoryId);
        }
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        const error = await response.json();
        setSubcategoryError(error.detail || 'Failed to update subcategory');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      setSubcategoryError('Error updating subcategory');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = isAdmin() || isSuperAdmin();
  const currentCategory = categories.find(c => c.category_id.toString() === categoryId);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        {canEdit && (
          <Button
            onClick={openAddSubcategoryModal}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subcategory
          </Button>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-2 text-center text-pink-700 drop-shadow">
        {currentCategory?.category_name || 'Subcategories'}
      </h1>
      <p className="text-center text-gray-500 mb-8">Browse subcategories</p>

      {subcategories.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Subcategories</h3>
          <p className="text-gray-500">Subcategories will appear here when added.</p>
          {canEdit && (
            <Button
              onClick={openAddSubcategoryModal}
              className="mt-4 bg-pink-500 hover:bg-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Subcategory
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subcategories.map((subcat) => (
            <div
              key={subcat.sub_category_id}
              className="relative group bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-pink-100"
              onClick={() => navigate(`/products/subcategory/${subcat.sub_category_id}`)}
            >
              {/* Subcategory Image */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100">
                {subcat.sub_category_image ? (
                  <img 
                    src={subcat.sub_category_image} 
                    alt={subcat.sub_category_name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold text-white">
                        {subcat.sub_category_name.charAt(0).toUpperCase()}
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
                    onClick={(e) => openEditSubcategoryModal(subcat, e)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              
              {/* Subcategory Name */}
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                  {subcat.sub_category_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Click to explore</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
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
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Subcategory Name */}
              <div>
                <Label htmlFor="sub_category_name">Subcategory Name <span className="text-red-500">*</span></Label>
                <Input
                  id="sub_category_name"
                  value={subcategoryForm.sub_category_name}
                  onChange={(e) => {
                    setSubcategoryForm({ ...subcategoryForm, sub_category_name: e.target.value });
                    setSubcategoryError('');
                    setSubcategorySuccess('');
                  }}
                  placeholder="Enter subcategory name"
                  className="mt-1"
                />
              </div>

              {/* Subcategory Image */}
              <div>
                <Label>Subcategory Image (Optional)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Recommended: 400×300 pixels • Max size: 500 KB • Formats: JPEG, PNG, GIF, WebP
                </p>
                
                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={imagePreview} 
                      alt="Subcategory preview" 
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
                      <Layers className="w-8 h-8 text-gray-400 mb-2" />
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
                    <Layers className="w-4 h-4" />
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

              {subcategoryError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{subcategoryError}</div>
              )}
              {subcategorySuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{subcategorySuccess}</div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  onClick={editingSubcategory ? handleUpdateSubcategory : handleCreateSubcategory}
                  disabled={!subcategoryForm.sub_category_name.trim() || saving}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingSubcategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'
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

export default SubcategoriesPage;
