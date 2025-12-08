import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, ShoppingCart, List, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import config from '../config';
import { bigshipService } from '@/services/bigship';
import { BigShipConfirmModal } from '@/components/BigShipConfirmModal';

interface Order {
  order_id: number;
  total_amount: string;
  final_amount: string;
  payment_status: string;
  delivery_status: string;
  created_at?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    price_per_unit: string;
    subtotal: string;
  }>;
  // BigShip fields
  shipping_status?: 'pending' | 'in_progress' | 'completed';
  system_order_id?: string;
  courier_id?: string;
  master_awb?: string;
}

export default function OrderList() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  
  // BigShip confirmation states
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'idle' | 'creating' | 'manifesting' | 'success' | 'error' | 'warning'>('idle');
  const [modalError, setModalError] = useState<string>('');
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    if (user) fetchOrders();
    else navigate('/');
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    setViewMode('my');
    try {
      const res = await fetch(config.ALL_ORDERS, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setOrders(Array.isArray(result) ? result : []);
      } else {
        setError("Failed to fetch orders");
      }
    } catch {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    setError("");
    setViewMode('all');
    try {
      const res = await fetch(config.ADMIN_ALL_ORDERS, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setOrders(Array.isArray(result) ? result : []);
      } else {
        setError("Failed to fetch all orders");
      }
    } catch {
      setError("Failed to fetch all orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (orderId: number) => {
    navigate(`/order/${orderId}`);
  };

  // BigShip order confirmation handler
  const handleConfirmOrder = async (orderId: number) => {
    if (!user?.token) return;
    
    setConfirmingOrderId(orderId);
    setModalOpen(true);
    setModalStatus('creating');
    setModalError('');
    setModalData(null);
    
    // Set token for BigShip service
    bigshipService.setToken(user.token);
    
    try {
      // Step 1: Create BigShip order
      const createResult = await bigshipService.createOrder(orderId);
      
      if (!createResult.success) {
        setModalStatus('error');
        setModalError(createResult.message || 'Failed to create BigShip order');
        setConfirmingOrderId(null);
        return;
      }
      
      const systemOrderId = createResult.data?.system_order_id;
      
      if (!systemOrderId) {
        setModalStatus('error');
        setModalError('No system_order_id returned from BigShip');
        setConfirmingOrderId(null);
        return;
      }
      
      // Step 2: Generate manifest
      setModalStatus('manifesting');
      const manifestResult = await bigshipService.manifestOrder(systemOrderId);
      
      if (!manifestResult.success) {
        // Order created but manifest failed - warning state
        setModalStatus('warning');
        setModalError(manifestResult.message || 'Failed to generate manifest');
        setModalData({ system_order_id: systemOrderId });
        setConfirmingOrderId(null);
        
        // Refresh orders to show updated status
        if (viewMode === 'all') {
          await fetchAllOrders();
        } else {
          await fetchOrders();
        }
        return;
      }
      
      // Success - both order created and manifest generated
      setModalStatus('success');
      setModalData({
        system_order_id: systemOrderId,
        courier_id: createResult.data?.courier_id || manifestResult.data?.courier_id,
        master_awb: manifestResult.data?.master_awb,
        label_available: manifestResult.data?.label_available,
      });
      
      // Refresh orders to show updated status
      if (viewMode === 'all') {
        await fetchAllOrders();
      } else {
        await fetchOrders();
      }
      
    } catch (error) {
      console.error('Confirm order error:', error);
      setModalStatus('error');
      setModalError('An unexpected error occurred. Please try again.');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalStatus('idle');
    setModalError('');
    setModalData(null);
  };

  // Get shipping status badge
  const getShippingStatusBadge = (order: Order) => {
    const status = order.shipping_status || 'pending';
    
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {viewMode === 'all' ? 'All Orders' : 'My Orders'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:space-x-3">
          <Button 
            onClick={fetchOrders} 
            disabled={loading}
            variant={viewMode === 'my' ? 'default' : 'outline'}
            className="flex items-center space-x-2 flex-1 sm:flex-initial"
          >
            <Package className="w-4 h-4" />
            <span className="text-sm sm:text-base">{loading && viewMode === 'my' ? "Loading..." : "My Orders"}</span>
          </Button>
          {(isAdmin() || isSuperAdmin()) && (
            <Button 
              onClick={fetchAllOrders} 
              disabled={loading}
              variant={viewMode === 'all' ? 'default' : 'outline'}
              className="flex items-center space-x-2 flex-1 sm:flex-initial"
            >
              <List className="w-4 h-4" />
              <span className="text-sm sm:text-base">{loading && viewMode === 'all' ? "Loading..." : "All Orders"}</span>
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <span className="ml-4 text-gray-600">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <Package className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Orders</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={fetchOrders} variant="outline">
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-6">
            <Package className="w-24 h-24 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Continue Shopping</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            // Safe parsing to prevent NaN - use final_amount
            const finalAmount = order.final_amount ? parseFloat(order.final_amount) : 0;
            const isValidAmount = !isNaN(finalAmount);
            
            return (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow"
              >
                {/* Order Header - Responsive */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer"
                  onClick={() => handleOrderClick(order.order_id)}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                        Order #{order.order_id}
                      </h3>
                      {order.created_at && (
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                      {/* Show item count if available */}
                      {order.items && order.items.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:text-right">
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-xs text-gray-600 sm:hidden">Payment:</span>
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        order.payment_status === 'Completed' || order.payment_status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : order.payment_status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.payment_status === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.payment_status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-xs text-gray-600 sm:hidden">Delivery:</span>
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        order.delivery_status === 'Delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.delivery_status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.delivery_status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.delivery_status}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Status - Only show for admin in all orders view */}
                {viewMode === 'all' && (isAdmin() || isSuperAdmin()) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shipping Status:</span>
                      {getShippingStatusBadge(order)}
                    </div>
                  </div>
                )}
                
                {/* Order Total - Responsive */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Final Amount:</span>
                    <span className="text-xl sm:text-2xl font-bold text-pink-600">
                      {isValidAmount 
                        ? `₹${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '₹0.00'
                      }
                    </span>
                  </div>
                </div>

                {/* Admin Confirm Order Button */}
                {viewMode === 'all' && (isAdmin() || isSuperAdmin()) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmOrder(order.order_id);
                      }}
                      disabled={
                        order.shipping_status === 'in_progress' || 
                        order.shipping_status === 'completed' ||
                        confirmingOrderId === order.order_id
                      }
                      className="w-full"
                      variant={order.shipping_status === 'pending' ? 'default' : 'outline'}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      {order.shipping_status === 'in_progress' || order.shipping_status === 'completed'
                        ? 'Order Confirmed'
                        : confirmingOrderId === order.order_id
                        ? 'Confirming...'
                        : 'Confirm Order'
                      }
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BigShip Confirmation Modal */}
      <BigShipConfirmModal
        isOpen={modalOpen}
        onClose={closeModal}
        status={modalStatus}
        errorMessage={modalError}
        orderData={modalData}
      />
    </div>
  );
}
