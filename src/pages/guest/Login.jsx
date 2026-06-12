import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getDashboardPathByRole, loginWithEmailAndPassword } from '../../services/authService';
import './Login.css';

export default function Login() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      // Connect to json-server via loginWithEmailAndPassword
      const user = await loginWithEmailAndPassword(formData.email, formData.password);
      const fallbackPath = getDashboardPathByRole(user.role);
      const redirectPath = location.state?.from?.pathname || fallbackPath;

      navigate(redirectPath, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Login failed. Please try again.');
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="login-page-wrapper">
      {/* Background Shapes */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
      <div className="bg-shape shape-4"></div>
      <div className="dot dot-1"></div>
      <div className="dot dot-2"></div>
      <div className="dot dot-3"></div>

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon">
            <div className="brand-dot"></div>
            <div className="brand-dot"></div>
            <div className="brand-dot"></div>
            <div className="brand-dot"></div>
          </div>
          <div className="brand-text">
            IELTS<br />MASTER
          </div>
        </div>

        <h1>Sign in</h1>
        <div className="login-card-line"></div>

        <p className="login-subtitle">
          If you don't have a <strong>IELTS Master account</strong> you can <Link to="/register">register</Link> now. It's quick, easy and free.
        </p>

        {error && (
          <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="login-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="login-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="login-forgot-link">
            If you've forgotten your password, you can <a href="#reset">reset</a> it.
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="login-back-link">
            If you're not ready, you can <Link to="/">go back</Link>.
          </div>
        </form>
      </div>
    </div>
  );
}
