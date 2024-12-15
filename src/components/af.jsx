import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Search, Share, Eye, ChevronDown, LogOut, User, Bell, Settings, MapPin } from 'lucide-react';
import karma from "../images/karma.png";
import sara from "../images/sara.png";
import red from "../images/red.png";
import j from "../images/j.png";
import m from "../images/m.png";
import door from "../images/door.png";
import car from "../images/car.png";
import io from "../images/post3.webp";

const Home = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSidebarGroups, setShowSidebarGroups] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOptionsForPost, setShowOptionsForPost] = useState(null);
  const navigate = useNavigate();

  // Sample groups data with SVG placeholders
  const groups = [
    { id: 1, name: 'Leisure', image: 'https://via.placeholder.com/36x36/FFFFFF/000000?text=L', followers: 1200 },
    { id: 2, name: 'Activism', image: 'https://via.placeholder.com/36x36/FFFFFF/000000?text=A', followers: 800 },
    { id: 3, name: 'MBA', image: 'https://via.placeholder.com/36x36/FFFFFF/000000?text=M', followers: 1500 },
    { id: 4, name: 'Philosophy', image: 'https://via.placeholder.com/36x36/FFFFFF/000000?text=P', followers: 900 },
  ];

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    if (userName || userEmail) {
      setUser({ 
        name: userName || userEmail.split('@')[0],
        email: userEmail,
        avatar: 'https://via.placeholder.com/36x36/FFFFFF/000000?text=U'
      });
    }
  }, []);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container') && !event.target.closest('.sidebar-search-container')) {
        setShowSearchResults(false);
        setShowSidebarGroups(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSignOut = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setUser(null);
    navigate('/');
  };

  const handlePostAction = (action, postId) => {
    switch(action) {
      case 'edit':
        console.log('Editing post:', postId);
        break;
      case 'report':
        console.log('Reporting post:', postId);
        break;
      case 'option3':
        console.log('Option 3 for post:', postId);
        break;
      default:
        break;
    }
    setShowOptionsForPost(null);
  };

  // Add this useEffect for handling clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.btn-link')) {
        setShowOptionsForPost(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      {/* Header */}
      <nav className="navbar navbar-light bg-white py-2" style={{ borderBottom: '1px solid #E0E0E0' }}>
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src="https://via.placeholder.com/30x30/FFFFFF/000000?text=ATG" alt="ATG WORLD" height="30" />
          </Link>
          
          <div className="d-flex align-items-center flex-grow-1 justify-content-center" style={{ maxWidth: '600px' }}>
            <div className="position-relative w-100 search-container">
              <input
                type="text"
                className="form-control rounded-pill bg-light border-0 ps-5"
                placeholder="Search for your favorite groups in ATG"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setShowSearchResults(true)}
                style={{ backgroundColor: '#F2F2F2', padding: '10px 20px' }}
              />
              <Search className="position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="position-absolute w-100 bg-white rounded-3 mt-1" 
                     style={{ 
                       zIndex: 1000, 
                       boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                       padding: '16px',
                       maxHeight: '400px',
                       overflowY: 'auto'
                     }}>
                  <h6 className="mb-3">
                    <span className="me-2">👥</span>
                    RECOMMENDED GROUPS
                  </h6>
                  {groups.map(group => (
                    <div key={group.id} 
                         className="d-flex justify-content-between align-items-center p-2" 
                         style={{ 
                           cursor: 'pointer',
                           transition: 'background-color 0.2s',
                           ':hover': { backgroundColor: '#F8F9FA' }
                         }}>
                      <div className="d-flex align-items-center">
                        <img 
                          src={group.image} 
                          alt={group.name} 
                          className="rounded-circle me-2" 
                          width="32" 
                          height="32"
                        />
                        <div>
                          <div className="fw-medium">{group.name}</div>
                          <small className="text-muted">{group.followers} followers</small>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-primary rounded-pill">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center">
            {user && (
              <div className="position-relative">
                <button
                  className="btn d-flex align-items-center gap-2 user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{ border: 'none', background: 'none', padding: '8px 12px' }}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle"
                    width="40"
                    height="40"
                  />
                  <span className="d-none d-lg-inline">{user.name}</span>
                  <ChevronDown size={16} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    className="position-absolute end-0 mt-1 bg-white rounded shadow-sm"
                    style={{ 
                      minWidth: '200px',
                      zIndex: 1000,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="py-2">
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => {/* Add profile handler */}}
                      >
                        <User size={16} />
                        My Profile
                      </button>
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => {/* Add settings handler */}}
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => {/* Add notifications handler */}}
                      >
                        <Bell size={16} />
                        Notifications
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger"
                        onClick={handleSignOut}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="container mt-3">
        <div className="d-flex justify-content-between align-items-center">
          <ul className="nav nav-tabs" style={{ border: 'none' }}>
            <li className="nav-item">
              <a className="nav-link active" href="#all" 
                 style={{ 
                   border: 'none', 
                   borderBottom: '2px solid #000',
                   color: '#000'
                 }}>
                All Posts(32)
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#article" 
                 style={{ 
                   border: 'none',
                   color: '#8E8E8E'
                 }}>
                Article
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#event" 
                 style={{ 
                   border: 'none',
                   color: '#8E8E8E'
                 }}>
                Event
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#education" 
                 style={{ 
                   border: 'none',
                   color: '#8E8E8E'
                 }}>
                Education
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#job" 
                 style={{ 
                   border: 'none',
                   color: '#8E8E8E'
                 }}>
                Job
              </a>
            </li>
          </ul>
          
          <div className="d-flex gap-2">
            <button className="btn btn-light dropdown-toggle" 
                    style={{ 
                      backgroundColor: '#EDEEF0',
                      border: 'none'
                    }}>
              Write a Post
            </button>
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
              <span>↩</span>
              Leave Group
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-8">
            {/* Article Post 1 */}
            <div className="card mb-4">
              <div style={{ height: '300px', backgroundImage: `url(${m})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="card-body">
                <div className="mb-2">✍️ Article</div>
                <h5 className="card-title d-flex justify-content-between align-items-start">
                  <span>What if famous brands had regular fonts? Meet RegulaBrands!</span>
                  <div className="position-relative">
                    <button 
                      className="btn btn-link"
                      onClick={() => setShowOptionsForPost(showOptionsForPost === 'post1' ? null : 'post1')}
                      style={{ transition: 'all 0.2s ease' }}
                    >
                      ⋮
                    </button>
                    
                    {showOptionsForPost === 'post1' && (
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
                          onClick={() => handlePostAction('edit', 'post1')}
                        >
                          Edit
                        </button>
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2 py-2"
                          onClick={() => handlePostAction('report', 'post1')}
                        >
                          Report
                        </button>
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2 py-2"
                          onClick={() => handlePostAction('option3', 'post1')}
                        >
                          Option 3
                        </button>
                      </div>
                    )}
                  </div>
                </h5>
                <p className="card-text text-muted">
                  I've worked in UX for the better part of a decade. From now on, I plan to rei...
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img 
                      src={karma}
                      alt="Sarthak Kamra" 
                      className="rounded-circle me-2" 
                      width="40" 
                    />
                    <span>Sarthak Kamra</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="me-1" />
                    <span className="me-3">1.4k views</span>
                    <button className="btn btn-light btn-sm d-flex align-items-center gap-1">
                      <Share size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Education Post */}
            <div className="card mb-4">
              <div style={{ height: '300px', backgroundImage: `url(${door})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="card-body">
                <div className="mb-2">🎓 Education</div>
                <h5 className="card-title d-flex justify-content-between align-items-start">
                  <span>Tax Benefits for Investment under National Pension Scheme</span>
                  <div className="position-relative">
                    <button 
                      className="btn btn-link"
                      onClick={() => setShowOptionsForPost(showOptionsForPost === 'post2' ? null : 'post2')}
                      style={{ transition: 'all 0.2s ease' }}
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
                </h5>
                <p className="card-text text-muted">
                  I've worked in UX for the better part of a decade. From now on, I plan to rei...
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img 
                      src={sara}
                      alt="Sarah West" 
                      className="rounded-circle me-2" 
                      width="40" 
                    />
                    <span>Sarah West</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="me-1" />
                    <span className="me-3">1.4k views</span>
                    <button className="btn btn-light btn-sm d-flex align-items-center gap-1">
                      <Share size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Meetup Post */}
            <div className="card mb-4">
              <div style={{ height: '300px', backgroundImage: `url(${car})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="card-body">
                <div className="mb-2">🗓️ Meetup</div>
                <h5 className="card-title d-flex justify-content-between align-items-start">
                  <span>Finance & Investment Elite Social Mixer @Lujiazui</span>
                  <div className="position-relative">
                    <button 
                      className="btn btn-link"
                      onClick={() => setShowOptionsForPost(showOptionsForPost === 'post3' ? null : 'post3')}
                      style={{ transition: 'all 0.2s ease' }}
                    >
                      ⋮
                    </button>
                    
                    {showOptionsForPost === 'post3' && (
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
                          onClick={() => handlePostAction('edit', 'post3')}
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                          onClick={() => handlePostAction('delete', 'post3')}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </h5>
                
                {/* Add date and location */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="d-flex align-items-center text-muted">
                    <span>📅</span>
                    <span className="ms-2">Fri, 12 Oct, 2018</span>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <span>📍</span>
                    <span className="ms-2">Ahmedabad, India</span>
                  </div>
                </div>

                {/* Add Visit Website button */}
                <button className="btn btn-outline-danger w-100 mb-3" style={{ color: '#E56135', borderColor: '#E56135' }}>
                  Visit Website
                </button>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img 
                      src={red}
                      alt="Ronal Jones" 
                      className="rounded-circle me-2" 
                      width="40" 
                    />
                    <span>Ronal Jones</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="me-1" />
                    <span className="me-3">1.4k views</span>
                    <button className="btn btn-light btn-sm d-flex align-items-center gap-1">
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

          {/* Sidebar */}
          <div className="col-md-4">
            <div className="location-input mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your location"
                  style={{ border: '1px solid #B8B8B8' }}
                />
                <button className="btn btn-outline-secondary">✕</button>
              </div>
              <small className="text-muted mt-1" style={{ display: 'block' }}>
                Your location will help us serve better and extend a personalised experience.
              </small>
            </div>

            {/* Add new sidebar search with groups */}
            <div className="sidebar-search-container position-relative mb-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control rounded-pill bg-light border-0 ps-5"
                  placeholder="Search for groups"
                  onFocus={() => setShowSidebarGroups(true)}
                  style={{ backgroundColor: '#F2F2F2', padding: '10px 20px' }}
                />
                <Search 
                  className="position-absolute" 
                  style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }} 
                />
              </div>

              {showSidebarGroups && (
                <div className="position-absolute w-100 bg-white rounded-3 mt-1"
                  style={{
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: '16px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                  <h6 className="mb-3">
                    <span className="me-2">👥</span>
                    RECOMMENDED GROUPS
                  </h6>
                  {groups.map(group => (
                    <div key={group.id}
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        ':hover': { backgroundColor: '#F8F9FA' }
                      }}>
                      <div className="d-flex align-items-center">
                        <img
                          src={group.image}
                          alt={group.name}
                          className="rounded-circle me-2"
                          width="32"
                          height="32"
                        />
                        <div>
                          <div className="fw-medium">{group.name}</div>
                          <small className="text-muted">{group.followers} followers</small>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-primary rounded-pill">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Hover effect for nav links */
        .nav-link:hover {
          color: #000 !important;
          transition: color 0.3s ease;
        }

        /* Hover effect for buttons */
        .btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        /* Hover effect for cards */
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        /* Hover effect for dropdown items */
        .dropdown-item {
          transition: background-color 0.2s ease;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        /* Hover effect for share and view buttons */
        .btn-light:hover {
          background-color: #e9ecef;
        }

        /* Hover effect for group items */
        .search-container .d-flex:hover,
        .sidebar-search-container .d-flex:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        /* Hover effect for three dots menu */
        .btn-link:hover {
          color: #0056b3;
          transform: scale(1.1);
          transition: all 0.2s ease;
        }

        /* Hover effect for location input */
        .form-control:hover {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
          transition: all 0.2s ease;
        }

        /* Hover effect for user menu */
        .user-menu-button:hover {
          background-color: #f8f9fa;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        /* Hover effect for follow buttons */
        .btn-outline-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default Home;