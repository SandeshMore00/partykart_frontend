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
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse">
            <span className="glow-text">The PartyKart</span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Orders Button (next to Cart) */}
          <button
            onClick={() => navigate('/orders')}
            className="relative p-2 text-gray-600 hover:text-pink-500 transition-colors"
            title="Orders"
          >
            Orders
          </button>
          {/* Admin Dashboard Button */}
          {user && (isAdmin() || isSuperAdmin()) && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
              title="Admin Dashboard"
            >
              <Shield className="w-6 h-6" />
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="relative p-2 text-gray-600 hover:text-pink-500 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Hello, {user.phone_no}</span>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <User className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
