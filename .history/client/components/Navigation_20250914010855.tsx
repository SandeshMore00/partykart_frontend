import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  onLoginClick: () => void;
}

export default function Navigation({ onLoginClick }: NavigationProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
  { path: '/', label: 'Home' },
  { path: '/contact', label: 'Contact' },
  { path: '/offers', label: 'Offers' },
  { path: '/cart', label: 'Cart' },
  { path: '/courses', label: 'Courses' },
  ];

  const authenticatedNavItems = [
    { path: '/orders', label: 'Orders' },
  ];

  return (
    <nav className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 shadow-sm fixed left-0 right-0 z-30" style={{ top: '80px' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "py-4 px-6 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
                  location.pathname === item.path
                    ? "text-pink-600 border-pink-500 bg-pink-50"
                    : "text-gray-700 hover:bg-pink-25"
                )}
              >
                {item.label}
              </Link>
            ))}
            {user && authenticatedNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "py-4 px-6 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
                  location.pathname === item.path
                    ? "text-pink-600 border-pink-500 bg-pink-50"
                    : "text-gray-700 hover:bg-pink-25"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Login Button for Mobile */}
          {!user && (
            <button
              onClick={onLoginClick}
              className="md:hidden flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
