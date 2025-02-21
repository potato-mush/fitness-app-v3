import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      const result = await login(credentials.email, credentials.password);
      if (mounted.current) {
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      if (mounted.current) {
        setError('An unexpected error occurred');
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [credentials.email, credentials.password, login, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mounted.current) {
      setError('');
      setIsLoading(true);
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className="form-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
