import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user); 
  const token = useSelector((state) => state.auth.token); 
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); 
  const error = useSelector((state) => state.auth.error); // Assuming error is part of auth state

  useEffect(() => {
    if (user || token) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [user, token]);

  return { user, token, isAuthenticated, loading, error };
};
