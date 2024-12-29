import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Eye } from 'lucide-react';
import axios from 'axios';

const Post = ({ post, user, onLikeUpdate }) => {
  const handleLike = async () => {
    if (!user) {
      alert('Please login to like posts');
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${post._id}/like`, {
        userId: user._id
      });

      if (onLikeUpdate) {
        onLikeUpdate(post._id, response.data);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      alert('Please login to dislike posts');
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${post._id}/dislike`, {
        userId: user._id
      });

      if (onLikeUpdate) {
        onLikeUpdate(post._id, response.data);
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  return (
    <div className="card mb-4">
      {post.image && (
        <div 
          style={{ 
            height: '220px',
            backgroundImage: `url(${post.image})`,
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
        <h5 className="card-title">{post.title}</h5>
        <p className="card-text text-muted">{post.content}</p>
        
        <div className="card-footer bg-white border-0 px-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3">
              <button 
                className={`btn btn-sm ${post.hasLiked ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={handleLike}
              >
                <ThumbsUp size={18} />
                {post.likes > 0 && <span className="ms-1">{post.likes}</span>}
              </button>
              
              <button 
                className={`btn btn-sm ${post.hasDisliked ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleDislike}
              >
                <ThumbsDown size={18} />
                {post.dislikes > 0 && <span className="ms-1">{post.dislikes}</span>}
              </button>

              <button className="btn btn-sm btn-outline-secondary">
                <MessageSquare size={18} />
                {post.comments?.length > 0 && (
                  <span className="ms-1">{post.comments.length}</span>
                )}
              </button>
            </div>

            <div className="d-flex align-items-center text-muted">
              <Eye size={18} className="me-1" />
              {post.views} views
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;

