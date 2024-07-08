import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { PrivateRouteProps } from '../interfaces/props';

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isAuthenticated }) => {
  const router = useRouter();

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