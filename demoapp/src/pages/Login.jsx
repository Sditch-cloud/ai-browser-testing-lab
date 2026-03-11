import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (login(username, password)) {
      if (rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({ username }));
      }
      navigate('/dashboard');
    } else {
      setError('Invalid username or password. Try demo/123456');
    }

    setLoading(false);
  };

  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    if (remembered) {
      const { username: savedUsername } = JSON.parse(remembered);
      setUsername(savedUsername);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">AI Testing Demo</h1>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="login-username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="login-password"
              required
            />
          </div>

          <div className="form-group checkbox">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              data-testid="login-remember"
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          {error && (
            <div className="error-message" data-testid="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
            data-testid="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-hint">
          <p>Demo Credentials:</p>
          <p>Username: <strong>demo</strong></p>
          <p>Password: <strong>123456</strong></p>
        </div>
      </div>
    </div>
  );
};
