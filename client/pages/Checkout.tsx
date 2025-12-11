import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Zap, DollarSign, Clock, Package, CheckCircle2 } from 'lucide-react';
import config from '../config';

// Shipping rate interface
interface ShippingRate {
  courier_id: number;
  courier_name: string;
  courier_type: string;
  zone: string;
  tat: number;
  billable_weight: number;
  total_shipping_charges: number;
  courier_charge: number;
}

interface ShippingRatesResponse {
  success: boolean;
  message: string;
  cheapest: ShippingRate | null;
  fastest: ShippingRate | null;
  all_couriers: ShippingRate[];
}

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-scroll on mobile to skip blank header space
  useEffect(() => {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        window.scrollTo({ top: 220, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // Track order id and total for success message
  const [orderId, setOrderId] = useState<string | number | null>(null);
  const [orderTotal, setOrderTotal] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Shipping rate states
  const [shippingRates, setShippingRates] = useState<ShippingRatesResponse | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<'cheapest' | 'fastest' | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Calculate shipping rates after payment method is selected
  const calculateShippingRates = async () => {
    if (!address.pincode) {
      setShippingError('Please enter pincode first');
      return;
    }

    setShippingLoading(true);
    setShippingError('');
    setShippingRates(null);
    setSelectedShipping(null);

    try {
      const totalAmount = getTotalPrice();
      
      const payload = {
        shipment_category: "b2c",
        payment_type: paymentMethod === 'cod' ? "cod" : "prepaid",
        pickup_pincode: 410206,
        destination_pincode: parseInt(address.pincode),
        shipment_invoice_amount: totalAmount,
        box_details: [
          {
            each_box_dead_weight: 0.5,
            each_box_length: 20,
            each_box_width: 15,
            each_box_height: 10,
            each_box_invoice_amount: totalAmount,
            box_count: 1,
            product_details: items.map(item => ({
              product_category: "Decoration",
              product_name: item.name,
              product_quantity: item.quantity,
              each_product_invoice_amount: item.price,
              hsn: "9505"
            }))
          }
        ]
      };

      const response = await fetch(config.BIGSHIP_CALCULATE_RATES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data: ShippingRatesResponse = await response.json();
        if (data.success) {
          setShippingRates(data);
        } else {
          setShippingError(data.message || 'Unable to fetch shipping rates');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setShippingError(errorData.message || 'Failed to calculate shipping rates');
      }
    } catch (error) {
      console.error('Shipping rate error:', error);
      setShippingError('Unable to calculate shipping rates. Please try again.');
    } finally {
      setShippingLoading(false);
    }
  };

  // Calculate shipping cost
  const getShippingCost = () => {
    if (!shippingRates || !selectedShipping) return 0;
    const rate = selectedShipping === 'cheapest' ? shippingRates.cheapest : shippingRates.fastest;
    return rate?.total_shipping_charges || 0;
  };

  const shippingCost = getShippingCost();
  const finalTotal = getTotalPrice() + shippingCost;

  // Check if address is complete
  const isAddressComplete = address.fullName && address.phone && address.addressLine1 && 
                            address.city && address.state && address.pincode;

  // Check if payment is selected
  const isPaymentSelected = paymentMethod !== '';

  // Check if shipping is selected
  const isShippingSelected = selectedShipping !== null;

  // Handle payment method change - calculate shipping rates
  const handlePaymentChange = (method: string) => {
    setPaymentMethod(method);
    if (isAddressComplete) {
      // Recalculate shipping rates when payment method changes
      setTimeout(() => {
        calculateShippingRates();
      }, 100);
    }
  };

  const handleOrderConfirm = async () => {
    if (!isAddressComplete) {
      alert('Please complete the shipping address');
      return;
    }
    if (!isPaymentSelected) {
      alert('Please select a payment method');
      return;
    }
    if (!isShippingSelected) {
      alert('Please select a shipping option');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod.toUpperCase(),
        shipping_address: {
          name: address.fullName,
          phone: address.phone,
          address: address.addressLine2 
            ? `${address.addressLine1}, ${address.addressLine2}`
            : address.addressLine1,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        }
      };

      const response = await fetch(config.PLACE_ORDER, {
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
        setOrderTotal(result.total);
        setShowSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || errorData.message || 'Order failed. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Order failed. Please check your connection and try again.');
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

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">
            Order Placed Successfully!
          </h2>
          {orderId && (
            <p className="text-lg font-bold text-gray-700 mb-2">
              Order ID: #{orderId}
            </p>
          )}
          {orderTotal && (
            <p className="text-xl font-semibold text-pink-600 mb-4">
              Total Amount: ₹{parseFloat(orderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will receive a confirmation shortly.
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Shipping Address</h2>
              {isAddressComplete && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
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
                <Label htmlFor="phone">Phone *</Label>
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

            <div className="mt-4">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={address.addressLine1}
                onChange={(e) =>
                  setAddress({ ...address, addressLine1: e.target.value })
                }
                required
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                value={address.addressLine2}
                onChange={(e) =>
                  setAddress({ ...address, addressLine2: e.target.value })
                }
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="city">City *</Label>
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
                <Label htmlFor="state">State *</Label>
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
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={address.pincode}
                  onChange={(e) => {
                    setAddress({ ...address, pincode: e.target.value });
                    // Reset shipping rates when pincode changes
                    setShippingRates(null);
                    setSelectedShipping(null);
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          {isAddressComplete && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                {isPaymentSelected && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <div className="space-y-3">
                {[
                  { id: 'cod', label: 'Cash on Delivery (COD)' },
                  { id: 'upi', label: 'UPI Payment' },
                  { id: 'card', label: 'Credit/Debit Card' }
                ].map((method) => (
                  <label 
                    key={method.id} 
                    className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => handlePaymentChange(e.target.value)}
                      className="text-pink-500"
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Selection Section */}
          {isAddressComplete && isPaymentSelected && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Select Shipping Option</h2>
                {isShippingSelected && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              {shippingLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Calculating shipping rates...</p>
                </div>
              ) : shippingError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{shippingError}</p>
                  <Button 
                    onClick={calculateShippingRates} 
                    variant="outline" 
                    className="mt-3"
                  >
                    Retry
                  </Button>
                </div>
              ) : shippingRates ? (
                <div className="space-y-4">
                  {/* Cheapest Option */}
                  {shippingRates.cheapest && (
                    <label 
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedShipping === 'cheapest' 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping === 'cheapest'}
                        onChange={() => setSelectedShipping('cheapest')}
                        className="mt-1 text-pink-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-600">Cheapest Option</span>
                        </div>
                        <h3 className="font-medium text-lg">{shippingRates.cheapest.courier_name}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {shippingRates.cheapest.courier_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {shippingRates.cheapest.tat} day(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {shippingRates.cheapest.billable_weight} kg
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-pink-600">
                          ₹{shippingRates.cheapest.total_shipping_charges.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </label>
                  )}

                  {/* Fastest Option */}
                  {shippingRates.fastest && shippingRates.fastest.courier_id !== shippingRates.cheapest?.courier_id && (
                    <label 
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedShipping === 'fastest' 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping === 'fastest'}
                        onChange={() => setSelectedShipping('fastest')}
                        className="mt-1 text-pink-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-5 h-5 text-orange-500" />
                          <span className="font-semibold text-orange-500">Fastest Option</span>
                        </div>
                        <h3 className="font-medium text-lg">{shippingRates.fastest.courier_name}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {shippingRates.fastest.courier_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {shippingRates.fastest.tat} day(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {shippingRates.fastest.billable_weight} kg
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-pink-600">
                          ₹{shippingRates.fastest.total_shipping_charges.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </label>
                  )}

                  {!selectedShipping && (
                    <p className="text-sm text-amber-600 mt-2">* Please select a shipping option to continue</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={calculateShippingRates} variant="outline">
                    Calculate Shipping Rates
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {selectedShipping && shippingRates && (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shippingCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              
              {!selectedShipping && (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
              )}
              
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-pink-600">
                  ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Items ({items.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate">{item.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleOrderConfirm}
              disabled={isLoading || !isAddressComplete || !isPaymentSelected || !isShippingSelected}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
