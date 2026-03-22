import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h3>Please Login</h3>
          <p>You need to be logged in to view your cart.</p>
          <Link to="/login"><button className="btn btn-primary" style={{ width: 'auto', marginTop: '1rem' }}>Login</button></Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Add some products to get started!</p>
          <Link to="/products"><button className="btn btn-primary" style={{ width: 'auto', marginTop: '1rem' }}>Browse Products</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-image">📦</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">${item.price.toFixed(2)}</div>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeFromCart(item._id)}
                  style={{ width: 'auto', marginLeft: '0.5rem' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="summary-row">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: 'var(--success)' }}>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
