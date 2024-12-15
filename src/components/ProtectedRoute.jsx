import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userEmail');

  if (!isAuthenticated) {
    Swal.fire({
      title: 'Access Denied',
      text: 'Please login to access this page',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#0056b3'
    });
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 