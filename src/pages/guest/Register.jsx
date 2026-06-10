import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerNewUser } from '../../services/authService';
import './Register.css';

export default function Register() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    day: '',
    month: '',
    year: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        dateOfBirth: `${formData.year}-${formData.month}-${formData.day}`
      };

      await registerNewUser(userData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      {/* Background Shapes */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
      <div className="bg-shape shape-4"></div>
      <div className="dot dot-1"></div>
      <div className="dot dot-2"></div>
      <div className="dot dot-3"></div>

      <div className="register-card">
        <div className="register-brand">
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

        <h1>Register for an account</h1>
        <div className="register-card-line"></div>

        <p className="register-subtitle">
          You need an <strong>IELTS Master account</strong> to access our services.<br />
          If you already have an account you can <Link to="/login">sign in</Link>.
        </p>

        {error && (
          <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="register-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password">Password</label>
            <div className="register-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="register-input"
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

          <div className="register-form-group">
            <label>Date of birth</label>
            <div className="dob-description">This is so you access the right content for your age.</div>
            <div className="dob-selects">
              <select name="day" className="dob-select" value={formData.day} onChange={handleChange} required>
                <option value="">Day</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
              <select name="month" className="dob-select" value={formData.month} onChange={handleChange} required>
                <option value="">Month</option>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
              <select name="year" className="dob-select" value={formData.year} onChange={handleChange} required>
                <option value="">Year</option>
                {[...Array(100)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="terms-group">
            <input 
              type="checkbox" 
              id="agreeTerms" 
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="agreeTerms">
              I agree to the account registration <a href="#terms">Terms of Use</a>.
            </label>
          </div>

          <button type="submit" className="register-submit-btn">
            Register for an account
          </button>

          <div className="register-back-link">
            If you're not ready, you can <Link to="/">go back</Link>.
          </div>
        </form>
      </div>
    </div>
  );
}
