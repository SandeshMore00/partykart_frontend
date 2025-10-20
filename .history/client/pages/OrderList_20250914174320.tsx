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



// import { useEffect, useState } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Package, ShoppingCart, ArrowLeft, List } from "lucide-react";

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
//   const { user, isAdmin, isSuperAdmin } = useAuth();
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState<OrderAlert[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await fetch("http://localhost:9024/v1/order_alert/", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${user?.token}`,
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
//         setError("Failed to fetch orders");
//       }
//     } catch (err) {
//       setError("Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAllOrders = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await fetch(
//         "http://localhost:9024/v1/order_alert/all-order",
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${user?.token}`,
//           },
//         }
//       );
//       if (response.ok) {
//         const result = await response.json();
//         if (result.status === 1 && Array.isArray(result.data)) {
//           setOrders(result.data);
//         } else {
//           setOrders([]);
//         }
//       } else {
//         setError("Failed to fetch all orders");
//       }
//     } catch (err) {
//       setError("Failed to fetch all orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOrderClick = (orderId: number) => {
//     navigate(`/order/${orderId}`);
//   };

//   // Redirect if not logged in
//   useEffect(() => {
//     if (!user) {
//       navigate("/");
//     }
//   }, [user, navigate]);

//   if (!user) return null;

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
//         <div className="flex space-x-3">
//           <Button
//             onClick={fetchOrders}
//             disabled={loading}
//             className="flex items-center space-x-2"
//           >
//             <Package className="w-4 h-4" />
//             <span>{loading ? "Loading..." : "Refresh"}</span>
//           </Button>
//           {(isAdmin() || isSuperAdmin()) && (
//             <Button
//               onClick={fetchAllOrders}
//               disabled={loading}
//               variant="outline"
//               className="flex items-center space-x-2"
//             >
//               <List className="w-4 h-4" />
//               <span>{loading ? "Loading..." : "All Orders"}</span>
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Loading / Error / Empty / Orders */}
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
//             <h3 className="text-2xl font-semibold text-gray-600 mb-2">
//               No Orders Yet
//             </h3>
//             <p className="text-gray-500 mb-6">
//               You haven't placed any orders yet. Start shopping to see your
//               orders here!
//             </p>
//           </div>
//           <Button
//             onClick={() => navigate("/")}
//             className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center space-x-2"
//           >
//             <ShoppingCart className="w-5 h-5" />
//             <span>Continue Shopping</span>
//           </Button>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {orders.map((order) => (
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
//                       <h3 className="text-lg font-semibold text-gray-800">
//                         Order #{order.order_id}
//                       </h3>
//                       <p className="text-sm text-gray-500">
//                         Placed on{" "}
//                         {new Date(order.created_at).toLocaleDateString(
//                           "en-IN",
//                           {
//                             year: "numeric",
//                             month: "long",
//                             day: "numeric",
//                           }
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         order.delivery_status === "Delivered"
//                           ? "bg-green-100 text-green-800"
//                           : order.delivery_status === "Undelivered"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : "bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       {order.delivery_status}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-1">
//                       Total Amount
//                     </h4>
//                     <p className="text-2xl font-bold text-pink-600">
//                       ₹{order.total_amount.toLocaleString("en-IN")}
//                     </p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-1">
//                       Order Alert ID
//                     </h4>
//                     <p className="text-gray-600">#{order.order_alert_id}</p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-1">
//                       Buy Product ID
//                     </h4>
//                     <p className="text-gray-600">#{order.buy_product_id}</p>
//                   </div>
//                 </div>

//                 {order.is_canceled && (
//                   <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <h4 className="font-semibold text-red-800 mb-1">
//                       Order Canceled
//                     </h4>
//                     <p className="text-red-600 text-sm">
//                       This order has been canceled
//                       {order.canceled_at &&
//                         ` on ${new Date(order.canceled_at).toLocaleDateString(
//                           "en-IN"
//                         )}`}
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


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Package, List } from "lucide-react";

// interface OrderAlert {
//   order_alert_id: number;
//   order_id: number;
//   total_amount: number;
//   delivery_status: string;
//   created_at: string;
//   is_canceled?: boolean;
//   canceled_at?: string | null;
// }

// export default function OrderList() {
//   const { user, isAdmin, isSuperAdmin } = useAuth();
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState<OrderAlert[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (user) fetchOrders();
//   }, [user]);

//   const fetchOrders = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch("http://localhost:9024/v1/order_alert/", {
//         headers: { Authorization: `Bearer ${user?.token}` },
//       });
//       const result = await res.json();
//       if (res.ok && result.status === 1) setOrders(result.data);
//       else setOrders([]);
//     } catch {
//       setError("Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAllOrders = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch("http://localhost:9024/v1/order_alert/all-order", {
//         headers: { Authorization: `Bearer ${user?.token}` },
//       });
//       const result = await res.json();
//       if (res.ok && result.status === 1) setOrders(result.data);
//       else setOrders([]);
//     } catch {
//       setError("Failed to fetch all orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOrderClick = (order_alert_id: number) => {
//     navigate(`/order/${order_alert_id}`);
//   };

//   if (!user) return null;

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center space-x-4">
//           <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
//             <ArrowLeft className="w-4 h-4" />
//             <span>Back</span>
//           </Button>
//           <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
//         </div>
//         <div className="flex space-x-3">
//           <Button onClick={fetchOrders} disabled={loading} className="flex items-center space-x-2">
//             <Package className="w-4 h-4" />
//             <span>{loading ? "Loading..." : "My Orders"}</span>
//           </Button>
//           {(isAdmin() || isSuperAdmin()) && (
//             <Button onClick={fetchAllOrders} disabled={loading} variant="outline" className="flex items-center space-x-2">
//               <List className="w-4 h-4" />
//               <span>{loading ? "Loading..." : "All Orders"}</span>
//             </Button>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
//           <span className="ml-4 text-gray-600">Loading orders...</span>
//         </div>
//       ) : error ? (
//         <div className="text-center py-16 text-red-500">{error}</div>
//       ) : orders.length === 0 ? (
//         <div className="text-center py-16 text-gray-500">No orders found.</div>
//       ) : (
//         <div className="space-y-4">
//           {orders.map((order) => (
//             <div
//               key={order.order_alert_id}
//               className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 cursor-pointer hover:shadow-xl"
//               onClick={() => handleOrderClick(order.order_alert_id)}
//             >
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">Order #{order.order_id}</h3>
//               <p className="text-gray-500 mb-1">Placed on {new Date(order.created_at).toLocaleDateString("en-IN")}</p>
//               <p className="font-semibold mb-1">Delivery: {order.delivery_status}</p>
//               <p className="font-semibold mb-1">Total Amount: ₹{order.total_amount}</p>
//               {order.is_canceled && <p className="text-red-500 font-bold">Canceled on {order.canceled_at && new Date(order.canceled_at).toLocaleDateString("en-IN")}</p>}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, List, FileText } from "lucide-react";
import jsPDF from "jspdf";

interface OrderAlert {
  order_alert_id: number;
  order_id: number;
  total_amount: number;
  delivery_status: string;
  created_at: string;
  is_canceled?: boolean;
  canceled_at?: string | null;
  products?: {
    product_name: string;
    quantity: number;
    price: number;
  }[];
}

export default function OrderList() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:9024/v1/order_alert/", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 1) setOrders(result.data);
      else setOrders([]);
    } catch {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:9024/v1/order_alert/all-order", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 1) setOrders(result.data);
      else setOrders([]);
    } catch {
      setError("Failed to fetch all orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order_alert_id: number) => {
    navigate(`/order/${order_alert_id}`);
  };

  // ✅ Generate PDF bill
  const generateBill = (order: OrderAlert) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("The PartyKart", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.order_id}`, 20, 40);
    doc.text(`Date: ${new Date(order.created_at).toLocaleString("en-IN")}`, 20, 50);
    doc.text(`Delivery Status: ${order.delivery_status}`, 20, 60);

    doc.text("Products:", 20, 75);
    order.products?.forEach((p, index) => {
      doc.text(
        `${index + 1}. ${p.product_name} | Qty: ${p.quantity} | Price: ₹${p.price}`,
        25,
        85 + index * 10
      );
    });

    doc.text(`Total Amount: ₹${order.total_amount}`, 20, 100 + (order.products?.length || 0) * 10);
    doc.save(`Order_${order.order_id}_Bill.pdf`);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        </div>
        <div className="flex space-x-3">
          <Button onClick={fetchOrders} disabled={loading} className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>{loading ? "Loading..." : "My Orders"}</span>
          </Button>
          {(isAdmin() || isSuperAdmin()) && (
            <Button onClick={fetchAllOrders} disabled={loading} variant="outline" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>{loading ? "Loading..." : "All Orders"}</span>
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
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_alert_id}
              className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Order #{order.order_id}</h3>
              <p className="text-gray-500 mb-1">Placed on {new Date(order.created_at).toLocaleDateString("en-IN")}</p>
              <p className="font-semibold mb-1">Delivery: {order.delivery_status}</p>
              <p className="font-semibold mb-1">Total Amount: ₹{order.total_amount}</p>
              {order.is_canceled && <p className="text-red-500 font-bold">Canceled on {order.canceled_at && new Date(order.canceled_at).toLocaleDateString("en-IN")}</p>}

              <div className="mt-4 flex space-x-2">
                <Button variant="outline" onClick={() => handleOrderClick(order.order_alert_id)}>
                  View Details
                </Button>
                {(isAdmin() || isSuperAdmin()) && (
                  <Button variant="secondary" onClick={() => generateBill(order)}>
                    <FileText className="w-4 h-4 mr-1" /> Generate Bill
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
