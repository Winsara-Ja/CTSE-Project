import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          ⚡ ShopZone
        </Link>

        <div className="navbar-links">
          <Link to="/products" className="nav-link">
            <span>Products</span>
          </Link>

          {user ? (
            <>
              <Link to="/cart" className="nav-link">
                🛒 <span>Cart</span>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className="nav-link">
                <span>Orders</span>
              </Link>
              <button onClick={handleLogout} className="nav-btn nav-btn-ghost">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="nav-btn nav-btn-ghost">Login</button>
              </Link>
              <Link to="/register">
                <button className="nav-btn nav-btn-primary">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
