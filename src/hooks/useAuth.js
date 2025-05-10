/**
 * Authentication hook for managing user authentication state
 * Simplified for development with the basic server
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  // For development - check if there's a mock user in localStorage
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from API endpoint first
        let userData = null;
        
        try {
          userData = await api.getCurrentUser();
        } catch (apiError) {
          console.log('API user endpoint not available, using localStorage fallback');
        }
        
        // If API call fails or returns no user, try localStorage
        if (!userData) {
          const storedUser = localStorage.getItem('solstice_user');
          if (storedUser) {
            userData = JSON.parse(storedUser);
          }
        }
        
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Create auth value object
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    
    // For development - simplified auth functions
    signIn: async () => {
      try {
        // In production, this would redirect to Replit Auth
        // For dev/demo, we'll create a mock user
        const mockUser = {
          id: '1',
          username: 'demouser',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          profileImageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=a894ff&color=fff'
        };
        
        // Store user in localStorage for persistence
        localStorage.setItem('solstice_user', JSON.stringify(mockUser));
        setUser(mockUser);
        
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    
    // Sign out function
    signOut: async () => {
      try {
        // Clear stored user
        localStorage.removeItem('solstice_user');
        setUser(null);
        return true;
      } catch (error) {
        console.error('Sign out error:', error);
        return false;
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convenience function to get the auth state
export function useProvideAuth() {
  return useAuth();
}