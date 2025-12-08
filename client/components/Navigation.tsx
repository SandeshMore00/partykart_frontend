// import { Link, useLocation } from 'react-router-dom';
// import { User } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useAuth } from '@/contexts/AuthContext';

// interface NavigationProps {
//   onLoginClick: () => void;
// }

// export default function Navigation({ onLoginClick }: NavigationProps) {
//   const location = useLocation();
//   const { user } = useAuth();

//   const navItems = [
//   { path: '/', label: 'Home' },
//   { path: '/contact', label: 'Contact' },
//   { path: '/offers', label: 'Offers' },
//   { path: '/cart', label: 'Cart' },
//   { path: '/courses', label: 'Courses' },
//   ];

//   const authenticatedNavItems = [
//     { path: '/orders', label: 'Orders' },
//   ];

//   return (
//     <nav className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 shadow-sm fixed left-0 right-0 z-30" style={{ top: '80px' }}>
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between">
//           <div className="flex space-x-8">
//             {navItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "py-4 px-6 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 border-pink-500 bg-pink-50"
//                     : "text-gray-700 hover:bg-pink-25"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}
//             {user && authenticatedNavItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "py-4 px-6 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 border-pink-500 bg-pink-50"
//                     : "text-gray-700 hover:bg-pink-25"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           {/* Login Button for Mobile */}
//           {!user && (
//             <button
//               onClick={onLoginClick}
//               className="md:hidden flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
//             >
//               <User className="w-4 h-4" />
//               <span>Login</span>
//             </button>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }



// import { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { User, Menu, X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/contexts/AuthContext";

// interface NavigationProps {
//   onLoginClick: () => void;
// }

// export default function Navigation({ onLoginClick }: NavigationProps) {
//   const location = useLocation();
//   const { user } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);

//   const navItems = [
//     { path: "/", label: "Home" },
//     { path: "/contact", label: "Contact" },
//     { path: "/offers", label: "Offers" },
//     { path: "/cart", label: "Cart" },
//     { path: "/courses", label: "Courses" },
//   ];

//   const authenticatedNavItems = [{ path: "/orders", label: "Orders" }];

//   const allNavItems = user ? [...navItems, ...authenticatedNavItems] : navItems;

//   return (
//     <nav className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 shadow-sm fixed left-0 right-0 z-30" style={{ top: "80px" }}>
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between py-3">
//           {/* Logo placeholder (optional) */}
//           {/* <div className="text-lg font-bold text-pink-600">MySite</div> */}

//           {/* Desktop Menu */}
//           <div className="hidden md:flex space-x-6">
//             {allNavItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "py-2 px-4 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 border-pink-500 bg-pink-50"
//                     : "text-gray-700 hover:bg-pink-25"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           {/* Right section */}
//           <div className="flex items-center space-x-3">
//             {!user && (
//               <button
//                 onClick={onLoginClick}
//                 className="hidden md:flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
//               >
//                 <User className="w-4 h-4" />
//                 <span>Login</span>
//               </button>
//             )}

//             {/* Mobile menu button */}
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-600"
//             >
//               {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu Dropdown */}
//         {isOpen && (
//           <div className="md:hidden flex flex-col space-y-1 pb-3">
//             {allNavItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 onClick={() => setIsOpen(false)} // close menu after click
//                 className={cn(
//                   "block py-2 px-4 text-sm font-medium transition-all duration-200 border-b border-gray-200 hover:bg-pink-50 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 bg-pink-50"
//                     : "text-gray-700"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}

//             {!user && (
//               <button
//                 onClick={() => {
//                   onLoginClick();
//                   setIsOpen(false);
//                 }}
//                 className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600"
//               >
//                 <User className="w-4 h-4" />
//                 <span>Login</span>
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }


import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Menu, X, Search, Package, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import config from "../config";

interface NavigationProps {
  onLoginClick: () => void;
}

interface NavItem {
  path: string;
  label: string;
  hidden?: boolean;
}

interface SearchProduct {
  product_id: number;
  product_name: string;
  product_price?: number;
  product_full_price?: number;
  product_description?: string;
  product_image?: string[] | string;
}

export default function Navigation({ onLoginClick }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const navItems: NavItem[] = [
    { path: "/", label: "Home" },
    { path: "/contact", label: "Contact" },
    { path: "/offers", label: "Offers", hidden: true },
    { path: "/cart", label: "Cart" },
    { path: "/courses", label: "Courses" },
  ];

  const authenticatedNavItems: NavItem[] = [{ path: "/orders", label: "Orders" }];

  const allNavItems = user ? [...navItems, ...authenticatedNavItems] : navItems;

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

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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
    setShowMobileSearch(false);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav
      className="bg-white md:bg-gradient-to-r md:from-pink-50 md:to-purple-50 border-b border-pink-100 shadow-sm fixed left-0 right-0 z-50"
      style={{ top: "68px" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "py-2 px-4 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
                  location.pathname === item.path
                    ? "text-pink-600 border-pink-500 bg-pink-50"
                    : "text-gray-700 hover:bg-pink-25",
                  item.hidden && "!hidden"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Desktop Search - after tabs */}
            <div className="relative ml-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9 pr-9 py-1.5 w-64 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Desktop Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute z-50 w-80 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
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
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            {hasImage && (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                <img
                                  src={mainImage}
                                  alt={product.product_name}
                                  className="w-full h-full object-contain p-1 rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-gray-900 truncate">{product.product_name}</h3>
                              {product.product_description && (
                                <p className="text-xs text-gray-600 truncate">{product.product_description}</p>
                              )}
                              {product.product_price && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs font-semibold text-pink-600">
                                    ₹{product.product_price.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-600">
                      <Package className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No products found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Mobile Home button - left side */}
            <Link
              to="/"
              className="md:hidden flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-full transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <div className="flex items-center space-x-3">
              {/* Mobile search button */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-600 bg-transparent"
              >
                <Search className="w-5 h-5" />
              </button>

              {!user && (
                <button
                  onClick={onLoginClick}
                  className="hidden md:flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-600 bg-transparent"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 w-full"
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

            {/* Mobile Search Results */}
            {showSearchResults && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
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
                            <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
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
                                <span className="text-sm font-semibold text-pink-600">
                                  ₹{product.product_price.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-600">
                    <Package className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p>No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden flex flex-col space-y-1 pb-3 bg-white shadow-lg relative z-50">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // close menu after click
                className={cn(
                  "block py-2 px-4 text-sm font-medium transition-all duration-200 border-b border-gray-200 hover:bg-pink-50 hover:text-pink-600",
                  location.pathname === item.path
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-700",
                  item.hidden && "!hidden"
                )}
              >
                {item.label}
              </Link>
            ))}

            {!user && (
              <button
                onClick={() => {
                  onLoginClick();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
