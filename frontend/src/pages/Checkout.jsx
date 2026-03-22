import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardLast4, setCardLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: success
  const [orderResult, setOrderResult] = useState(null);

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create order via Order Service
      const orderRes = await fetch('http://localhost:5003/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          shippingAddress: address,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError(orderData.message || 'Failed to create order');
        setLoading(false);
        return;
      }

      // Step 2: Process payment via Payment Service
      const paymentRes = await fetch('http://localhost:5004/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: orderData.data._id,
          amount: orderData.data.totalAmount,
          method: paymentMethod,
          cardLast4: cardLast4 || '4242',
        }),
      });

      const paymentData = await paymentRes.json();

      setOrderResult({
        order: orderData.data,
        payment: paymentData.data,
        paymentSuccess: paymentData.success,
      });

      if (paymentData.success) {
        clearCart();
      }

      setStep(3);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Checkout</h1>
        <p>
          {step === 1 && 'Step 1: Shipping Address'}
          {step === 2 && 'Step 2: Payment'}
          {step === 3 && 'Order Complete'}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 1 && (
        <div className="payment-container">
          <div className="payment-form">
            <h3>📍 Shipping Address</h3>
            <div className="form-group">
              <label>Street Address</label>
              <input className="form-input" placeholder="123 Main St" value={address.street} onChange={(e) => handleAddressChange('street', e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input className="form-input" placeholder="Colombo" value={address.city} onChange={(e) => handleAddressChange('city', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input className="form-input" placeholder="Western" value={address.state} onChange={(e) => handleAddressChange('state', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input className="form-input" placeholder="00100" value={address.zipCode} onChange={(e) => handleAddressChange('zipCode', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input className="form-input" placeholder="Sri Lanka" value={address.country} onChange={(e) => handleAddressChange('country', e.target.value)} required />
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (address.street && address.city && address.state && address.zipCode && address.country) {
                  setStep(2);
                } else {
                  setError('Please fill in all address fields');
                }
              }}
              style={{ marginTop: '0.5rem' }}
            >
              Continue to Payment →
            </button>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item._id} className="summary-row">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="payment-container">
          <div className="payment-form">
            <h3>💳 Payment Method</h3>
            <div className="payment-methods">
              {['credit_card', 'debit_card', 'paypal', 'bank_transfer'].map((method) => (
                <button
                  key={method}
                  className={`payment-method ${paymentMethod === method ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method === 'credit_card' && '💳 Credit Card'}
                  {method === 'debit_card' && '🏧 Debit Card'}
                  {method === 'paypal' && '🅿️ PayPal'}
                  {method === 'bank_transfer' && '🏦 Bank Transfer'}
                </button>
              ))}
            </div>

            {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
              <>
                <div className="form-group">
                  <label>Card Number</label>
                  <input className="form-input" placeholder="•••• •••• •••• 4242" disabled value="•••• •••• •••• 4242" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry</label>
                    <input className="form-input" placeholder="MM/YY" disabled value="12/28" />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input className="form-input" placeholder="•••" disabled value="•••" />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
              </button>
            </div>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item._id} className="summary-row">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {step === 3 && orderResult && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            {orderResult.paymentSuccess ? (
              <>
                <div style={{ textAlign: 'center', fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--success)' }}>Payment Successful!</h2>
                <p className="subtitle">Your order has been confirmed</p>
                <div className="summary-row">
                  <span>Order ID</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{orderResult.order._id}</span>
                </div>
                <div className="summary-row">
                  <span>Transaction ID</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{orderResult.payment.transactionId}</span>
                </div>
                <div className="summary-row">
                  <span>Amount Paid</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>${orderResult.order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Status</span>
                  <span className="status-badge status-confirmed">Confirmed</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
                <h2 style={{ color: 'var(--danger)' }}>Payment Failed</h2>
                <p className="subtitle">{orderResult.payment?.failureReason || 'Payment was declined'}</p>
              </>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/orders')} style={{ marginTop: '1.5rem' }}>
              View Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
