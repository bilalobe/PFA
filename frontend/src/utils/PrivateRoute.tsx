import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../types/store'; // Or wherever your root reducer is

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/login'); 
    }
  }, [isAuthenticated, router]);

  // If authenticated, render the children (the protected component)
  return isAuthenticated ? <>{children}</> : null; 
};

export default PrivateRoute;