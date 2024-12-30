import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Heart, MessageCircle, Send } from 'react-feather'; // Import icons

const PostInteractions = ({ postId, userId }) => {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Fetch initial post data
  useEffect(() => {
    fetchPostData();
  }, [postId]);

  const fetchPostData = async () => {
    try {
      const [likesResponse, commentsResponse] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/api/posts/${postId}/comments`)
      ]);

      setLikes(likesResponse.data.likes || []);
      setComments(commentsResponse.data.comments || []);
      setIsLiked(likesResponse.data.likes?.includes(userId));
    } catch (error) {
      console.error('Error fetching post data:', error);
      showError('Failed to load post data');
    }
  };

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!userId) {
      showError('Please login to like posts');
      return;
    }

    try {
      setLoading(true);
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await api.post(`/posts/${postId}/${endpoint}`, { userId });

      if (response.data.success) {
        setLikes(response.data.likes);
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showError(error.response?.data?.message || 'Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      showError('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      showError('Please enter a comment');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/posts/comments', {
        postId,
        text: commentText.trim(),
        userId
      });

      if (response.data.success) {
        setComments(prev => [...prev, response.data.comment]);
        setCommentText('');
        showSuccess('Comment posted successfully');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      showError(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for notifications
  const showError = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  };

  const showSuccess = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  };

  return (
    <div className="post-interactions">
      {/* Like Button */}
      <div className="d-flex align-items-center mb-3">
        <button 
          className={`btn btn-sm me-2 ${isLiked ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={handleLikeToggle}
          disabled={loading}
        >
          <Heart 
            size={16} 
            className={`me-1 ${isLiked ? 'text-white' : ''}`} 
            fill={isLiked ? 'white' : 'none'} 
          />
          {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
        </button>

        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={16} className="me-1" />
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !commentText.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment-item mb-2">
                <div className="d-flex">
                  <img
                    src={comment.author?.avatar || '/default-avatar.png'}
                    alt={comment.author?.name}
                    className="rounded-circle me-2"
                    width="32"
                    height="32"
                  />
                  <div className="comment-content p-2 bg-light rounded">
                    <div className="fw-bold">{comment.author?.name}</div>
                    <div>{comment.text}</div>
                    <small className="text-muted">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
     

    </div>
  );
};

export default PostInteractions;
