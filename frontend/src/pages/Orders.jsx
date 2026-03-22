import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5003/api/orders?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`http://localhost:5003/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h3>Please Login</h3>
          <p>You need to be logged in to view your orders.</p>
          <Link to="/login"><button className="btn btn-primary" style={{ width: 'auto', marginTop: '1rem' }}>Login</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track and manage your orders</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Orders Yet</h3>
          <p>Place your first order to see it here!</p>
          <Link to="/products"><button className="btn btn-primary" style={{ width: 'auto', marginTop: '1rem' }}>Browse Products</button></Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  <span className={`status-badge status-${order.paymentStatus}`}>
                    {order.paymentStatus === 'paid' ? '💰 Paid' : order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  Total: <span style={{ color: 'var(--success)' }}>${order.totalAmount.toFixed(2)}</span>
                </div>
                {order.status === 'pending' && (
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ width: 'auto' }}
                    onClick={() => handleCancel(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
