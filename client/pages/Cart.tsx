import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to proceed with checkout');
      return;
    }
    
    // Check if any items are out of stock
    const outOfStockItems = items.filter(item => 
      item.available_stock !== undefined && item.available_stock === 0
    );
    
    if (outOfStockItems.length > 0) {
      alert(`Some items in your cart are out of stock: ${outOfStockItems.map(i => i.name).join(', ')}. Please remove them to continue.`);
      return;
    }
    
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items to get started!</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const stock = item.available_stock;
            const isLowStock = stock !== undefined && stock <= 5 && stock > 0;
            const isOutOfStock = stock !== undefined && stock === 0;
            const isAtMaxStock = stock !== undefined && item.quantity >= stock;
            
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                    
                    {/* Stock warnings */}
                    {isOutOfStock && (
                      <p className="text-red-600 text-sm font-medium mt-1">Out of stock</p>
                    )}
                    {isLowStock && (
                      <p className="text-orange-600 text-sm font-medium mt-1">
                        Only {stock} left in stock!
                      </p>
                    )}
                    {isAtMaxStock && !isOutOfStock && (
                      <p className="text-orange-600 text-sm mt-1">
                        Maximum available quantity in cart
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isOutOfStock}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isAtMaxStock || isOutOfStock}
                      title={isAtMaxStock ? `Only ${stock} available` : ''}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <Button
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 mb-3"
          >
            Proceed to Checkout
          </Button>
          
          <Button
            onClick={clearCart}
            variant="outline"
            className="w-full text-red-500 border-red-500 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
