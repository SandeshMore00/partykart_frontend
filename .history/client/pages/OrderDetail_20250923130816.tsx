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




import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


interface Product {
  buy_product_id: number;
  quantity: number;
  price: number;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  product: {
    product_id: number;
    product_name: string;
    product_price: number;
    product_description: string;
    product_image: string[];
  };
  category: { category_id: number | null; category_name: string | null };
  sub_category: { sub_category_id: number | null; sub_category_name: string | null };
}

interface OrderDetails {
  order_alert_id: number;
  order_id: number;
  delivery_status: string;
  total_amount: number;
  created_at: string;
  products: Product[];
}

export default function OrderDetailPage() {
  const { orderAlertId } = useParams<{ orderAlertId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchOrderDetail();
  }, [orderAlertId, user]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError("");
    try {
      // const res = await fetch(`http://localhost:9024/v1/order_alert/details/${orderAlertId}`, {
      const res = await fetch(`${config.ORDER_ALERT_SERVICE_URL}/v1/order_alert/details/${orderAlertId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 1) setOrder(result.data);
      else setError("Order details not found");
    } catch {
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>

      {loading ? (
        <p>Loading order details...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : order ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Order #{order.order_id}</h2>
            <p className="text-gray-500 mb-4">Placed on {new Date(order.created_at).toLocaleString("en-IN")}</p>
            <p className="font-semibold mb-2">Delivery Status: {order.delivery_status}</p>
            <p className="font-semibold mb-4">Total Amount: ₹{order.total_amount}</p>

            <h3 className="text-lg font-semibold mb-2">Products:</h3>
            <div className="space-y-4">
              {order.products.map((p) => (
                <div key={p.buy_product_id} className="border p-4 rounded-lg flex flex-col md:flex-row md:justify-between">
                  <div>
                    <p className="font-semibold">{p.product.product_name}</p>
                    <p>Quantity: {p.quantity}</p>
                    <p>Price: ₹{p.price}</p>
                    <p>Category: {p.category.category_name || "-"}</p>
                    <p>Sub-Category: {p.sub_category.sub_category_name || "-"}</p>
                  </div>
                  <div>
                    <p>Payment Method: {p.payment_method}</p>
                    <p>Payment Status: {p.payment_status}</p>
                    <p>Shipping Address: {p.shipping_address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No details found.</p>
      )}
    </div>
  );
}
