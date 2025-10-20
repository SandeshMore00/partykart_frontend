// import { useEffect, useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Package, ShoppingCart, ArrowLeft } from 'lucide-react';

// interface OrderAlert {
//   order_alert_id: number;
//   buy_product_id: number;
//   order_id: number;
//   total_amount: number;
//   delivery_status: string;
//   created_by: number;
//   created_at: string;
//   updated_by?: number | null;
//   updated_at?: string | null;
//   is_deleted?: boolean;
//   is_canceled?: boolean;
//   canceled_by?: number | null;
//   canceled_at?: string | null;
// }

// export default function OrderList() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState<OrderAlert[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await fetch('http://localhost:9024/v1/order_alert/', {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${user?.token}`,
//         },
//       });
//       if (response.ok) {
//         const result = await response.json();
//         if (result.status === 1 && Array.isArray(result.data)) {
//           setOrders(result.data);
//         } else {
//           setOrders([]);
//         }
//       } else {
//         setError('Failed to fetch orders');
//       }
//     } catch (err) {
//       setError('Failed to fetch orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOrderClick = (orderId: number) => {
//     navigate(`/order/${orderId}`);
//   };

//   // Redirect to home if user is not logged in
//   useEffect(() => {
//     if (!user) {
//       navigate('/');
//     }
//   }, [user, navigate]);

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="ghost"
//             onClick={() => navigate(-1)}
//             className="flex items-center space-x-2"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             <span>Back</span>
//           </Button>
//           <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
//         </div>
//         <Button
//           onClick={fetchOrders}
//           disabled={loading}
//           className="flex items-center space-x-2"
//         >
//           <Package className="w-4 h-4" />
//           <span>{loading ? 'Loading...' : 'Refresh'}</span>
//         </Button>
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
//           <span className="ml-4 text-gray-600">Loading orders...</span>
//         </div>
//       ) : error ? (
//         <div className="text-center py-16">
//           <div className="text-red-500 mb-4">
//             <Package className="w-16 h-16 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold mb-2">Error Loading Orders</h3>
//             <p className="text-gray-600">{error}</p>
//           </div>
//           <Button onClick={fetchOrders} variant="outline">
//             Try Again
//           </Button>
//         </div>
//       ) : orders.length === 0 ? (
//         <div className="text-center py-16">
//           <div className="text-gray-400 mb-6">
//             <Package className="w-24 h-24 mx-auto mb-4" />
//             <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
//             <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
//           </div>
//           <Button
//             onClick={() => navigate('/')}
//             className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center space-x-2"
//           >
//             <ShoppingCart className="w-5 h-5" />
//             <span>Continue Shopping</span>
//           </Button>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {orders.map(order => (
//             <div
//               key={order.order_alert_id}
//               className="bg-white rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
//               onClick={() => handleOrderClick(order.order_id)}
//             >
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center space-x-4">
//                     <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
//                       <Package className="w-6 h-6 text-pink-600" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800">Order #{order.order_id}</h3>
//                       <p className="text-sm text-gray-500">
//                         Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
//                           year: 'numeric',
//                           month: 'long',
//                           day: 'numeric'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       order.delivery_status === 'Delivered' 
//                         ? 'bg-green-100 text-green-800'
//                         : order.delivery_status === 'Undelivered'
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {order.delivery_status}
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-1">Total Amount</h4>
//                     <p className="text-2xl font-bold text-pink-600">₹{order.total_amount.toLocaleString('en-IN')}</p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-1">Order Alert ID</h4>
//                     <p className="text-gray-600">#{order.order_alert_id}</p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-1">Buy Product ID</h4>
//                     <p className="text-gray-600">#{order.buy_product_id}</p>
//                   </div>
//                 </div>

//                 {order.is_canceled && (
//                   <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <h4 className="font-semibold text-red-800 mb-1">Order Canceled</h4>
//                     <p className="text-red-600 text-sm">
//                       This order has been canceled
//                       {order.canceled_at && ` on ${new Date(order.canceled_at).toLocaleDateString('en-IN')}`}
//                     </p>
//                   </div>
//                 )}

//                 <div className="mt-4 pt-4 border-t border-gray-100">
//                   <Button
//                     variant="outline"
//                     className="w-full"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleOrderClick(order.order_id);
//                     }}
//                   >
//                     View Order Details
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";

interface Order {
  order_id: number;
  customer_name: string;
  total_amount: number;
  status: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // toggle for "All Orders"
  const token = "YOUR_BEARER_TOKEN_HERE"; // Replace with your JWT

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:9004/v1/products/orders/list",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (result.status === 1 && result.data) {
        setOrders(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const visibleOrders = showAll ? orders : orders.slice(0, 5); // show only 5 unless "All Orders"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
        Orders
      </h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders available.</div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleOrders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  Order #{order.order_id}
                </h2>
                <p className="text-gray-700">
                  <span className="font-bold">Customer:</span>{" "}
                  {order.customer_name}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Amount:</span> ₹
                  {order.total_amount.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Status:</span> {order.status}
                </p>
              </div>
            ))}
          </div>

          {/* Show "All Orders" button if more than 5 orders */}
          {orders.length > 5 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {showAll ? "Show Less" : "Show All Orders"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
