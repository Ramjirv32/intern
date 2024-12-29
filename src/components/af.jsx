import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Search, Share, Eye, ChevronDown, LogOut, User, Bell, Settings, MapPin, Home, Plus, Users, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import karma from "../images/karma.png";
import sara from "../images/sara.png";
import red from "../images/red.png";
import j from "../images/j.png";
import m from "../images/m.png";
import door from "../images/door.png";
import car from "../images/car.png";
import axios from 'axios';
import Swal from 'sweetalert2';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://intern-backend.onrender.com/api';
  }
  const ports = [5000, 5001, 5002, 5003];
  const checkPort = async (port) => {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) {
        return port;
      }
    } catch (error) {
      return null;
    }
  };
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

axios.get(`${API_URL}/health`)
  .then(response => {
    console.log('Backend health check:', response.data);
  })
  .catch(error => {
    console.error('Backend health check failed:', error);
  });

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSidebarGroups, setShowSidebarGroups] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOptionsForPost, setShowOptionsForPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'Article',
    title: '',
    content: '',
    image: ''
  });
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingPost, setEditingPost] = useState(null);
  const [showGroupPosts, setShowGroupPosts] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [followedGroups, setFollowedGroups] = useState([]);
  const [showFollowing, setShowFollowing] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [manualRegisterData, setManualRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          setUser(null);
          
          Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Please sign in again',
            showCancelButton: true,
            confirmButtonText: 'Sign In',
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              setShowLoginModal(true);
            }
          });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const requireAuth = (action) => {
    const isAuthenticated = localStorage.getItem('token');
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please sign in to ' + action,
        showCancelButton: true,
        confirmButtonText: 'Sign In',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
        }
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    console.log('Current posts:', posts);
  }, [posts]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    const createOrFetchUser = async (email, name) => {
      try {
        const response = await axios.get(`${API_URL}/users/email/${email}`);
        setUser(response.data);
      } catch (error) {
        try {
          const newUser = await axios.post(`${API_URL}/users`, {
            name: name || email.split('@')[0],
            email: email,
            avatar: 'https://via.placeholder.com/36x36/FFFFFF/000000?text=U'
          });
          setUser(newUser.data);
        } catch (createError) {
          console.error('Error creating user:', createError);
        }
      }
    };

    if (userName || userEmail) {
      createOrFetchUser(userEmail, userName);
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching posts...');
        const response = await axios.get(`${API_URL}/posts`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Error message:', error.message);
          }
          throw error;
        });

        if (response?.data && typeof response.data === 'object') {
          let postsData = Array.isArray(response.data) ? response.data : [];
          const formattedPosts = postsData.map(post => ({
            _id: post._id || post.id || Math.random().toString(),
            type: post.type || 'Article',
            title: post.title || 'Untitled',
            content: post.content || '',
            image: post.image || '',
            author: post.author || { name: 'Anonymous', _id: 'anonymous' },
            views: typeof post.views === 'number' ? post.views : 0,
            createdAt: post.createdAt || new Date().toISOString()
          }));
          console.log('Formatted posts:', formattedPosts);
          setPosts(formattedPosts);
        } else {
          console.error('Invalid posts data:', response?.data);
          setPosts([]);
          Swal.fire({
            icon: 'warning',
            title: 'No Posts Available',
            text: 'No posts were found.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        handleApiError(error);
        setPosts([]);
      }
    };
    
    fetchPosts();
  }, []);

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

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching groups from:', `${API_URL}/groups`);
        const response = await axios.get(`${API_URL}/groups`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Error message:', error.message);
          }
          throw error;
        });
        
        if (response?.data && typeof response.data === 'object') {
          let groupsData = Array.isArray(response.data) ? response.data : [];
          const formattedGroups = groupsData.map(group => ({
            _id: group._id || group.id || Math.random().toString(),
            name: group.name || 'Unnamed Group',
            image: group.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name || 'Group')}&background=random`,
            members: Array.isArray(group.members) ? group.members : [],
            followers: typeof group.followers === 'number' ? group.followers : 0,
            posts: Array.isArray(group.posts) ? group.posts : []
          }));
          console.log('Formatted groups:', formattedGroups);
          setGroups(formattedGroups);
        } else {
          console.error('Invalid groups data:', response?.data);
          setError('No groups available');
          setGroups([]);
          Swal.fire({
            icon: 'warning',
            title: 'No Groups Available',
            text: 'No groups were found.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to fetch groups');
        handleApiError(error);
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const url = selectedCategory === 'all' 
          ? `${API_URL}/articles`
          : `${API_URL}/articles/${selectedCategory}`;
        const response = await axios.get(url);
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setUser(null);
    navigate('/');
  };

  const handlePostAction = async (action, postId) => {
    if (action === 'delete') {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        try {
          console.log('Attempting to delete post:', postId);
          const response = await axios.delete(`${API_URL}/posts/${postId}`);
          if (response.status === 200) {
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
            Swal.fire(
              'Deleted!',
              'Your post has been deleted.',
              'success'
            );
          }
        } catch (error) {
          console.error('Error deleting post:', error);
          Swal.fire(
            'Error!',
            'Failed to delete post: ' + error.message,
            'error'
          );
        }
      }
    } else if (action === 'edit') {
      const postToEdit = posts.find(p => p._id === postId);
      if (postToEdit) {
        setEditingPost(postToEdit);
        setNewPost({
          type: postToEdit.type,
          title: postToEdit.title,
          content: postToEdit.content,
          image: postToEdit.image
        });
        setShowCreatePost(true);
      }
    }
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

  const handleWritePostClick = () => {
    setShowCreatePost(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    try {
      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please login to create posts'
        });
        return;
      }

      if (!canPost) {
        Swal.fire({
          icon: 'warning',
          title: 'Join Group Required',
          text: 'You must join this group to write posts'
        });
        return;
      }

      let imageUrl = newPost.image;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        imageUrl = uploadResponse.data.imageUrl;
      }

      const postData = {
        type: newPost.type,
        title: newPost.title,
        content: newPost.content,
        image: imageUrl,
        author: user._id,
        group: currentGroup?._id,
        userId: user._id
      };

      const response = await axios.post(`${API_URL}/posts`, postData);
      
      setPosts(prevPosts => [response.data, ...prevPosts]);
      setShowCreatePost(false);
      setNewPost({ type: 'Article', title: '', content: '', image: '' });
      setSelectedFile(null);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Post created successfully',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error submitting post:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create post'
      });
    }
  };

  const handleModalClose = () => {
    setShowCreatePost(false);
    setNewPost({ type: 'Article', title: '', content: '', image: '' });
    setSelectedFile(null);
    setEditingPost(null);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/static')) {
      return `${API_URL.replace('/api', '')}${imagePath}`;
    }
    if (imagePath.startsWith('/uploads/')) {
      return `${API_URL.replace('/api', '')}${imagePath}`;
    }
    return imagePath;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleLeaveGroup = async (groupId) => {
    try {
      const result = await Swal.fire({
        title: 'Leave Group',
        text: 'Are you sure you want to leave this group?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, leave group'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/groups/leave`, {
          userId: user._id,
          groupId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setJoinedGroups(prev => prev.filter(id => id !== groupId));
        
        if (currentGroup?._id === groupId) {
          setCurrentGroup(null);
        }

        setGroups(prevGroups => 
          prevGroups.map(group => 
            group._id === groupId ? { ...group, members: group.members.filter(m => m._id !== user._id) } : group
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Left Group',
          text: 'You have successfully left the group',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to leave group. Please try again.'
      });
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please login to join groups',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel'
        });
        return;
      }

      if (!groupId) {
        console.error('No group ID provided');
        return;
      }

      console.log('Joining group:', groupId);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/groups/join`, {
        userId: user._id,
        groupId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setJoinedGroups(prev => [...prev, groupId]);

        const groupResponse = await axios.get(`${API_URL}/groups/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (groupResponse.data) {
          setCurrentGroup(groupResponse.data);
          setGroups(prevGroups => 
            prevGroups.map(group => 
              group._id === groupId ? groupResponse.data : group
            )
          );

          Swal.fire({
            icon: 'success',
            title: 'Joined Group',
            text: 'You have successfully joined the group',
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error('Error joining group:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to join group. Please try again.'
      });
    }
  };

  useEffect(() => {
    console.log('Current groups:', groups);
  }, [groups]);

  const handleFollowGroup = async (groupId) => {
    try {
      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please login to follow groups'
        });
        return;
      }

      const response = await axios.post(`${API_URL}/groups/follow`, {
        userId: user._id,
        groupId
      });

      setFollowedGroups(prev => [...prev, groupId]);
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group._id === groupId
            ? { ...group, followers: (group.followers || 0) + 1 }
            : group
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Group followed successfully',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error following group:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to follow group'
      });
    }
  };

  const handleUnfollowGroup = async (groupId) => {
    try {
      const response = await axios.post(`${API_URL}/groups/unfollow`, {
        userId: user._id,
        groupId
      });

      setFollowedGroups(prev => prev.filter(id => id !== groupId));
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group._id === groupId
            ? { ...group, followers: Math.max((group.followers || 0) - 1, 0) }
            : group
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Group unfollowed successfully',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error unfollowing group:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to unfollow group'
      });
    }
  };

  const fetchFollowedGroups = async () => {
    try {
      if (!user) return;
      const response = await axios.get(`${API_URL}/users/${user._id}`);
      setFollowedGroups(response.data.followedGroups || []);
    } catch (error) {
      console.error('Error fetching followed groups:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFollowedGroups();
    }
  }, [user]);

  useEffect(() => {
    const checkPostingPermission = () => {
      if (!currentGroup || !user) {
        setCanPost(false);
        return;
      }
      
      const isMember = currentGroup.members?.some(
        member => member._id === user._id
      );
      setCanPost(isMember);
    };

    checkPostingPermission();
  }, [currentGroup, user]);

  const renderWritePostButton = () => {
    if (!user) {
      return (
        <button 
          className="btn btn-primary"
          onClick={() => requireAuth('write posts')}
          disabled={true}
        >
          Write a Post
        </button>
      );
    }

    if (!currentGroup) {
      return (
        <button 
          className="btn btn-primary"
          onClick={() => Swal.fire({
            icon: 'info',
            title: 'Select a Group',
            text: 'Please select a group to write a post'
          })}
        >
          Write a Post
        </button>
      );
    }

    if (!canPost) {
      return (
        <button 
          className="btn btn-primary"
          onClick={() => Swal.fire({
            icon: 'warning',
            title: 'Join Group Required',
            text: 'You must join this group to write posts',
            showCancelButton: true,
            confirmButtonText: 'Join Group',
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              handleJoinGroup(currentGroup._id);
            }
          })}
        >
          Write a Post
        </button>
      );
    }

    return (
      <button 
        className="btn btn-primary"
        onClick={() => setShowCreatePost(true)}
      >
        Write a Post
      </button>
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      
      setUser(user);
      setShowLoginModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${user.name}!`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'Failed to login'
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/register`, registerData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      
      setUser(user);
      setShowLoginModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: `Welcome, ${user.name}!`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.message || 'Failed to register'
      });
    }
  };

  const renderAuthModal = () => {
    if (!showLoginModal) return null;

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isRegistering ? 'Create Account' : 'Welcome Back!'}</h5>
              <button 
                type="button" 
                className="btn-close"
                onClick={() => setShowLoginModal(false)}
              />
            </div>
            <div className="modal-body">
              {isRegistering ? (
                <form onSubmit={handleManualRegister}>
                  <div className="text-center mb-4">
                    <h6>Create your account</h6>
                    <p className="text-muted small">
                      Let's learn, share & inspire each other with our passion for computer engineering. Sign up now ✌️
                    </p>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        value={manualRegisterData.firstName}
                        onChange={(e) => setManualRegisterData({
                          ...manualRegisterData,
                          firstName: e.target.value
                        })}
                        required
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        value={manualRegisterData.lastName}
                        onChange={(e) => setManualRegisterData({
                          ...manualRegisterData,
                          lastName: e.target.value
                        })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={manualRegisterData.email}
                      onChange={(e) => setManualRegisterData({
                        ...manualRegisterData,
                        email: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create Password"
                      value={manualRegisterData.password}
                      onChange={(e) => setManualRegisterData({
                        ...manualRegisterData,
                        password: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm Password"
                      value={manualRegisterData.confirmPassword}
                      onChange={(e) => setManualRegisterData({
                        ...manualRegisterData,
                        confirmPassword: e.target.value
                      })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Create Account
                  </button>
                  <div className="text-center mt-3">
                    <span className="text-muted">Already have an account?</span>
                    <button 
                      type="button" 
                      className="btn btn-link"
                      onClick={() => setIsRegistering(false)}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="text-center mb-4">
                    <h6>Sign in to your account</h6>
                    <p className="text-muted small">
                      Welcome back! Please enter your details
                    </p>
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Sign In
                  </button>
                  <div className="text-center mt-3">
                    <span className="text-muted">Don't have an account?</span>
                    <button 
                      type="button" 
                      className="btn btn-link"
                      onClick={() => setIsRegistering(true)}
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              )}
              <div className="text-center mt-3">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <hr className="flex-grow-1" />
                  <span className="text-muted">or continue with</span>
                  <hr className="flex-grow-1" />
                </div>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  <button className="btn btn-outline-secondary">
                    <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" />
                  </button>
                  <button className="btn btn-outline-secondary">
                    <img src="https://img.icons8.com/color/24/000000/facebook-new.png" alt="Facebook" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    try {
      if (signInData.password !== signInData.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'Password and confirm password do not match'
        });
        return;
      }

      const response = await axios.post(`${API_URL}/auth/register`, {
        email: signInData.email,
        password: signInData.password,
        name: signInData.email.split('@')[0]
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);

      setUser(user);
      
      Swal.fire({
        icon: 'success',
        title: 'Sign In Successful',
        text: `Welcome ${user.name}!`,
        timer: 1500,
        showConfirmButton: false
      });

      setShowLoginModal(false);
    } catch (error) {
      console.error('Sign in error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: error.response?.data?.message || 'Failed to sign in'
      });
    }
  };

  const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to connect to the server. Please try again later.',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
      confirmButtonText: 'OK'
    });
  };

  const handleManualRegister = async (e) => {
    e.preventDefault();
    
    try {
      if (manualRegisterData.password !== manualRegisterData.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'Password and confirm password do not match'
        });
        return;
      }

      const response = await axios.post(`${API_URL}/auth/manual-register`, {
        firstName: manualRegisterData.firstName,
        lastName: manualRegisterData.lastName,
        email: manualRegisterData.email,
        password: manualRegisterData.password
      });

      setManualRegisterData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      await Swal.fire({
        icon: 'success',
        title: 'Account Created Successfully!',
        text: 'Please sign in with your email and password',
        timer: 2000,
        showConfirmButton: false
      });

      setLoginData(prev => ({
        ...prev,
        email: response.data.user.email,
        password: ''
      }));

      setIsRegistering(false);

    } catch (error) {
      console.error('Manual registration error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.message || 'Failed to register'
      });
    }
  };

  const handleLike = (postId) => {
    console.log(`Liking post ${postId}`);
  };

  const handleUnlike = (postId) => {
    console.log(`Unliking post ${postId}`);
  };

  const handleShowComments = (postId) => {
    console.log(`Showing comments for post ${postId}`);
  };


  return (
    <div>
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
                >
                  <img
                    src={user.avatar || "https://via.placeholder.com/36x36/FFFFFF/000000?text=U"}
                    alt={user.name}
                    className="rounded-circle"
                    width="36"
                    height="36"
                  />
                  <span className="d-none d-md-inline">{user.name}</span>
                  <ChevronDown size={16} />
                </button>

                {showUserMenu && (
                  <div 
                    className="position-absolute end-0 mt-1 bg-white rounded shadow-sm"
                    style={{ 
                      minWidth: '200px',
                      zIndex: 1000,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="p-3 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={user.avatar || "https://via.placeholder.com/48x48/FFFFFF/000000?text=U"}
                          alt={user.name}
                          className="rounded-circle"
                          width="48"
                          height="48"
                        />
                        <div>
                          <div className="fw-bold">{user.name}</div>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => {
                          setShowUserMenu(false);
                        }}
                      >
                        <User size={16} />
                        My Profile
                      </button>
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => {}}
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => {}}
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
            {renderWritePostButton()}
            {currentGroup && (
              <button 
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => handleLeaveGroup(currentGroup._id)}
              >
                <span>↩</span>
                Leave Group
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-md-8">
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <div key={post._id} className="position-relative">
                  <div className="position-absolute top-0 end-0 m-2 d-flex gap-2" style={{ zIndex: 1000 }}>
                    {user && user._id === post.author._id && (
                      <>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handlePostAction('edit', post._id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handlePostAction('delete', post._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  <div className="card mb-4">
                    {post.image && (
                      <div 
                        style={{ 
                          height: '220px',
                          backgroundImage: `url(${getImageUrl(post.image)})`,
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center',
                          borderTopLeftRadius: '4px',
                          borderTopRightRadius: '4px'
                        }}
                      />
                    )}
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <span className="badge text-dark px-0" style={{ background: 'none' }}>
                          {post.type === 'Article' && '✍️ Article'}
                          {post.type === 'Education' && '🎓 Education'}
                          {post.type === 'Meetup' && '🗓 Meetup'}
                          {post.type === 'Job' && '👨‍💼 Job'}
                        </span>
                      </div>
                      <h5 className="card-title d-flex justify-content-between align-items-start">
                        <span style={{ fontSize: '22px', fontWeight: '600' }}>{post.title}</span>
                      </h5>
                      <p className="card-text text-muted" style={{ fontSize: '15px' }}>
                        {post.content}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="d-flex align-items-center">
                          <img 
                            src={getImageUrl(post.author.avatar)}
                            alt={post.author.name} 
                            className="rounded-circle me-2" 
                            width="48" 
                            height="48"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: '600' }}>{post.author.name}</div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="d-flex align-items-center me-4">
                            <button className="btn btn-link" onClick={() => handleLike(post._id)}>
                              <ThumbsUp size={18} /> Like ({post.likes?.length || 0})
                            </button>
                            <button className="btn btn-link" onClick={() => handleUnlike(post._id)}>
                              <ThumbsDown size={18} /> Unlike
                            </button>
                            <button className="btn btn-link" onClick={() => handleShowComments(post._id)}>
                              <MessageCircle size={18} /> Comment ({post.comments?.length || 0})
                            </button>
                          </div>
                          <button className="btn" style={{ background: '#F1F3F5', padding: '8px 12px' }}>
                            <Share size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No posts available</p>
              </div>
            )}
          </div>

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
                    <div key={group._id}
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
                      <button 
                        className="btn btn-sm btn-outline-primary rounded-pill"
                        onClick={() => handleJoinGroup(group._id)}
                      >
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h5>Available Groups</h5>
              {isLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : groups && groups.length > 0 ? (
                groups.map(group => (
                  <div key={group?._id || 'fallback-key'} className="card mb-2">
                    <div className="card-body p-2 p-md-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                        <div className="mb-2 mb-md-0">
                          <h6 className="mb-1">{group?.name || 'Unnamed Group'}</h6>
                          <small className="text-muted">
                            {group?.followers || 0} followers
                          </small>
                        </div>
                        <div className="d-flex gap-2 w-100 w-md-auto justify-content-between justify-content-md-end">
                          {!joinedGroups.includes(group?._id) ? (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => group?._id && handleJoinGroup(group._id)}
                              disabled={!group?._id || !user}
                            >
                              Join Group
                            </button>
                          ) : (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => group?._id && handleLeaveGroup(group._id)}
                              disabled={!group?._id || !user}
                            >
                              Leave Group
                            </button>
                          )}
                          {!followedGroups.includes(group?._id) ? (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => group?._id && handleFollowGroup(group._id)}
                              disabled={!group?._id || !user}
                            >
                              Follow
                            </button>
                          ) : (
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => group?._id && handleUnfollowGroup(group._id)}
                              disabled={!group?._id || !user}
                            >
                              Unfollow
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">No groups available</p>
              )}
            </div>

            {currentGroup && joinedGroups.includes(currentGroup._id) && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h4>{currentGroup.name}</h4>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => handleLeaveGroup(currentGroup._id)}
                  >
                    Leave Group
                  </button>
                </div>
                <p className="text-muted">
                  {currentGroup.followers} followers • {currentGroup.posts?.length || 0} posts
                </p>
                <button 
                  className="btn btn-primary mb-3"
                  onClick={() => {
                    setNewPost({
                      type: 'Article',
                      title: '',
                      content: '',
                      image: '',
                      group: currentGroup._id
                    });
                    setShowCreatePost(true);
                  }}
                >
                  Write Post in {currentGroup.name}
                </button>
                
                <div className="group-posts mt-3">
                  {currentGroup.posts?.map(post => (
                    <div key={post._id} className="card mb-3">
                      <div className="card-body">
                        <h5 className="card-title">{post.title}</h5>
                        <p className="card-text">{post.content}</p>
                        {post.image && (
                          <img 
                            src={getImageUrl(post.image)} 
                            alt={post.title}
                            className="img-fluid mb-2"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="text-muted">
                            Posted by {post.author.name}
                          </small>
                          <small className="text-muted">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreatePost && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingPost ? 'Edit Post' : 'Create Post'}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowCreatePost(false);
                    setEditingPost(null);
                    setNewPost({ type: 'Article', title: '', content: '', image: '' });
                  }}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitPost}>
                  <div className="mb-3">
                    <select 
                      className="form-select"
                      value={newPost.type}
                      onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                    >
                      <option value="Article">Article</option>
                      <option value="Education">Education</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Job">Job</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      placeholder="Content"
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      required
                      rows="4"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    {selectedFile && (
                      <div className="mt-2">
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px' }} 
                        />
                        <small className="text-muted d-block">
                          Selected file: {selectedFile.name}
                        </small>
                      </div>
                    )}
                    <div className="mt-2">
                      <small className="text-muted">
                        Or provide an image URL:
                      </small>
                      <input
                        type="text"
                        className="form-control mt-1"
                        placeholder="Image URL"
                        value={newPost.image}
                        onChange={(e) => setNewPost({...newPost, image: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreatePost(false);
                        setEditingPost(null);
                        setNewPost({ type: 'Article', title: '', content: '', image: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        className="btn btn-outline-primary mb-3"
        onClick={() => setShowFollowing(true)}
      >
        My Following ({followedGroups.length})
      </button>

      {showFollowing && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Groups I Follow</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowFollowing(false)}
                />
              </div>
              <div className="modal-body">
                {followedGroups.length > 0 ? (
                  groups
                    .filter(group => followedGroups.includes(group._id))
                    .map(group => (
                      <div key={group._id} className="card mb-2">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-0">{group.name}</h6>
                              <small className="text-muted">{group.followers} followers</small>
                            </div>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleUnfollowGroup(group._id)}>Unfollow</button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-muted text-center">You are not following any groups yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {renderAuthModal()}
    </div>
  );
};

export default HomePage;

