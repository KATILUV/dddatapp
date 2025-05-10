import { useState, useEffect, useContext, createContext } from 'react';
import { storeData, getData, removeData } from '../utils/storage';
import axios from 'axios';

// Create a context for authentication state
const AuthContext = createContext();

// Provider component that wraps your app and makes auth object available to any
// child component that calls useAuth().
export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Hook for child components to get the auth object and re-render when it changes.
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is logged in on initial load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Try to get user data from local storage first
        const storedUser = await getData('userData');
        
        if (storedUser) {
          setUser(storedUser);
          // Verify with the server to make sure the session is still valid
          try {
            const response = await axios.get('/api/auth/user');
            if (response.data) {
              setUser(response.data);
              await storeData('userData', response.data);
            }
          } catch (err) {
            // Session invalid/expired, clear local storage
            await removeData('userData');
            setUser(null);
          }
        } else {
          // Try to get the user from the server (in case they're already logged in)
          try {
            const response = await axios.get('/api/auth/user');
            if (response.data) {
              setUser(response.data);
              await storeData('userData', response.data);
            }
          } catch (err) {
            // Not logged in, that's fine
          }
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Sign in function
  const signIn = async () => {
    try {
      // Redirect to Replit Auth login
      window.location.href = '/api/login';
    } catch (err) {
      console.error('Error during sign in:', err);
      setError(err);
      throw err;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear user data from local storage
      await removeData('userData');
      setUser(null);
      
      // Redirect to the logout endpoint
      window.location.href = '/api/logout';
    } catch (err) {
      console.error('Error during sign out:', err);
      setError(err);
      throw err;
    }
  };

  // Return the user object and auth methods
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };
}