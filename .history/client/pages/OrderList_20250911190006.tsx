import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OrderAlert {
  order_alert_id: number;
  buy_product_id: number;
  order_id: number;
  total_amount: number;
  delivery_status: string;
  created_by: number;
  created_at: string;
  updated_by?: number | null;
  updated_at?: string | null;
  is_deleted?: boolean;
  is_canceled?: boolean;
  canceled_by?: number | null;
  canceled_at?: string | null;
}

export default function OrderList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:9024/v1/order_alert/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && Array.isArray(result.data)) {
          setOrders(result.data);
        } else {
          setOrders([]);
        }
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (orderId: number) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {loading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.order_alert_id}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center cursor-pointer hover:bg-pink-50"
              onClick={() => handleOrderClick(order.order_id)}
            >
              <div>
                <div className="font-semibold text-gray-800">Order #{order.order_id}</div>
                <div className="text-sm text-gray-500">Amount: ₹{order.total_amount}</div>
                <div className="text-sm text-gray-500">Status: {order.delivery_status}</div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
