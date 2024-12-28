import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const SignIn = ({ onToggleView, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('userName', response.data.user.name);
      
      // Update axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      onClose();
      navigate('/Home');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'An error occurred during login'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded" style={{ maxWidth: '800px', width: '90%' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Sign In</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center mt-3">
        <small>
          Don't have an account?{" "}
          <button 
            className="btn btn-link p-0" 
            onClick={onToggleView}
            style={{ textDecoration: 'none' }}
          >
            Create Account
          </button>
        </small>
      </div>
    </div>
  );
};

export default SignIn;