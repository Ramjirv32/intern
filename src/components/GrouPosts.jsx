import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Share, Eye, Users, Search, ChevronDown, LogOut, User, Bell, Settings, MapPin } from 'lucide-react';
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { signInWithGoogle } from '../firebase';
import SignIn from './SignIn';
import karma from "../images/karma.png";
import sara from "../images/sara.png";
import red from "../images/red.png";
import j from "../images/j.png";
import m from "../images/m.png"
import door from "../images/door.png";
import car from "../images/car.png";
import io from "../images/post3.webp";
import o from "../images/one.jpg";
import Swal from 'sweetalert2';

// import job from "../images/job.png";
const CreateAccountModal = ({ onVisibilityChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleOpen = () => {
    setShowModal(true);
    setShowSignIn(false);
    onVisibilityChange(true);
  };
  
  const handleClose = () => {
    setShowModal(false);
    setShowSignIn(false);
    onVisibilityChange(false);
  };

  const toggleView = () => {
    setShowSignIn(!showSignIn);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result?.user) {
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('userName', result.user.displayName);
        
        handleClose();
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

  const handleNavigation = (path) => {
    const isAuthenticated = localStorage.getItem('userEmail');
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Access Denied',
        text: 'Please login to access this feature',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0056b3'
      });
      return;
    }
    navigate(path);
  };

  return (
    <>
      <button 
        className="btn text-primary" 
        onClick={handleOpen}
        style={{ border: 'none', background: 'none', padding: '0' }}
      >
        It's Free!
      </button>

      {showModal && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 1050,
          }}
        >
          {!showSignIn ? (
            <div
              className="p-4 bg-white rounded"
              style={{
                width: "800px",
                maxWidth: "90%",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">Create Account</h4>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleClose}>
                  ✕
                </button>
              </div>
              <p className="text-center mb-4" style={{ fontSize: "14px" }}>
                Let's learn, share & inspire each other with our passion for computer engineering.
                Sign up now ✌️
              </p>
              <div className="row justify-content-center align-items-center">
                <div className="col-12 col-md-6">
                  <form onSubmit={handleSubmit} className="mb-3">
                    <div className="row g-3">
                      <div className="col-md-6">
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
                      <div className="col-md-6">
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
                      <div className="col-12">
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
                      <div className="col-12">
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm Password"
                          className="form-control"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-12 d-grid">
                        <button type="submit" className="btn btn-primary fw-bold">
                          Create Account
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="mb-3">
                    <button className="btn btn-outline-primary w-100 mb-2">
                      <FaFacebookF className="me-2" /> Sign up with Facebook
                    </button>
                    <button className="btn btn-outline-danger w-100" onClick={handleGoogleSignIn}>
                      <FaGoogle className="me-2" /> Sign up with Google
                    </button>
                  </div>
                  <div className="text-center">
                    <small>
                      Already have an account?{" "}
                      <button 
                        className="btn btn-link p-0 text-primary" 
                        onClick={toggleView}
                        style={{ textDecoration: 'none' }}
                      >
                        Sign In
                      </button>
                    </small>
                  </div>
                </div>
                <div className="col-md-6 text-center d-none d-md-block">
                  <img
                    src={o}
                    alt="Illustration"
                    className="img-fluid"
                    style={{ maxHeight: '320px' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <SignIn 
              onToggleView={toggleView} 
              onClose={handleClose}
            />
          )}
        </div>
      )}
    </>
  );
};

// GroupPosts Component
const GroupPosts = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showOptionsForPost, setShowOptionsForPost] = useState(null);
  const [user, setUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Update user state when component mounts and when localStorage changes
  useEffect(() => {
    const checkUser = () => {
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      if (userEmail || userName) {
        setUser({ email: userEmail, name: userName });
      } else {
        setUser(null);
      }
    };

    // Check initially
    checkUser();

    // Add event listener for storage changes
    window.addEventListener('storage', checkUser);
    
    // Also add a custom event listener for auth changes
    window.addEventListener('authStateChanged', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('authStateChanged', checkUser);
    };
  }, []);

  const handlePostAction = (action, postId) => {
    if (action === 'edit') {
      console.log('Editing post:', postId);
    } else if (action === 'delete') {
      console.log('Deleting post:', postId);
    }
    setShowOptionsForPost(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.btn-link')) {
        setShowOptionsForPost(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModalVisibility = (isVisible) => {
    setIsModalVisible(isVisible);
  };

  return (
    <div>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-2 sticky-top">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="navbar-brand text-success fw-bold">
            <span className="d-none d-sm-inline">ATG.WORLD</span>
            <span className="d-sm-none">ATG</span>
          </Link>

          {/* Search Bar - Hide on mobile */}
          <div className="d-none d-lg-flex mx-auto search-container flex-grow-1 mx-lg-3">
            <div className="position-relative w-100">
              <input
                type="text"
                className="form-control rounded-pill py-2 ps-5"
                placeholder="Search for your favorite groups in ATG"
                style={{ 
                  backgroundColor: '#F2F2F2', 
                  border: 'none',
                  fontSize: '16px'
                }}
              />
              <Search 
                className="position-absolute" 
                style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }}
                size={16}
                color="#7A7A7A"
              />
            </div>
          </div>

          {/* Create Account Section */}
          <div className="ms-auto">
            <div className="d-flex align-items-center">
              <span className="me-2">Create account</span>
              <CreateAccountModal onVisibilityChange={handleModalVisibility} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="position-relative">
        <div
          style={{
            height: window.innerWidth < 576 ? '250px' : '440px',
            backgroundImage: `url(${io})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          {/* Dark overlay gradient */}
          <div
            className="position-absolute bottom-0 start-0 w-100 p-4"
            style={{ 
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)',
              height: '100%'
            }}
          >
            {/* Content container */}
            <div className="container h-100 d-flex flex-column justify-content-end">
              <h1 className="text-white fw-bold mb-2" style={{ fontSize: '36px' }}>
                Computer Engineering
              </h1>
              <p className="text-white mb-0" style={{ fontSize: '18px' }}>
                142,765 Computer Engineers follow this
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bar - Only visible on mobile and when modal is not visible */}
      {!isModalVisible && (
        <div className="d-lg-none sticky-top bg-white border-bottom mb-3">
          <div className="container">
            <div className="d-flex justify-content-between py-2">
              <button className="btn btn-outline-secondary btn-sm">
                Filter
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                Sort by: Latest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Section - Make cards responsive */}
      <div className="container my-3 my-md-4">
        <div className="row g-3 g-md-4">
          {/* Main Content */}
          <div className="col-12 col-lg-8">
            {/* Navigation Tabs - Hidden on mobile */}
            <div className="d-none d-lg-flex justify-content-between align-items-center mb-4">
              <ul className="nav nav-pills d-flex align-items-center gap-3" style={{ border: 'none' }}>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    href="#"
                    style={{ 
                      color: '#000', 
                      border: 'none',
                      padding: '8px 12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    All Posts(32)
                  </a>
                </li>
                {['Article', 'Event', 'Education', 'Job'].map((item) => (
                  <li className="nav-item" key={item}>
                    <a 
                      className="nav-link" 
                      href="#"
                      style={{ 
                        color: '#8E8E8E', 
                        border: 'none',
                        padding: '8px 12px',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#000'}
                      onMouseLeave={(e) => e.target.style.color = '#8E8E8E'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="d-flex gap-2">
                <button className="btn btn-light dropdown-toggle">Write a Post</button>
                <button className="btn btn-primary">
                  <Users size={16} className="me-2" />
                  Join Group
                </button>
              </div>
            </div>

            {/* Posts - Same as before */}
            <div className="card mb-4">
              <div 
                style={{ 
                  height: window.innerWidth < 576 ? '200px' : '300px',
                  backgroundImage: `url(${m})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <div className="card-body p-3 p-md-4">
                <span className="text-muted small">⚡ Article</span>
                <h6 className="mt-2 fw-bold d-flex justify-content-between align-items-start">
                  <span>What if famous brands had regular fonts? Meet RegulaBrands!</span>
                  <div className="position-relative">
                    <button 
                      className="btn btn-link"
                      onClick={() => setShowOptionsForPost(showOptionsForPost === 'post1' ? null : 'post1')}
                    >
                      ⋮
                    </button>
                    
                    {/* Options Dropdown */}
                    {showOptionsForPost === 'post1' && (
                      <div 
                        className="position-absolute end-0 bg-white rounded shadow-sm"
                        style={{ 
                          zIndex: 1000,
                          minWidth: window.innerWidth < 576 ? '100px' : '120px',
                          border: '1px solid rgba(0,0,0,0.1)',
                          right: window.innerWidth < 576 ? '0' : 'auto'
                        }}
                      >
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2 py-2"
                          onClick={() => handlePostAction('edit', 'post1')}
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                          onClick={() => handlePostAction('delete', 'post1')}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </h6>
                <p className="text-muted small mb-1">
                  I've worked in UX for the better part of a decade. F...
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={karma}
                      alt="Profile"
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                    />
                    <span className="small">Sarthak Kamra</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="me-1" />
                    <span className="small me-3">1.4k views</span>
                    <Share size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Education Post */}
            <div className="card mb-4">
              <div style={{ 
                height: window.innerWidth < 576 ? '150px' : '200px',
                backgroundImage: `url(${door})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div className="card-body">
                <span className="text-muted small">🎓 Education</span>
                <h6 className="mt-2 fw-bold d-flex justify-content-between align-items-start">
                  <span>Tax Benefits for Investment under National Pension Scheme</span>
                  <div className="position-relative">
                    <button 
                      className="btn btn-link"
                      onClick={() => setShowOptionsForPost(showOptionsForPost === 'post2' ? null : 'post2')}
                    >
                      ⋮
                    </button>
                    {showOptionsForPost === 'post2' && (
                      <div 
                        className="position-absolute end-0 bg-white rounded shadow-sm"
                        style={{ 
                          zIndex: 1000,
                          minWidth: '120px',
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      >
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2 py-2"
                          onClick={() => handlePostAction('edit', 'post2')}
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                          onClick={() => handlePostAction('delete', 'post2')}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </h6>
                <p className="text-muted small mb-1">
                  Let's dive into tax benefits under the National Pension Scheme.
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={sara}
                      alt="Profile"
                      className="rounded-circle me-2"
                    />
                    <span className="small">Sarah West</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="me-1" />
                    <span className="small me-3">1.4k views</span>
                    <Share size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Meetup Post */}
            <div className="card mb-4">
              <div style={{ 
                height: window.innerWidth < 576 ? '150px' : '200px',
                backgroundImage: `url(${car})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div className="card-body">
                <span className="text-muted small">🗓️ Meetup</span>
                <h6 className="mt-2 fw-bold">Finance & Investment Elite Social Mixer @Lujiazui</h6>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="d-flex align-items-center text-muted small">
                    <MapPin size={14} className="me-1" />
                    Ahmedabad, India
                  </div>
                  <div className="text-muted small">
                    <span>Fri, 12 Oct, 2018</span>
                  </div>
                </div>
                <p className="text-muted small mb-1">
                  Join us for a night of socializing, networking, and investing insights.
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={red}
                      alt="Profile"
                      className="rounded-circle me-2"
                    />
                    <span className="small">Ronal Jones</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="me-1" />
                    <span className="small me-3">1.4k views</span>
                    <button className="btn btn-light btn-sm">
                      <Share size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Post */}
            <div className="card mb-4">
              <div className="card-body">
                <span className="text-muted small">💼 Job</span>
                <h6 className="mt-2 fw-bold">Software Developer - II</h6>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="d-flex align-items-center text-muted small">
                    <User size={14} className="me-1" />
                    Innovaccer Analytics
                  </div>
                  <div className="d-flex align-items-center text-muted small">
                    <MapPin size={14} className="me-1" />
                    Noida, India
                  </div>
                </div>
                <button className="btn btn-outline-success w-100 mt-3">
                  Apply on Timesjobs
                </button>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center">
                    <img
                      src={j}
                      alt="Profile"
                      className="rounded-circle me-2"
                    />
                    <span className="small">Joseph Gray</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="me-1" />
                    <span className="small me-3">1.4k views</span>
                    <button className="btn btn-light btn-sm">
                      <Share size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar and Mobile Button - Hide when modal is visible */}
          {!user && !isModalVisible && (
            <>
              <div className="col-lg-4">
                {/* Sidebar - Only visible on desktop */}
                <div className="d-none d-lg-block">
                  <div className="sticky-top" style={{ top: '80px' }}>
                    <div className="card p-3 mb-4">
                      <h6 className="fw-bold">Join the Group</h6>
                      <p className="small text-muted">Be a part of the computer engineering community.</p>
                      <button className="btn btn-primary d-flex align-items-center gap-2">
                        <Users size={16} />
                        Join Group
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Button - Only visible on mobile */}
              <div className="d-lg-none fixed-bottom p-3 bg-white border-top">
                <button className="btn btn-primary w-100">
                  <Users size={16} className="me-2" />
                  Join Group
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add responsive styles for text */}
      <style jsx>{`
        @media (max-width: 576px) {
          .card-title {
            font-size: 1rem;
          }
          .small {
            font-size: 0.8rem;
          }
          .btn {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
          .rounded-circle {
            width: 30px !important;
            height: 30px !important;
          }
          .card-body {
            padding: 1rem !important;
          }
          .container {
            padding-left: 10px;
            padding-right: 10px;
          }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .card-title {
            font-size: 1.1rem;
          }
          .rounded-circle {
            width: 35px !important;
            height: 35px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 992px) {
          .container {
            max-width: 95%;
          }
        }

        /* Ensure images scale properly */
        img {
          max-width: 100%;
          height: auto;
        }

        /* Make cards more compact on mobile */
        @media (max-width: 576px) {
          .card {
            margin-bottom: 1rem !important;
          }
          .card-body {
            padding: 0.75rem !important;
          }
        }

        /* Adjust navigation spacing */
        @media (max-width: 992px) {
          .nav-pills {
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 0.5rem;
          }
          .nav-item {
            display: inline-block;
          }
        }

        /* Adjust button sizes */
        @media (max-width: 576px) {
          .btn-group > .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 992px) {
          .navbar .container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .navbar-brand {
            margin-right: 0;
          }
          
          .ms-auto {
            margin-left: 0 !important;
          }
        }

        @media (max-width: 576px) {
          .navbar {
            padding: 0.5rem 1rem;
          }
          
          .navbar .container {
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .modal-content {
            padding: 1rem;
          }
          .form-control {
            font-size: 14px;
          }
          .btn {
            font-size: 14px;
          }
          .col-12 {
            padding: 0;
          }
        }

        .nav-pills {
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;  /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
        }

        .nav-pills::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }

        .nav-item {
          flex: 0 0 auto;
        }

        @media (max-width: 992px) {
          .nav-pills {
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GroupPosts;