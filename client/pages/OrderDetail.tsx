import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import config from '../config';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: string;
  subtotal: string;
}

interface ShippingDetails {
  tat: number;
  zone: string;
  courier_id: number;
  courier_name: string;
  courier_type: string;
  total_shipping_charges: number;
}

interface OrderDetails {
  order_id: number;
  total: string;
  status: string;
  total_shipping_charges?: number;
  shipping_details?: ShippingDetails;
  created_at?: string;
  items: OrderItem[];
  // Legacy fields for backward compatibility
  total_amount?: string;
  final_amount?: string;
  payment_status?: string;
  delivery_status?: string;
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && orderId) fetchOrderDetail();
    else if (!user) navigate('/');
  }, [orderId, user]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(config.ORDER_DETAIL(orderId!), {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}` 
        },
      });
      if (res.ok) {
        const result = await res.json();
        setOrder(result);
      } else {
        setError("Order details not found");
      }
    } catch {
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-6 flex items-center space-x-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Button>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <span className="ml-4 text-gray-600 mt-4">Loading order details...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <Package className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Order</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={fetchOrderDetail} variant="outline">
            Try Again
          </Button>
        </div>
      ) : order ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            {/* Order Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                  Order #{order.order_id}
                </h2>
                {order.created_at && (
                  <p className="text-sm text-gray-500 mb-3">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    (order.payment_status || order.status) === 'Completed' || (order.payment_status || order.status) === 'Paid'
                      ? 'bg-green-100 text-green-800'
                      : (order.payment_status || order.status) === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : (order.payment_status || order.status) === 'Failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    Status: {order.status || order.payment_status || 'Pending'}
                  </div>
                  {order.delivery_status && (
                  <div className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    order.delivery_status === 'Delivered' 
                      ? 'bg-green-100 text-green-800'
                      : order.delivery_status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : order.delivery_status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    Delivery: {order.delivery_status}
                  </div>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                <p className="text-2xl sm:text-3xl font-bold text-pink-600">
                  ₹{(order.total || order.final_amount) && !isNaN(parseFloat(order.total || order.final_amount || '0')) 
                    ? parseFloat(order.total || order.final_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0.00'
                  }
                </p>
              </div>
            </div>

            {/* Order Items - Responsive */}
            <div className="border-t pt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const pricePerUnit = (item.price || item.price_per_unit) && !isNaN(parseFloat(item.price || item.price_per_unit || '0')) 
                    ? parseFloat(item.price || item.price_per_unit || '0') 
                    : 0;
                  const subtotal = item.subtotal && !isNaN(parseFloat(item.subtotal)) ? parseFloat(item.subtotal) : 0;
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-2 truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Price: ₹{(item.price || item.price_per_unit) && !isNaN(parseFloat(item.price || item.price_per_unit || '0')) 
                            ? parseFloat(item.price || item.price_per_unit || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '0.00'
                          }</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Subtotal</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-800">
                          ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Details */}
            {order.shipping_details && (
              <div className="border-t mt-6 pt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Shipping Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm sm:text-base">
                    <div>
                      <span className="text-gray-600 block mb-1">Courier:</span>
                      <p className="font-medium text-gray-800">{order.shipping_details.courier_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Type:</span>
                      <p className="font-medium text-gray-800">{order.shipping_details.courier_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Zone:</span>
                      <p className="font-medium text-gray-800">{order.shipping_details.zone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">TAT:</span>
                      <p className="font-medium text-gray-800">{order.shipping_details.tat} day(s)</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Shipping Charges:</span>
                      <p className="font-medium text-green-600">
                        ₹{order.shipping_details.total_shipping_charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Courier ID:</span>
                      <p className="font-medium text-gray-800">{order.shipping_details.courier_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Total - Responsive */}
            <div className="border-t mt-6 pt-6">
              <div className="space-y-3">
                {/* Calculate subtotal from items */}
                {(() => {
                  const itemsSubtotal = order.items.reduce((sum, item) => {
                    const subtotal = item.subtotal && !isNaN(parseFloat(item.subtotal)) ? parseFloat(item.subtotal) : 0;
                    return sum + subtotal;
                  }, 0);
                  
                  // Use shipping_details.total_shipping_charges if available, otherwise fallback to order.total_shipping_charges
                  const shippingCharges = order.shipping_details?.total_shipping_charges ?? order.total_shipping_charges;
                  
                  return (
                    <>
                  <div className="flex justify-between items-center text-gray-600">
                        <span className="text-sm sm:text-base">Subtotal:</span>
                    <span className="text-base sm:text-lg font-semibold">
                          ₹{itemsSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {shippingCharges !== undefined && shippingCharges !== null && (
                        <div className="flex justify-between items-center text-gray-600">
                          <span className="text-sm sm:text-base">Delivery Charges:</span>
                          <span className="text-base sm:text-lg font-semibold text-green-600">
                            ₹{shippingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-base sm:text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-xl sm:text-2xl font-bold text-pink-600">
                          ₹{(order.total || order.final_amount) && !isNaN(parseFloat(order.total || order.final_amount || '0'))
                            ? parseFloat(order.total || order.final_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'
                    }
                  </span>
                </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-16">No details found.</p>
      )}
    </div>
  );
}
