import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const CreateAccount = ({ onToggleView, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem('userEmail', email);
      navigate('/signin');
    } catch (error) {
      setError('Error creating account');
    }
  };

  return (
    <div className="auth-modal">
      <div className="modal-content p-4">
        <button className="close-button" onClick={onClose}>✕</button>
        <div className="text-center mb-4">
          <h5>Let's learn, share & inspire each other with our passion for computer engineering. Sign up now 👋</h5>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Create Account</h3>
          <button className="btn btn-link" onClick={onToggleView}>
            Already have an account? <span className="text-primary">Sign In</span>
          </button>
        </div>

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;