import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import OffersSelect from './OffersSelect';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Track order id for success message
  const [orderId, setOrderId] = useState<string | number | null>(null);

  // Address form state
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [appliedOffer, setAppliedOffer] = useState(
    null as null | { offer_id: number; offer_name: string; offer_percentage: number }
  );

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  // Calculate offer deduction
  const offerAmount = appliedOffer
    ? Math.round(getTotalPrice() * (appliedOffer.offer_percentage / 100))
    : 0;

  // TODO: Add promo code logic if needed
  const promoAmount = 0;
  const finalTotal = getTotalPrice() - offerAmount - promoAmount;

  const handleOrderConfirm = async () => {
    setIsLoading(true);
    try {
      // Build shipping address string
      const shippingAddress = `${address.addressLine1}, ${address.addressLine2}, ${address.city}, ${address.state}, ${address.pincode}`;
      // Build payload as array
      const payload = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        promocode_id: appliedOffer?.offer_id || null,
        shipping_address: shippingAddress,
        payment_method: paymentMethod.toUpperCase(),
        payment_status: 'Pending'
      }));

      const response = await fetch('http://localhost:9020/v1/buy-product/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        clearCart();
        setOrderId(result.order_id);
        setStep(4);
      } else {
        alert('Order failed. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Order failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to checkout</h1>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      
      {/* Progress Steps */}
      <div className="flex mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= stepNum ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < 4 && <div className={`flex-1 h-1 ${
              step > stepNum ? 'bg-pink-500' : 'bg-gray-200'
            }`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={address.fullName}
                onChange={(e) =>
                  setAddress({ ...address, fullName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={address.addressLine1}
              onChange={(e) =>
                setAddress({ ...address, addressLine1: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              value={address.addressLine2}
              onChange={(e) =>
                setAddress({ ...address, addressLine2: e.target.value })
              }
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </form>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          
          <div className="space-y-3">
            {[
              { id: 'cod', label: 'Cash on Delivery (COD)' },
              { id: 'upi', label: 'UPI Payment' },
              { id: 'card', label: 'Credit/Debit Card' }
              // { id: 'wallet', label: 'Digital Wallet' }
            ].map((method) => (
              <label key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-pink-500"
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back to Address
            </Button>
            <Button type="submit" className="flex-1">Continue to Review</Button>
          </div>
        </form>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Order Review</h2>
          <OffersSelect onApply={setAppliedOffer} appliedOfferId={appliedOffer?.offer_id} />
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Items ({items.length})</h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between">
              <span>Offer Amount</span>
              <span className="text-green-600">-₹{offerAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Promocode Amount</span>
              <span className="text-green-600">-₹{promoAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back to Payment
            </Button>
            <Button 
              onClick={handleOrderConfirm} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Placing Order...' : 'Confirm Order'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center py-8">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold mb-4">
            Order Placed Successfully!
          </h2>
          {orderId && (
            <p className="text-lg font-bold text-gray-700 mb-2">
              Order ID: {orderId}
            </p>
          )}
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will receive a confirmation shortly.
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      )}
    </div>
  );
}
