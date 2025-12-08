import { ShoppingCart, User, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onCartClick: () => void;
  onLoginClick: () => void;
}

export default function Header({ onCartClick, onLoginClick }: HeaderProps) {
  const { getTotalItems } = useCart();
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            src="/images/logo.png"
            alt="PartyKart Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain shadow-lg"
          />
          <h1 className="text-xl sm:text-3xl font-semibold whitespace-nowrap tracking-tight" style={{ fontFamily: "'Fredoka', 'Comic Sans MS', cursive" }}>
            <span className="text-purple-600 hover:scale-110 inline-block transition-transform">the</span>
            <span className="text-pink-500 hover:scale-110 inline-block transition-transform">party</span>
            <span className="text-amber-500 hover:scale-110 inline-block transition-transform">kart</span>
            <span className="text-cyan-500 text-base sm:text-xl hover:scale-110 inline-block transition-transform">.com</span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Admin Dashboard Button */}
          {user && (isAdmin() || isSuperAdmin()) && (
            <button
              onClick={() => navigate('/admin')}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-pink-500 transition-colors"
              title="Admin Dashboard"
            >
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="relative p-1.5 sm:p-2 text-gray-600 hover:text-pink-500 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Button */}
          {user ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Hello,</span>
              <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none">{user.phone_no}</span>
              <button
                onClick={logout}
                className="text-xs sm:text-sm text-red-500 hover:text-red-700 whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
