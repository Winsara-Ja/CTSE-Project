import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <section className="hero">
        <h1>Shop Smarter,<br />Not Harder</h1>
        <p>
          Discover premium products at unbeatable prices. Built with a modern
          microservices architecture for lightning-fast performance.
        </p>
        <div className="hero-actions">
          <Link to="/products">
            <button className="btn btn-primary" style={{ width: 'auto', padding: '0.85rem 2rem' }}>
              Browse Products →
            </button>
          </Link>
          {!user && (
            <Link to="/register">
              <button className="btn btn-secondary" style={{ padding: '0.85rem 2rem' }}>
                Create Account
              </button>
            </Link>
          )}
        </div>
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-value">4</div>
            <div className="stat-label">Microservices</div>
          </div>
          <div className="stat">
            <div className="stat-value">REST</div>
            <div className="stat-label">API Design</div>
          </div>
          <div className="stat">
            <div className="stat-value">JWT</div>
            <div className="stat-label">Authentication</div>
          </div>
          <div className="stat">
            <div className="stat-value">Docker</div>
            <div className="stat-label">Containerized</div>
          </div>
        </div>
      </section>

      <div className="page-container">
        <div className="product-grid" style={{ marginTop: '1rem' }}>
          {[
            { icon: '🔐', title: 'User Service', desc: 'Authentication, JWT tokens, and user profile management' },
            { icon: '📦', title: 'Product Service', desc: 'Full product catalog with search, filter, and stock management' },
            { icon: '🛍️', title: 'Order Service', desc: 'Order processing with real-time stock verification' },
            { icon: '💳', title: 'Payment Service', desc: 'Secure payment processing with transaction tracking' },
          ].map((service, i) => (
            <div key={i} className="product-card" style={{ cursor: 'default' }}>
              <div className="product-image" style={{ fontSize: '4rem', height: '140px' }}>
                {service.icon}
              </div>
              <div className="product-info">
                <div className="product-name">{service.title}</div>
                <div className="product-description" style={{ WebkitLineClamp: 3 }}>
                  {service.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
