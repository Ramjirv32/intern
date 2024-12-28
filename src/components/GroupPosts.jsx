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
        // You can either show the sign-in modal or redirect to login page
        // For now, let's trigger the existing sign-in modal
        setShowModal(true);
      }
    });
    return false;
  }
  return true;
};

const handleJoinGroup = async (groupId) => {
  if (!requireAuth('join groups')) return;
  
  try {
    // Rest of your join group logic
  } catch (error) {
    console.error('Error joining group:', error);
  }
};

const handleLeaveGroup = async (groupId) => {
  if (!requireAuth('leave groups')) return;
  
  try {
    // Rest of your leave group logic
  } catch (error) {
    console.error('Error leaving group:', error);
  }
};

const handleFollowGroup = async (groupId) => {
  if (!requireAuth('follow groups')) return;
  
  try {
    // Rest of your follow group logic
  } catch (error) {
    console.error('Error following group:', error);
  }
};

const handleUnfollowGroup = async (groupId) => {
  if (!requireAuth('unfollow groups')) return;
  
  try {
    // Rest of your unfollow group logic
  } catch (error) {
    console.error('Error unfollowing group:', error);
  }
};

const handleCreatePost = async (e) => {
  e.preventDefault();
  if (!requireAuth('create posts')) return;
  
  try {
    // Rest of your create post logic
  } catch (error) {
    console.error('Error creating post:', error);
  }
};

const handleLikePost = async (postId) => {
  if (!requireAuth('like posts')) return;
  
  try {
    // Rest of your like post logic
  } catch (error) {
    console.error('Error liking post:', error);
  }
};

const handleCommentPost = async (postId) => {
  if (!requireAuth('comment on posts')) return;
  
  try {
    // Rest of your comment post logic
  } catch (error) {
    console.error('Error commenting on post:', error);
  }
};

const handleSharePost = async (postId) => {
  if (!requireAuth('share posts')) return;
  
  try {
    // Rest of your share post logic
  } catch (error) {
    console.error('Error sharing post:', error);
  }
};

return (
  <div>
    {/* ... other JSX ... */}
    <button 
      className="btn btn-primary"
      onClick={() => handleJoinGroup(groupId)}
      disabled={!localStorage.getItem('token')}
    >
      Join Group
    </button>

    <button 
      className="btn btn-outline-primary"
      onClick={() => handleFollowGroup(groupId)}
      disabled={!localStorage.getItem('token')}
    >
      Follow
    </button>

    {/* For the create post button/form */}
    <button 
      className="btn btn-primary"
      onClick={() => {
        if (requireAuth('create a post')) {
          setShowCreatePost(true);
        }
      }}
      disabled={!localStorage.getItem('token')}
    >
      Write a Post
    </button>

    {/* For post actions */}
    <div className="post-actions">
      <button 
        className="btn btn-link"
        onClick={() => handleLikePost(post._id)}
        disabled={!localStorage.getItem('token')}
      >
        Like
      </button>
      <button 
        className="btn btn-link"
        onClick={() => handleCommentPost(post._id)}
        disabled={!localStorage.getItem('token')}
      >
        Comment
      </button>
      <button 
        className="btn btn-link"
        onClick={() => handleSharePost(post._id)}
        disabled={!localStorage.getItem('token')}
      >
        Share
      </button>
    </div>
    {/* ... rest of your JSX ... */}
  </div>
); 