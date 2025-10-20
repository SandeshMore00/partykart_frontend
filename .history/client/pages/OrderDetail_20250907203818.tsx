// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';

// interface OrderDetail {
//   buy_product_id: number;
//   order_id: number;
//   product_id: string;
//   product_price: number;
//   category_id: number | null;
//   sub_category_id: number | null;
//   shipping_address: string;
//   payment_method: string;
//   payment_status: string;
//   quantity: number;
//   offer_id: number;
//   offer_percentage: number;
//   promocode_id: number | null;
//   promocode_amount: number;
//   created_by: number;
//   created_at: string;
//   updated_by?: number | null;
//   updated_at?: string | null;
//   is_canceled?: boolean;
//   canceled_by?: number | null;
//   canceled_at?: string | null;
// }

// export default function OrderDetailPage() {
//   const { orderId } = useParams<{ orderId: string }>();
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [details, setDetails] = useState<OrderDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchOrderDetail();
//     // eslint-disable-next-line
//   }, [orderId]);

//   const fetchOrderDetail = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await fetch(`http://localhost:9024/v1/order_alert/${orderId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${user?.token}`,
//         },
//       });
//       if (response.ok) {
//         const result = await response.json();
//         if (result.status === 1 && Array.isArray(result.data)) {
//           setDetails(result.data);
//         } else {
//           setDetails([]);
//         }
//       } else {
//         setError('Failed to fetch order details');
//       }
//     } catch (err) {
//       setError('Failed to fetch order details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <h1 className="text-2xl font-bold mb-6">Order Details</h1>
//       <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
//         Back to Orders
//       </Button>
//       {loading ? (
//         <div>Loading order details...</div>
//       ) : error ? (
//         <div className="text-red-500">{error}</div>
//       ) : details.length === 0 ? (
//         <div className="text-gray-500">No details found for this order.</div>
//       ) : (
//         <div className="space-y-4">
//           {details.map(detail => (
//             <div key={detail.buy_product_id} className="bg-white rounded-lg shadow p-4">
//               <div className="font-semibold text-gray-800 mb-2">Product ID: {detail.product_id}</div>
//               <div className="text-sm text-gray-500 mb-1">Quantity: {detail.quantity}</div>
//               <div className="text-sm text-gray-500 mb-1">Price: ₹{detail.product_price}</div>
//               <div className="text-sm text-gray-500 mb-1">Shipping Address: {detail.shipping_address}</div>
//               <div className="text-sm text-gray-500 mb-1">Payment Method: {detail.payment_method}</div>
//               <div className="text-sm text-gray-500 mb-1">Payment Status: {detail.payment_status}</div>
//               <div className="text-sm text-gray-500 mb-1">Offer: {detail.offer_percentage}%</div>
//               <div className="text-sm text-gray-500 mb-1">Promocode Amount: ₹{detail.promocode_amount}</div>
//               <div className="text-sm text-gray-500 mb-1">Created At: {detail.created_at}</div>
//               {detail.is_canceled && (
//                 <div className="text-red-500 font-bold">Canceled</div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../config"; // make sure ORDER_ALERT_DETAIL is defined here
import { useAuth } from "../contexts/AuthContext";

interface OrderDetail {
  order_id: number;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
  status: string;
}

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId || !user?.token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(config.ORDER_ALERT_DETAIL(orderId), {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }

        const result = await response.json();
        setOrder(result.data); // backend response: {status:1, data: {...}}
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, user?.token]);

  if (loading) {
    return <p className="p-4">Loading order details...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  if (!order) {
    return <p className="p-4">No order details found.</p>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <p><strong>Order ID:</strong> {order.order_id}</p>
      <p><strong>Product:</strong> {order.product_name}</p>
      <p><strong>Quantity:</strong> {order.quantity}</p>
      <p><strong>Price:</strong> ₹{order.price}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Placed on:</strong> {new Date(order.created_at).toLocaleString()}</p>
    </div>
  );
};

export default OrderDetailPage;
