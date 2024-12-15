import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import { signInWithGoogle } from '../firebase';
import o from "../images/one.jpg";
import Swal from 'sweetalert2';

const SignIn = ({ onToggleView, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('userEmail', email);
      navigate('/Home');
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Invalid email or password',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result?.user) {
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('userName', result.user.displayName);
        
        onClose();
        navigate('/Home');
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to sign in with Google',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div
      className="p-4 bg-white rounded"
      style={{
        width: window.innerWidth < 576 ? "95%" : "800px",
        maxWidth: "100%",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Sign In</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
          ✕
        </button>
      </div>

      <p className="text-center mb-4" style={{ fontSize: "14px" }}>
        Let's learn, share & inspire each other with our passion for computer engineering.
      </p>

      <div className="row justify-content-center align-items-center">
        <div className="col-12 col-md-6">
          <form onSubmit={handleSignIn} className="mb-3">
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary w-100">
              Sign In
            </button>
          </form>

          <div className="mb-3">
            <button className="btn btn-outline-primary w-100 mb-2">
              <FaFacebookF className="me-2" /> Sign in with Facebook
            </button>
            <button 
              className="btn btn-outline-danger w-100"
              onClick={handleGoogleSignIn}
            >
              <FaGoogle className="me-2" /> Sign in with Google
            </button>
          </div>

          <div className="text-center">
            <small>
              Don't have an account?{" "}
              <button 
                className="btn btn-link p-0 text-primary" 
                onClick={onToggleView}
                style={{ textDecoration: 'none' }}
              >
                Create new for free!
              </button>
            </small>
          </div>
        </div>

        <div className="col-md-6 text-center d-none d-md-block">
          <img
            src={o}
            alt="Illustration"
            className="img-fluid"
            style={{ 
              maxHeight: window.innerWidth < 768 ? '250px' : '320px',
              width: 'auto'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 576px) {
          .form-control {
            font-size: 0.9rem;
            padding: 0.375rem 0.75rem;
          }
          .btn {
            font-size: 0.9rem;
            padding: 0.375rem 0.75rem;
          }
          .col-md-6 {
            padding: 0 10px;
          }
        }

        @media (max-width: 768px) {
          .row {
            margin: 0;
          }
          .col-12 {
            padding: 0;
          }
          .form-control {
            font-size: 14px;
          }
          .btn {
            font-size: 14px;
          }
        }

        /* Ensure form elements are properly spaced */
        .form-control {
          margin-bottom: 1rem;
        }

        /* Make buttons more touch-friendly on mobile */
        @media (max-width: 576px) {
          .btn {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default SignIn;