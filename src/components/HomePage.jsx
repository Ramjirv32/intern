const handleLikePost = async (postId) => {
  // No need to check authentication here
  try {
    const response = await axiosInstance.post(`/api/posts/${postId}/like`);
    console.log('Post liked:', response.data);
    // Update your state or UI accordingly
  } catch (error) {
    console.error('Error liking post:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to like the post. Please try again.'
    });
  }
}; 