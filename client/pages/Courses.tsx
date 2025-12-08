import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Trash2, X, Video, ChevronDown, ChevronRight, FolderOpen, Layers, ExternalLink, Search, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import config from '../config';

// Marquee Text Component for long names
const MarqueeText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [distance, setDistance] = useState(0);

  const checkOverflow = useCallback(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;
      const overflow = textWidth > containerWidth;
      setIsOverflowing(overflow);
      if (overflow) {
        setDistance(-(textWidth - containerWidth + 20));
      }
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow, text]);

  return (
    <div ref={containerRef} className="marquee-container flex-1 min-w-0">
      <span
        ref={textRef}
        className={`marquee-text ${isOverflowing ? 'is-overflowing' : ''} ${className}`}
        style={isOverflowing ? { '--marquee-distance': `${distance}px` } as React.CSSProperties : undefined}
      >
        {text}
      </span>
    </div>
  );
};

// Interfaces
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

const Courses: React.FC = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const canEdit = isAdmin() || isSuperAdmin();
  
  // Data states
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [courseSubcategories, setCourseSubcategories] = useState<CourseSubcategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Expanded states for collapsible sections
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<number>>(new Set());
  
  // Subcategories per category (fetched on expand)
  const [categorySubcategories, setCategorySubcategories] = useState<Record<number, CourseSubcategory[]>>({});
  const [loadingCategorySubcategories, setLoadingCategorySubcategories] = useState<Set<number>>(new Set());
  
  // Course modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ course_name: '', course_link: '', course_subcategory: '' });
  const [courseError, setCourseError] = useState('');
  const [courseSuccess, setCourseSuccess] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);

  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ category_name: '' });
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  // Subcategory modal states
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<CourseSubcategory | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({ sub_category_name: '', category_id: '' });
  const [subcategoryError, setSubcategoryError] = useState('');
  const [subcategorySuccess, setSubcategorySuccess] = useState('');
  const [savingSubcategory, setSavingSubcategory] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [allSubcategories, setAllSubcategories] = useState<CourseSubcategory[]>([]);

  // Extract YouTube video ID for thumbnail
  const getYoutubeThumbnail = (url: string) => {
    let match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
    }
    match = url.match(/youtube\.com\/shorts\/([^&\n?#]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
    }
    return "";
  };
  
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

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      // Fetch course categories
      const categoriesRes = await fetch(config.COURSE_CATEGORY_LIST, { headers });
      if (categoriesRes.ok) {
        const result = await categoriesRes.json();
        let categories: CourseCategory[] = [];
        if (result.status === 1 && result.data) {
          categories = result.data;
        } else if (Array.isArray(result)) {
          categories = result;
        }
        setCourseCategories(categories);
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
    } catch (err) {
      console.error("Failed to fetch courses data", err);
    }
    setLoading(false);
  };

  // Toggle expanded categories
  const toggleCategory = async (categoryId: number) => {
    const isCurrentlyExpanded = expandedCategories.has(categoryId);
    
    setExpandedCategories(prev => {
      if (prev.has(categoryId)) {
        return new Set();
      } else {
        return new Set([categoryId]);
      }
    });
    
    if (!isCurrentlyExpanded) {
      setExpandedSubcategories(new Set());
    }
    
    if (!isCurrentlyExpanded && !categorySubcategories[categoryId]) {
      fetchSubcategoriesForCategory(categoryId);
    }
  };

  const toggleSubcategory = (subcategoryId: number) => {
    setExpandedSubcategories(prev => {
      if (prev.has(subcategoryId)) {
        return new Set();
      } else {
        return new Set([subcategoryId]);
      }
    });
  };

  // Helper functions
  const getSubcategoriesForCategory = (categoryId: number) => {
    return categorySubcategories[categoryId] || [];
  };

  const getCoursesForSubcategory = (subcategoryId: number) => {
    return courses.filter(c => c.course_subcategory === subcategoryId);
  };

  // Fetch all subcategories
  const fetchAllSubcategories = async () => {
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      const response = await fetch(config.COURSE_SUBCATEGORY_LIST, { headers });
      if (response.ok) {
        const result = await response.json();
        const subs = Array.isArray(result) ? result : (result.data || []);
        setAllSubcategories(subs);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  // Search functions
  const searchCoursesAPI = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      const response = await fetch(config.COURSES_SEARCH(query), { headers });
      if (response.ok) {
        const result = await response.json();
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
      console.error('Error searching courses:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchCoursesAPI(query);
      }, 500);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const getSubcategoryNameById = (subcategoryId: number) => {
    const sub = allSubcategories.find(s => s.sub_category_id === subcategoryId);
    return sub?.sub_category_name || 'Unknown';
  };

  // Cleanup search timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchAllSubcategories();
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-scroll on mobile to skip blank header space and show content properly
    if (window.innerWidth < 768) {
      setTimeout(() => {
        window.scrollTo({ top: 220, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // ========== CATEGORY CRUD ==========
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ category_name: '' });
    setCategoryError('');
    setCategorySuccess('');
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category: CourseCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
    setCategoryForm({ category_name: category.category_name });
    setCategoryError('');
    setCategorySuccess('');
    setShowCategoryModal(true);
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.category_name.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    
    const duplicate = courseCategories.some(
      c => c.category_name.trim().toLowerCase() === categoryForm.category_name.trim().toLowerCase()
    );
    if (duplicate) {
      setCategoryError('Category already exists');
      return;
    }

    setSavingCategory(true);
    try {
      const response = await fetch(config.COURSE_CATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ category_name: categoryForm.category_name.trim() })
      });

      if (response.ok) {
        setCategorySuccess('Category created successfully');
        await fetchData();
        setTimeout(() => {
          setShowCategoryModal(false);
          setCategoryForm({ category_name: '' });
        }, 1500);
      } else {
        const error = await response.json();
        setCategoryError(error.detail || 'Failed to create category');
      }
    } catch (error) {
      setCategoryError('Error creating category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!categoryForm.category_name.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    const nameChanged = categoryForm.category_name.trim() !== editingCategory.category_name;
    if (!nameChanged) {
      setCategoryError('No changes detected');
      return;
    }

    const duplicate = courseCategories.some(
      c => c.category_name.trim().toLowerCase() === categoryForm.category_name.trim().toLowerCase()
        && c.category_id !== editingCategory.category_id
    );
    if (duplicate) {
      setCategoryError('Category already exists');
      return;
    }

    setSavingCategory(true);
    try {
      const response = await fetch(config.COURSE_CATEGORY_UPDATE(editingCategory.category_id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ category_name: categoryForm.category_name.trim() })
      });

      if (response.ok) {
        setCategorySuccess('Category updated successfully');
        await fetchData();
        setTimeout(() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }, 1500);
      } else {
        const error = await response.json();
        setCategoryError(error.detail || 'Failed to update category');
      }
    } catch (error) {
      setCategoryError('Error updating category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const subs = categorySubcategories[categoryId] || [];
    if (subs.length > 0) {
      alert('Cannot delete category with existing subcategories');
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(config.COURSE_CATEGORY_DELETE(categoryId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (response.ok) {
        setCourseCategories(prev => prev.filter(c => c.category_id !== categoryId));
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete category');
      }
    } catch (error) {
      alert('Error deleting category');
    }
  };

  // ========== SUBCATEGORY CRUD ==========
  const openAddSubcategoryModal = (categoryId?: number) => {
    setEditingSubcategory(null);
    setSubcategoryForm({ sub_category_name: '', category_id: categoryId?.toString() || '' });
    setSubcategoryError('');
    setSubcategorySuccess('');
    setShowSubcategoryModal(true);
  };

  const openEditSubcategoryModal = (subcategory: CourseSubcategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubcategory(subcategory);
    setSubcategoryForm({ 
      sub_category_name: subcategory.sub_category_name, 
      category_id: subcategory.category_id.toString() 
    });
    setSubcategoryError('');
    setSubcategorySuccess('');
    setShowSubcategoryModal(true);
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

    setSavingSubcategory(true);
    try {
      const response = await fetch(config.COURSE_SUBCATEGORY_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          sub_category_name: subcategoryForm.sub_category_name.trim(),
          category_id: parseInt(subcategoryForm.category_id)
        })
      });

      if (response.ok) {
        setSubcategorySuccess('Subcategory created successfully');
        await fetchSubcategoriesForCategory(parseInt(subcategoryForm.category_id));
        await fetchAllSubcategories();
        setTimeout(() => {
          setShowSubcategoryModal(false);
          setSubcategoryForm({ sub_category_name: '', category_id: '' });
        }, 1500);
      } else {
        const error = await response.json();
        setSubcategoryError(error.detail || 'Failed to create subcategory');
      }
    } catch (error) {
      setSubcategoryError('Error creating subcategory');
    } finally {
      setSavingSubcategory(false);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return;
    if (!subcategoryForm.sub_category_name.trim()) {
      setSubcategoryError('Subcategory name is required');
      return;
    }

    const nameChanged = subcategoryForm.sub_category_name.trim() !== editingSubcategory.sub_category_name;
    if (!nameChanged) {
      setSubcategoryError('No changes detected');
      return;
    }

    setSavingSubcategory(true);
    try {
      const response = await fetch(config.COURSE_SUBCATEGORY_UPDATE(editingSubcategory.sub_category_id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ sub_category_name: subcategoryForm.sub_category_name.trim() })
      });

      if (response.ok) {
        setSubcategorySuccess('Subcategory updated successfully');
        await fetchSubcategoriesForCategory(editingSubcategory.category_id);
        await fetchAllSubcategories();
        setTimeout(() => {
          setShowSubcategoryModal(false);
          setEditingSubcategory(null);
        }, 1500);
      } else {
        const error = await response.json();
        setSubcategoryError(error.detail || 'Failed to update subcategory');
      }
    } catch (error) {
      setSubcategoryError('Error updating subcategory');
    } finally {
      setSavingSubcategory(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: number, categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasCourses = courses.some(c => c.course_subcategory === subcategoryId);
    if (hasCourses) {
      alert('Cannot delete subcategory with existing courses');
      return;
    }
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const response = await fetch(config.COURSE_SUBCATEGORY_DELETE(subcategoryId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (response.ok) {
        setCategorySubcategories(prev => ({
          ...prev,
          [categoryId]: (prev[categoryId] || []).filter(s => s.sub_category_id !== subcategoryId)
        }));
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete subcategory');
      }
    } catch (error) {
      alert('Error deleting subcategory');
    }
  };

  // ========== COURSE CRUD ==========
  const openAddCourseModal = () => {
    setEditingCourse(null);
    setCourseForm({ course_name: '', course_link: '', course_subcategory: '' });
    setCourseError('');
    setCourseSuccess('');
    setShowCourseModal(true);
  };

  const openEditCourseModal = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(course);
    setCourseForm({
      course_name: course.course_name,
      course_link: course.course_link,
      course_subcategory: course.course_subcategory.toString()
    });
    setCourseError('');
    setCourseSuccess('');
    setShowCourseModal(true);
  };

  const handleCreateCourse = async () => {
    if (!courseForm.course_name.trim() || !courseForm.course_link.trim() || !courseForm.course_subcategory) {
      setCourseError('All fields are required');
      return;
    }

    setSavingCourse(true);
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
        await fetchData();
        setTimeout(() => {
          setShowCourseModal(false);
          setCourseForm({ course_name: '', course_link: '', course_subcategory: '' });
        }, 1500);
      } else {
        const error = await response.json();
        setCourseError(error.detail || 'Failed to create course');
      }
    } catch (error) {
      setCourseError('Error creating course');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    if (!courseForm.course_name.trim() || !courseForm.course_link.trim()) {
      setCourseError('Name and link are required');
      return;
    }

    const nameChanged = courseForm.course_name.trim() !== editingCourse.course_name;
    const linkChanged = courseForm.course_link.trim() !== editingCourse.course_link;
    const subcatChanged = courseForm.course_subcategory !== editingCourse.course_subcategory.toString();

    if (!nameChanged && !linkChanged && !subcatChanged) {
      setCourseError('No changes detected');
      return;
    }

    setSavingCourse(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (nameChanged) updateData.course_name = courseForm.course_name.trim();
      if (linkChanged) updateData.course_link = courseForm.course_link.trim();
      if (subcatChanged) updateData.sub_category_id = parseInt(courseForm.course_subcategory);

      const response = await fetch(config.COURSES_UPDATE(editingCourse.course_id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setCourseSuccess('Course updated successfully');
        await fetchData();
        setTimeout(() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }, 1500);
      } else {
        const error = await response.json();
        setCourseError(error.detail || 'Failed to update course');
      }
    } catch (error) {
      setCourseError('Error updating course');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(config.COURSES_DELETE(courseId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.course_id !== courseId));
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete course');
      }
    } catch (error) {
      alert('Error deleting course');
    }
  };

  const totalCourses = courses.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-pink-700">Courses</h1>
          <p className="text-gray-600 mt-1">
            {courseCategories.length} categories • {totalCourses} courses
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={openAddCategoryModal} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Category
            </Button>
            <Button onClick={() => openAddSubcategoryModal()} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Subcategory
            </Button>
            <Button onClick={openAddCourseModal} className="bg-pink-500 hover:bg-pink-600" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Course
            </Button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search courses..."
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
          <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((course) => (
                  <a
                    key={course.course_id}
                    href={course.course_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => clearSearch()}
                  >
                    {course.course_link && (
                      <img
                        src={getYoutubeThumbnail(course.course_link)}
                        alt={course.course_name}
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{course.course_name}</h3>
                      <p className="text-xs text-gray-500">{getSubcategoryNameById(course.course_subcategory)}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-600">
                <Video className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No courses found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : courseCategories.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses available</h3>
          <p className="text-gray-500">Courses will appear here when they are added.</p>
          {canEdit && (
            <Button onClick={openAddCategoryModal} className="mt-4 bg-pink-500 hover:bg-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {courseCategories.map(category => {
            const subcategoriesForCategory = getSubcategoriesForCategory(category.category_id);
            const isExpanded = expandedCategories.has(category.category_id);

            return (
              <Card key={category.category_id} className="overflow-hidden shadow-lg">
                {/* Category Header */}
                <div 
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-pink-100 via-pink-50 to-white cursor-pointer hover:from-pink-150 transition-all"
                  onClick={() => toggleCategory(category.category_id)}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-6 h-6 text-pink-600 shrink-0" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-pink-600 shrink-0" />
                    )}
                    <div className="p-2 bg-pink-500 rounded-lg shrink-0">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <MarqueeText text={category.category_name} className="text-xl font-bold text-pink-800" />
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => openEditCategoryModal(category, e)}
                        className="text-pink-600 hover:bg-pink-200 h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteCategory(category.category_id, e)}
                        className="text-red-600 hover:bg-red-100 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && (
                  <div className="border-l-4 border-pink-300">
                    {loadingCategorySubcategories.has(category.category_id) ? (
                      <div className="p-6 flex items-center justify-center bg-gray-50">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : subcategoriesForCategory.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 bg-gray-50">
                        <p>No subcategories yet.</p>
                        {canEdit && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => openAddSubcategoryModal(category.category_id)}
                            className="text-blue-600"
                          >
                            Add first subcategory
                          </Button>
                        )}
                      </div>
                    ) : (
                      subcategoriesForCategory.map(subcategory => {
                        const coursesForSubcategory = getCoursesForSubcategory(subcategory.sub_category_id);
                        const isSubExpanded = expandedSubcategories.has(subcategory.sub_category_id);

                        return (
                          <div key={subcategory.sub_category_id} className="border-b border-gray-100 last:border-b-0">
                            {/* Subcategory Header */}
                            <div 
                              className="flex items-center justify-between p-4 pl-8 bg-gradient-to-r from-blue-50 to-white cursor-pointer hover:from-blue-100 transition-all"
                              onClick={() => toggleSubcategory(subcategory.sub_category_id)}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {isSubExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-blue-600 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-blue-600 shrink-0" />
                                )}
                                <div className="p-1.5 bg-blue-500 rounded-lg shrink-0">
                                  <Layers className="w-5 h-5 text-white" />
                                </div>
                                <MarqueeText text={subcategory.sub_category_name} className="text-lg font-semibold text-blue-800" />
                              </div>
                              {canEdit && (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => openEditSubcategoryModal(subcategory, e)}
                                    className="text-blue-600 hover:bg-blue-200 h-7 w-7 p-0"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDeleteSubcategory(subcategory.sub_category_id, subcategory.category_id, e)}
                                    className="text-red-600 hover:bg-red-100 h-7 w-7 p-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Courses Grid */}
                            {isSubExpanded && (
                              <div className="pl-12 pr-4 py-4 bg-gray-50">
                                {coursesForSubcategory.length === 0 ? (
                                  <div className="text-center py-8 text-gray-500">
                                    <Video className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm">No courses yet.</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {coursesForSubcategory.map((course) => (
                                      <div
                                        key={course.course_id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group relative"
                                      >
                                        {canEdit && (
                                          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              className="h-7 w-7 p-0 bg-white/90"
                                              onClick={(e) => openEditCourseModal(course, e)}
                                            >
                                              <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              className="h-7 w-7 p-0"
                                              onClick={(e) => handleDeleteCourse(course.course_id, e)}
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        )}
                                        
                                        {course.course_link && (
                                          <a
                                            href={course.course_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                          >
                                            <div className="relative aspect-video bg-gray-100">
                                              <img
                                                src={getYoutubeThumbnail(course.course_link)}
                                                alt={course.course_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                                                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                                </div>
                                              </div>
                                            </div>
                                          </a>
                                        )}
                                        
                                        <div className="p-3">
                                          <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
                                              {course.course_name}
                                            </h4>
                                            <a
                                              href={course.course_link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="shrink-0 p-1 hover:bg-gray-100 rounded"
                                            >
                                              <ExternalLink className="w-4 h-4 text-gray-500" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
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

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCategoryModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Category Name <span className="text-red-500">*</span></Label>
                <Input
                  value={categoryForm.category_name}
                  onChange={(e) => setCategoryForm({ category_name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              {categoryError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{categoryError}</div>
              )}
              {categorySuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded">{categorySuccess}</div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCategoryModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={savingCategory || !categoryForm.category_name.trim()}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  {savingCategory ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSubcategoryModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Subcategory Name <span className="text-red-500">*</span></Label>
                <Input
                  value={subcategoryForm.sub_category_name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, sub_category_name: e.target.value })}
                  placeholder="Enter subcategory name"
                />
              </div>

              <div>
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select
                  value={subcategoryForm.category_id}
                  onValueChange={(value) => setSubcategoryForm({ ...subcategoryForm, category_id: value })}
                  disabled={!!editingSubcategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    {courseCategories.map(cat => (
                      <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                        {cat.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subcategoryError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{subcategoryError}</div>
              )}
              {subcategorySuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded">{subcategorySuccess}</div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowSubcategoryModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={editingSubcategory ? handleUpdateSubcategory : handleCreateSubcategory}
                  disabled={savingSubcategory || !subcategoryForm.sub_category_name.trim() || !subcategoryForm.category_id}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  {savingSubcategory ? 'Saving...' : (editingSubcategory ? 'Update' : 'Create')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCourseModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Course Name <span className="text-red-500">*</span></Label>
                <Input
                  value={courseForm.course_name}
                  onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                  placeholder="Enter course name"
                />
              </div>
              
              <div>
                <Label>YouTube Link <span className="text-red-500">*</span></Label>
                <Input
                  value={courseForm.course_link}
                  onChange={(e) => setCourseForm({ ...courseForm, course_link: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <Label>Subcategory <span className="text-red-500">*</span></Label>
                <Select
                  value={courseForm.course_subcategory}
                  onValueChange={(value) => setCourseForm({ ...courseForm, course_subcategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto z-[10000]">
                    {courseCategories.map(category => {
                      const subs = allSubcategories.filter(s => s.category_id === category.category_id);
                      if (subs.length === 0) return null;
                      return (
                        <div key={category.category_id}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                            {category.category_name}
                          </div>
                          {subs.map(sub => (
                            <SelectItem key={sub.sub_category_id} value={sub.sub_category_id.toString()}>
                              {sub.sub_category_name}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
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
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}

              {courseError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{courseError}</div>
              )}
              {courseSuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded">{courseSuccess}</div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCourseModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                  disabled={savingCourse || !courseForm.course_name.trim() || !courseForm.course_link.trim() || !courseForm.course_subcategory}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  {savingCourse ? 'Saving...' : (editingCourse ? 'Update' : 'Create')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
