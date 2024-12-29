import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase'; // Assuming you have this function for Google sign-in
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Start = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Store form data in localStorage
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
      
      // Show success message
       Swal.fire({
        icon: 'success',
        title: 'Account Created Successfully!',
        text: 'Please sign in with your credentials',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Navigate to sign in page
      navigate('/signin');
    } catch (error) {
      console.error('Error during account creation:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message || 'Failed to create account'
      });
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle()
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Google user:', user);
        // Store user data in localStorage
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName);
        navigate('/Home');
      })
      .catch((error) => {
        console.error('Error during Google sign-in:', error.message);
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="bg-white rounded shadow p-4 position-relative w-100" style={{ maxWidth: '400px' }}>
        <button
          className="btn-close position-absolute top-0 end-0 m-2"
          aria-label="Close"
          onClick={() => navigate('/')}
        ></button>

        <h2 className="text-center mb-4">Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
          >
            Create Account
          </button>

          <div className="text-center mb-3">
            <a href="/signin" className="text-primary">or, Sign In</a>
          </div>

          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleGoogleSignIn}
            >
              Sign up with Google
            </button>
          </div>

          <p className="text-center text-muted mt-3">
            By signing up, you agree to our <a href="?" className="text-primary">Terms & conditions</a>, <a href="?" className="text-primary">Privacy policy</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Start;
