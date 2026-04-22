import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, ShoppingCart, List, Truck, FileText, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import config from '../config';
import { bigshipService } from '@/services/bigship';
import { BigShipConfirmModal } from '@/components/BigShipConfirmModal';

interface ShippingDetails {
  tat: number;
  zone: string;
  courier_id: number;
  courier_name: string;
  courier_type: string;
  total_shipping_charges: number;
}

interface Order {
  order_id: number;
  total_amount: string;
  final_amount: string;
  payment_status: string;
  delivery_status: string;
  confirm_order_status?: 'Pending' | 'Confirmed' | 'Cancelled';
  created_at?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    price_per_unit: string;
    subtotal: string;
  }>;
  shipping_details?: ShippingDetails;
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'idle' | 'creating' | 'manifesting' | 'success' | 'error' | 'warning'>('idle');
  const [modalError, setModalError] = useState<string>('');
  const [modalData, setModalData] = useState<any>(null);
  const [fullResponse, setFullResponse] = useState<any>(null);
  
  // Manifest order states
  const [manifestingOrderId, setManifestingOrderId] = useState<number | null>(null);
  const [showManifestDialog, setShowManifestDialog] = useState(false);
  const [pendingManifestOrderId, setPendingManifestOrderId] = useState<number | null>(null);
  
  // Track order states
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string>('');
  
  // Cancel order states
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState<number | null>(null);

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
        // Handle "No orders found" response
        if (result.detail === "No orders found") {
          setOrders([]);
        } else if (Array.isArray(result)) {
          setOrders(result);
        } else {
          setOrders([]);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.detail === "No orders found") {
          setOrders([]);
        } else {
          setError(errorData.detail || "Failed to fetch orders");
        }
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
        // Handle "No orders found" response
        if (result.detail === "No orders found") {
          setOrders([]);
        } else if (Array.isArray(result)) {
          setOrders(result);
        } else {
          setOrders([]);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.detail === "No orders found") {
          setOrders([]);
        } else {
          setError(errorData.detail || "Failed to fetch all orders");
        }
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

  // Handle confirm order button click - show confirmation dialog
  const handleConfirmOrderClick = (orderId: number) => {
    setPendingOrderId(orderId);
    setShowConfirmDialog(true);
  };

  // BigShip order confirmation handler - proceed with shipment
  const handleConfirmOrder = async () => {
    const orderId = pendingOrderId;
    if (!user?.token || !orderId) return;
    
    setShowConfirmDialog(false);
    setConfirmingOrderId(orderId);
    setModalOpen(true);
    setModalStatus('creating');
    setModalError('');
    setModalData(null);
    setFullResponse(null);
    
    try {
      // Find the order to get shipping details
      const order = orders.find(o => o.order_id === orderId);
      if (!order || !order.shipping_details) {
        setModalStatus('error');
        setModalError('Order or shipping details not found. Please ensure the order has shipping details.');
        setConfirmingOrderId(null);
        return;
      }
      
      const { courier_id, courier_name } = order.shipping_details;
      let shipmentData: any = null;
      let createOrderData: any = null;

      // Step 1: Create shipment
      setModalStatus('creating');
      try {
        const shipmentResponse = await fetch(config.BIGSHIP_ADMIN_SHIPMENT(orderId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({})
        });

        shipmentData = await shipmentResponse.json();
        setFullResponse({ shipment: shipmentData });

        if (shipmentResponse.ok && shipmentData.success) {
          // Shipment created successfully, proceed to step 2
        } else {
          // First API failed
          setModalStatus('error');
          setModalError(`Step 1 (Create Shipment) Failed: ${shipmentData.message || 'Failed to create shipment'}`);
          setConfirmingOrderId(null);
          return;
        }
      } catch (error: any) {
        setModalStatus('error');
        setModalError(`Step 1 (Create Shipment) Error: ${error.message || 'An unexpected error occurred'}`);
        setFullResponse({ shipment: { error: error.toString() } });
        setConfirmingOrderId(null);
        return;
      }
      
      // Step 2: Create BigShip order
      setModalStatus('manifesting');
      try {
        const createOrderUrl = `${config.BIGSHIP_CREATE_ORDER}?order_id=${orderId}&courier_id=${courier_id}&courier_name=${encodeURIComponent(courier_name)}`;
        const createOrderResponse = await fetch(createOrderUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        createOrderData = await createOrderResponse.json();
        setFullResponse(prev => ({ ...prev, createOrder: createOrderData }));
      
        if (createOrderResponse.ok && createOrderData.success) {
          // Both steps succeeded
        } else {
          // First succeeded but second failed - partial success
          setModalStatus('warning');
          setModalError(`Step 1 (Create Shipment) ✓ Success\nStep 2 (Create Order) ✗ Failed: ${createOrderData.message || 'Failed to create order in BigShip'}`);
          setModalData({
            shipment_id: shipmentData.shipment_id,
            dimensions: shipmentData.dimensions,
          });
          setConfirmingOrderId(null);
          // Refresh orders to show updated status
          if (viewMode === 'all') {
            await fetchAllOrders();
          } else {
            await fetchOrders();
          }
          return;
        }
      } catch (error: any) {
        // First succeeded but second failed - partial success
        setModalStatus('warning');
        setModalError(`Step 1 (Create Shipment) ✓ Success\nStep 2 (Create Order) ✗ Error: ${error.message || 'An unexpected error occurred'}`);
        setFullResponse(prev => ({ ...prev, createOrder: { error: error.toString() } }));
        setModalData({
          shipment_id: shipmentData.shipment_id,
          dimensions: shipmentData.dimensions,
        });
        setConfirmingOrderId(null);
        // Refresh orders to show updated status
        if (viewMode === 'all') {
          await fetchAllOrders();
        } else {
          await fetchOrders();
        }
        return;
      }
      
      // Both succeeded
      setModalStatus('success');
      setModalData({
        shipment_id: shipmentData.shipment_id,
        system_order_id: createOrderData.system_order_id,
        dimensions: shipmentData.dimensions,
      });
      
      // Refresh orders to show updated status
      if (viewMode === 'all') {
        await fetchAllOrders();
      } else {
        await fetchOrders();
      }
      
    } catch (error: any) {
      console.error('Confirm order error:', error);
      setModalStatus('error');
      setModalError(`Unexpected Error: ${error.message || 'An unexpected error occurred. Please try again.'}`);
      setFullResponse({ error: error.toString() });
    } finally {
      setConfirmingOrderId(null);
      setPendingOrderId(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalStatus('idle');
    setModalError('');
    setModalData(null);
    setFullResponse(null);
  };

  // Handle manifest order button click - show confirmation dialog
  const handleManifestOrderClick = (orderId: number) => {
    setPendingManifestOrderId(orderId);
    setShowManifestDialog(true);
  };

  // Handle manifest order - proceed with manifest creation
  const [manifestResponse, setManifestResponse] = useState<any>(null);
  const [showManifestResponseModal, setShowManifestResponseModal] = useState(false);
  
  const handleManifestOrder = async () => {
    const orderId = pendingManifestOrderId;
    if (!user?.token || !orderId) return;
    
    setShowManifestDialog(false);
    setManifestingOrderId(orderId);
    try {
      // First, fetch order details to get all required information
      const orderDetailResponse = await fetch(config.ORDER_DETAIL(orderId), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!orderDetailResponse.ok) {
        throw new Error('Failed to fetch order details');
      }

      const orderDetail = await orderDetailResponse.json();

      // Extract shipping_details from the response
      const shippingDetails = orderDetail.shipping_details;
      if (!shippingDetails) {
        throw new Error('Shipping details not found in order');
      }

      // Get payment method from order (default to COD if not found)
      const paymentMethod = orderDetail.payment_method || orderDetail.payment_status || 'COD';
      const paymentType = paymentMethod.toLowerCase() === 'cod' ? 'cod' : 'prepaid';

      // Get shipping address pincode from order detail response
      const destinationPincode = orderDetail.shipping_address?.pincode;
      
      if (!destinationPincode) {
        throw new Error('Shipping address pincode not found. Please ensure the order has a shipping address.');
      }

      // Get total amount
      const totalAmount = parseFloat(orderDetail.total || orderDetail.total_amount || orderDetail.final_amount || '0');

      // Get order items
      const orderItems = orderDetail.items || [];

      // Construct payload exactly like calculate-rates API
      const payload = {
        shipment_category: "b2c",
        payment_type: paymentType,
        pickup_pincode: 410206,
        destination_pincode: parseInt(destinationPincode),
        shipment_invoice_amount: totalAmount,
        box_details: [
          {
            each_box_dead_weight: 0.5,
            each_box_length: 20,
            each_box_width: 15,
            each_box_height: 10,
            each_box_invoice_amount: totalAmount,
            box_count: 1,
            product_details: orderItems.map((item: any) => ({
              product_category: "Decoration",
              product_name: item.product_name || item.name || '',
              product_quantity: item.quantity || 0,
              each_product_invoice_amount: parseFloat(item.price || item.price_per_unit || '0'),
              hsn: "9505"
            }))
          }
        ]
      };

      // Send manifest request with payload
      const response = await fetch(config.BIGSHIP_MANIFEST_ORDER(orderId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setManifestResponse(data);
      
      if (response.ok && data.success) {
        // Show response to admin
        setShowManifestResponseModal(true);
        // Refresh orders to show updated status
        if (viewMode === 'all') {
          await fetchAllOrders();
        } else {
          await fetchOrders();
        }
      } else {
        setShowManifestResponseModal(true);
        alert(data.message || 'Failed to create manifest');
      }
    } catch (error: any) {
      console.error('Manifest error:', error);
      setManifestResponse({ error: error.toString() });
      setShowManifestResponseModal(true);
      alert('Failed to create manifest. Please try again.');
    } finally {
      setManifestingOrderId(null);
      setPendingManifestOrderId(null);
    }
  };

  // Handle track order
  const handleTrackOrder = async (orderId: number, deliveryStatus: string) => {
    if (!user?.token) return;
    
    setTrackingOrderId(orderId);
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingData(null);
    setShowTrackingModal(true);

    if (deliveryStatus !== 'Shipped') {
      setTrackingLoading(false);
      return;
    }

    try {
      const response = await fetch(config.BIGSHIP_TRACK_ORDER(orderId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setTrackingData(data);
      } else {
        setTrackingError(data.message || 'Failed to fetch tracking information');
      }
    } catch (error: any) {
      console.error('Track order error:', error);
      setTrackingError('Failed to fetch tracking information. Please try again.');
    } finally {
      setTrackingLoading(false);
      setTrackingOrderId(null);
    }
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    setTrackingData(null);
    setTrackingError('');
  };

  // Handle cancel order button click - show confirmation dialog
  const handleCancelOrderClick = (orderId: number) => {
    setPendingCancelOrderId(orderId);
    setShowCancelDialog(true);
  };

  // Handle cancel order - proceed with cancellation
  const handleCancelOrder = async () => {
    const orderId = pendingCancelOrderId;
    if (!user?.token || !orderId) return;
    
    setShowCancelDialog(false);
    setCancellingOrderId(orderId);
    try {
      const response = await fetch(config.BIGSHIP_CANCEL_ORDER(orderId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(data.message || 'Order cancelled successfully');
        // Refresh orders to show updated status
        if (viewMode === 'all') {
          await fetchAllOrders();
        } else {
          await fetchOrders();
        }
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Cancel order error:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
      setPendingCancelOrderId(null);
    }
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
                          : order.delivery_status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : order.delivery_status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.delivery_status === 'Cancelled' ? 'Order Cancelled' : order.delivery_status}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Details */}
                {order.shipping_details && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Shipping Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {/* Show admin-only fields only in "All Orders" view */}
                      {(viewMode === 'all' && (isAdmin() || isSuperAdmin())) && (
                        <>
                          <div className="break-words">
                            <span className="text-gray-600 block mb-1">Courier:</span>
                            <p className="font-medium text-gray-800 break-words">{order.shipping_details.courier_name}</p>
                          </div>
                          <div className="break-words">
                            <span className="text-gray-600 block mb-1">Type:</span>
                            <p className="font-medium text-gray-800 break-words">{order.shipping_details.courier_type}</p>
                          </div>
                          <div className="break-words">
                            <span className="text-gray-600 block mb-1">Zone:</span>
                            <p className="font-medium text-gray-800 break-words">{order.shipping_details.zone}</p>
                          </div>
                          <div className="break-words">
                            <span className="text-gray-600 block mb-1">TAT:</span>
                            <p className="font-medium text-gray-800 break-words">{order.shipping_details.tat} day(s)</p>
                          </div>
                          <div className="break-words">
                            <span className="text-gray-600 block mb-1">Courier ID:</span>
                            <p className="font-medium text-gray-800 break-words">{order.shipping_details.courier_id}</p>
                          </div>
                        </>
                      )}
                      {/* Shipping Charges - visible to all users */}
                      <div className="break-words">
                        <span className="text-gray-600 block mb-1">Shipping Charges:</span>
                        <p className="font-medium text-green-600 break-words">
                          ₹{order.shipping_details.total_shipping_charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Order Status & Shipping Status - Only show for admin in all orders view */}
                {viewMode === 'all' && (isAdmin() || isSuperAdmin()) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {order.confirm_order_status && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-600">Confirm Status:</span>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          order.confirm_order_status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : order.confirm_order_status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.confirm_order_status}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs sm:text-sm text-gray-600">Shipping Status:</span>
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
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmOrderClick(order.order_id);
                      }}
                      disabled={
                        order.confirm_order_status === 'Confirmed' ||
                        order.confirm_order_status === 'Cancelled' ||
                        confirmingOrderId === order.order_id ||
                        !order.shipping_details
                      }
                      className="w-full"
                      variant={
                        order.confirm_order_status === 'Pending'
                          ? 'default' 
                          : 'outline'
                      }
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      {order.confirm_order_status === 'Pending'
                        ? confirmingOrderId === order.order_id
                          ? 'Confirming...'
                          : 'Confirm Order'
                        : order.confirm_order_status === 'Confirmed'
                        ? 'Order Confirmed'
                        : order.confirm_order_status === 'Cancelled'
                        ? 'Cancelled'
                        : !order.shipping_details
                        ? 'No Shipping Details'
                        : 'Confirm Order'
                      }
                    </Button>
                    
                    {/* Manifest Order Button - Only for admin */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManifestOrderClick(order.order_id);
                      }}
                      disabled={
                        order.confirm_order_status !== 'Confirmed' ||
                        order.delivery_status === 'Shipped' ||
                        manifestingOrderId === order.order_id
                      }
                      className="w-full"
                      variant="outline"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {order.delivery_status === 'Shipped'
                        ? 'Manifest Completed'
                        : manifestingOrderId === order.order_id
                        ? 'Creating Manifest...'
                        : 'Manifest Order'
                      }
                    </Button>
                  </div>
                )}

                {/* Track Order Button - For both user and admin */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackOrder(order.order_id, order.delivery_status);
                    }}
                    disabled={
                      order.confirm_order_status === 'Cancelled' ||
                      order.delivery_status === 'Cancelled'
                    }
                    variant="outline"
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                </div>

                {/* Cancel Order Button - For both user and admin */}
                {order.confirm_order_status !== 'Cancelled' && order.delivery_status !== 'Cancelled' && (
                  <div className="mt-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelOrderClick(order.order_id);
                      }}
                      disabled={
                        order.confirm_order_status === 'Cancelled' ||
                        order.delivery_status === 'Cancelled' ||
                        cancellingOrderId === order.order_id ||
                        order.delivery_status === 'Delivered'
                      }
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {cancellingOrderId === order.order_id
                        ? 'Cancelling...'
                        : 'Cancel Order'
                      }
                    </Button>
                  </div>
                )}
                
                {/* Show Order Cancelled message when cancelled */}
                {(order.confirm_order_status === 'Cancelled' || order.delivery_status === 'Cancelled') && (
                  <div className="mt-3">
                    <div className="w-full px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-center">
                      <p className="text-red-600 font-medium">Order Cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Confirm Order */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Shipment</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to proceed with the shipment for Order #{pendingOrderId}? 
              This will create a shipment and create the order in BigShip.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingOrderId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOrder}>Yes, Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Manifest Order */}
      <AlertDialog open={showManifestDialog} onOpenChange={setShowManifestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Manifest</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to create manifest for Order #{pendingManifestOrderId}? 
              This will generate the shipping manifest for this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingManifestOrderId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleManifestOrder}>Yes, Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Cancel Order */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel Order #{pendingCancelOrderId}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingCancelOrderId(null)}>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manifest Response Modal for Admin */}
      {showManifestResponseModal && manifestResponse && (isAdmin() || isSuperAdmin()) && (
        <Dialog open={showManifestResponseModal} onOpenChange={setShowManifestResponseModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manifest API Response</DialogTitle>
              <DialogDescription>
                Response from manifest order API
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                  {JSON.stringify(manifestResponse, null, 2)}
                </pre>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => {
                  setShowManifestResponseModal(false);
                  setManifestResponse(null);
                }}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* BigShip Confirmation Modal */}
      <BigShipConfirmModal
        isOpen={modalOpen}
        onClose={closeModal}
        status={modalStatus}
        errorMessage={modalError}
        orderData={modalData}
        fullResponse={fullResponse}
      />

      {/* Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Track Order #{trackingOrderId}</DialogTitle>
            <DialogDescription>
              {trackingLoading ? 'Fetching tracking information...' : 'Order tracking details'}
            </DialogDescription>
          </DialogHeader>
          
          {trackingLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
              <p className="text-gray-600">Loading tracking information...</p>
            </div>
          ) : trackingError ? (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{trackingError}</p>
              </div>
            </div>
          ) : trackingData && trackingData.delivery_status === 'Shipped' ? (
            <div className="space-y-6 py-4">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-medium text-gray-800">#{trackingData.order_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Order Status:</span>
                    <p className="font-medium text-gray-800">{trackingData.order_status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Delivery Status:</span>
                    <p className="font-medium text-green-600">{trackingData.delivery_status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Courier:</span>
                    <p className="font-medium text-gray-800">{trackingData.courier}</p>
                  </div>
                  {trackingData.awb && (
                    <div className="col-span-2">
                      <span className="text-gray-600">AWB Number:</span>
                      <p className="font-medium text-gray-800 font-mono">{trackingData.awb}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Details */}
              {trackingData.tracking && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Tracking Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{trackingData.tracking.current_status}</p>
                        {trackingData.tracking.last_location && (
                          <p className="text-sm text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {trackingData.tracking.last_location}
                          </p>
                        )}
                        {trackingData.tracking.last_updated && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last updated: {new Date(trackingData.tracking.last_updated).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                    {trackingData.tracking.expected_delivery && (
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <p className="text-sm text-gray-600">Expected Delivery:</p>
                        <p className="font-semibold text-blue-700">
                          {new Date(trackingData.tracking.expected_delivery).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Label URL */}
              {trackingData.label_url && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Shipping Label</h3>
                  <a
                    href={trackingData.label_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Download Shipping Label
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Confirmed</h3>
                <p className="text-gray-600">
                  You will get tracking details soon. Thank you.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
