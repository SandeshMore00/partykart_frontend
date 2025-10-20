import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import config from '../config';
import { Category, SubCategory, Product } from '@shared/api';

interface AddProductFormData {
  product_name: string;
  product_price: string;
  product_description: string;
  sub_category_id: string;
  files: File[];
  // Optional shipping fields
  weight: string;
  length: string;
  width: string;
  height: string;
  origin_location: string;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<AddProductFormData>({
    product_name: '',
    product_price: '',
    product_description: '',
    sub_category_id: '',
    files: [],
    // Optional shipping fields
    weight: '',
    length: '',
    width: '',
    height: '',
    origin_location: ''
  });
  
  // Subcategories only
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);
  
  // Image previews
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      console.log('Fetching subcategories from:', config.CATEGORY_SUBCATEGORY());
      const response = await fetch(config.CATEGORY_SUBCATEGORY());
      console.log('Subcategories response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Subcategories result:', result);
        if (result.status === 1) {
          setSubcategories(result.data);
          console.log('Subcategories set:', result.data);
        }
      } else {
        console.error('Failed to fetch subcategories:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleInputChange = (field: keyof AddProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow integers (no decimals)
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, product_price: value }));
    }
  };

  const handleNumericChange = (field: 'weight' | 'length' | 'width' | 'height', value: string) => {
    // Allow decimal numbers for shipping dimensions
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...formData.files, ...files];
    
    // Limit to 10 files
    if (newFiles.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    
    // Log file metadata for debugging
    files.forEach(file => {
      console.log('File metadata:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        webkitRelativePath: file.webkitRelativePath
      });
    });
    
    setFormData(prev => ({ ...prev, files: newFiles }));
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, files: newFiles }));
    setImagePreviews(newPreviews);
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
      
      // Append optional shipping fields
      if (formData.weight.trim()) {
        formDataToSend.append('weight', formData.weight);
      }
      if (formData.length.trim()) {
        formDataToSend.append('length', formData.length);
      }
      if (formData.width.trim()) {
        formDataToSend.append('width', formData.width);
      }
      if (formData.height.trim()) {
        formDataToSend.append('height', formData.height);
      }
      if (formData.origin_location.trim()) {
        formDataToSend.append('origin_location', formData.origin_location);
      }
      
      // Append all files (multiple files like FastAPI example)
      formData.files.forEach((file, index) => {
        console.log(`Appending file ${index}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        formDataToSend.append('files', file, file.name);
      });
      
      const response = await fetch(config.PRODUCTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formDataToSend
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1) {
          setSuccess('Product created successfully!');
          // Reset form
          setFormData({
            product_name: '',
            product_price: '',
            product_description: '',
            sub_category_id: '',
            files: [],
            // Reset shipping fields
            weight: '',
            length: '',
            width: '',
            height: '',
            origin_location: ''
          });
          setImagePreviews([]);
          // Navigate back to admin dashboard after 2 seconds
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        } else {
          setError(result.message || 'Failed to create product');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError('An error occurred while creating the product');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSubcategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Create a new product with multiple images</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Fill in the details for your new product. You can upload up to 10 images.
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


              {/* Shipping Information Section */}
              <div className="space-y-4">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => handleNumericChange('weight', e.target.value)}
                        placeholder="e.g., 1.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="origin_location">Origin Location</Label>
                      <Input
                        id="origin_location"
                        value={formData.origin_location}
                        onChange={(e) => handleInputChange('origin_location', e.target.value)}
                        placeholder="e.g., New York, USA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (cm)</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.length}
                        onChange={(e) => handleNumericChange('length', e.target.value)}
                        placeholder="e.g., 25.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="width">Width (cm)</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.width}
                        onChange={(e) => handleNumericChange('width', e.target.value)}
                        placeholder="e.g., 15.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.height}
                        onChange={(e) => handleNumericChange('height', e.target.value)}
                        placeholder="e.g., 10.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Product Images (up to 10)</Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload images
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

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Product'}
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
