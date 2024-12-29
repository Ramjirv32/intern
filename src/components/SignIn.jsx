import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const SignIn = ({ onClose, onToggleView }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', `${data.user.firstName} ${data.user.lastName}`);

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        timer: 1500,
        showConfirmButton: false
      });

      // Close modal and navigate
      onClose();
      navigate('/Home');
      
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'Invalid credentials'
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded" style={{ maxWidth: '400px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">Sign In</h4>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={loginData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3 position-relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="form-control"
            placeholder="Password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
            onClick={() => setShowPassword(!showPassword)}
            style={{ zIndex: 10, padding: '0.375rem' }}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">
          Sign In
        </button>

        <p className="text-center mb-0">
          Don't have an account?{' '}
          <button 
            type="button"
            className="btn btn-link p-0"
            onClick={onToggleView}
          >
            Create one
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignIn;