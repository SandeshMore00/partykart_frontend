import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import config from '../config';
import { Category, SubCategory, Product, ProductImage } from '@shared/api';

interface EditProductFormData {
  product_name: string;
  product_price: string;
  product_description: string;
  sub_category_id: string;
  files: File[];
}

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Product data
  const [product, setProduct] = useState<Product | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<EditProductFormData>({
    product_name: '',
    product_price: '',
    product_description: '',
    sub_category_id: '',
    files: []
  });
  
  // Subcategories only
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);
  
  // Image previews
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
      fetchSubcategories();
    }
  }, [id]);

  const fetchSubcategories = async () => {
    try {
      const response = await fetch(config.CATEGORY_SUBCATEGORY());
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1) {
          setSubcategories(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const fetchProduct = async (productId: number) => {
    try {
      const response = await fetch(config.PRODUCT_DETAIL(productId));
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1) {
          const productData = result.data;
          setProduct(productData);
          setFormData({
            product_name: productData.product_name,
            product_price: productData.product_price.toString(),
            product_description: productData.product_description || '',
            sub_category_id: productData.sub_category_id.toString(),
            files: []
          });
          setExistingImages(productData.images || []);
        } else {
          setError('Product not found');
        }
      } else {
        setError('Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('An error occurred while fetching the product');
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleInputChange = (field: keyof EditProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow integers (no decimals)
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, product_price: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...formData.files, ...files];
    
    // Limit to 10 files total (existing + new)
    const totalImages = existingImages.length - imagesToDelete.length + newFiles.length;
    if (totalImages > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    
    setFormData(prev => ({ ...prev, files: newFiles }));
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, files: newFiles }));
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const restoreExistingImage = (imageId: number) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
  };

  const validateForm = (): boolean => {
    if (!formData.product_name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.product_price.trim()) {
      setError('Product price is required');
      return false;
    }
    if (isNaN(parseInt(formData.product_price)) || parseInt(formData.product_price) <= 0) {
      setError('Product price must be a valid positive integer');
      return false;
    }
    if (!formData.sub_category_id) {
      setError('Subcategory is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('product_name', formData.product_name);
      formDataToSend.append('product_price', parseInt(formData.product_price).toString());
      formDataToSend.append('product_description', formData.product_description);
      if (formData.sub_category_id) {
        formDataToSend.append('sub_category_id', formData.sub_category_id);
      }
      
      // Append new files
      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });
      
      // Append images to delete
      imagesToDelete.forEach(imageId => {
        formDataToSend.append('images_to_delete', imageId.toString());
      });
      
      const response = await fetch(config.PRODUCTS + `/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formDataToSend
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1) {
          setSuccess('Product updated successfully!');
          // Navigate back to admin dashboard after 2 seconds
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        } else {
          setError(result.message || 'Failed to update product');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('An error occurred while updating the product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct || loadingSubcategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/admin')}>Back to Admin</Button>
        </div>
      </div>
    );
  }

  const remainingImages = existingImages.filter(img => !imagesToDelete.includes(img.id));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product information and images</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Update the details for your product. You can upload new images or remove existing ones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange('product_name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_price">Price * (Integer only)</Label>
                  <Input
                    id="product_price"
                    type="number"
                    min="1"
                    value={formData.product_price}
                    onChange={handlePriceChange}
                    placeholder="Enter price (e.g., 100)"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_description">Description</Label>
                <Textarea
                  id="product_description"
                  value={formData.product_description}
                  onChange={(e) => handleInputChange('product_description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Subcategory *</Label>
                <Select 
                  value={formData.sub_category_id} 
                  onValueChange={(value) => handleInputChange('sub_category_id', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto z-[9999]">
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
              </div>

              <div className="space-y-4">
                <Label>Product Images (up to 10)</Label>
                
                {/* Existing Images */}
                {remainingImages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Current Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {remainingImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={`http://localhost:8080${image.image_url}`}
                            alt={`Product image ${image.id}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {image.is_main && (
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images marked for deletion */}
                {imagesToDelete.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-700">Images to be deleted</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagesToDelete.map((imageId) => {
                        const image = existingImages.find(img => img.id === imageId);
                        return image ? (
                          <div key={imageId} className="relative group opacity-50">
                            <img
                              src={`http://localhost:8080${image.image_url}`}
                              alt={`Product image ${imageId}`}
                              className="w-full h-32 object-cover rounded-lg border border-red-300"
                            />
                            <button
                              type="button"
                              onClick={() => restoreExistingImage(imageId)}
                              className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {/* Upload new images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload new images
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, GIF up to 5MB each
                        </span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">New Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-green-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
