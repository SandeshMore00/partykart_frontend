import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
  available_stock?: number; // Track available stock for validation
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, requestedQuantity?: number) => { success: boolean; message: string };
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('partykart-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('partykart-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, requestedQuantity: number = 1) => {
    const stock = product.available_stock;
    
    // Check if product is out of stock
    if (stock !== undefined && stock === 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
        duration: 2000,
      });
      return { success: false, message: "Product is out of stock" };
    }

    let actualQuantityAdded = requestedQuantity;
    let message = '';
    let success = true;

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentCartQuantity + requestedQuantity;

      // Check stock availability
      if (stock !== undefined && newTotalQuantity > stock) {
        actualQuantityAdded = Math.max(0, stock - currentCartQuantity);
        
        if (actualQuantityAdded === 0) {
          message = `You already have all available stock (${stock}) in your cart.`;
          success = false;
          toast({
            title: "Cannot Add More",
            description: message,
            variant: "destructive",
            duration: 2000,
          });
          return prevItems;
        } else {
          message = `Only ${actualQuantityAdded} item(s) added. ${stock} available in stock.`;
          toast({
            title: "Limited Stock",
            description: message,
            duration: 2000,
          });
        }
      } else {
        message = `Added ${actualQuantityAdded} item(s) to cart.`;
        toast({
          title: "Added to Cart",
          description: message,
          duration: 2000,
        });
      }

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: currentCartQuantity + actualQuantityAdded, available_stock: stock }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: actualQuantityAdded }];
      }
    });

    return { success, message };
  };

  const removeFromCart = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return { success: true, message: "Item removed from cart" };
    }

    const item = items.find(i => i.id === id);
    if (!item) {
      return { success: false, message: "Item not found in cart" };
    }

    const stock = item.available_stock;

    // Check stock limits
    if (stock !== undefined && quantity > stock) {
      toast({
        title: "Stock Limit Exceeded",
        description: `Only ${stock} item(s) available in stock. ${stock === 1 ? 'Only one left!' : ''}`,
        variant: "destructive",
        duration: 2000,
      });
      
      // Set to maximum available
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: stock } : item
        )
      );
      
      return { 
        success: false, 
        message: `Limited to ${stock} item(s) - maximum available stock` 
      };
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    return { success: true, message: "Quantity updated" };
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
