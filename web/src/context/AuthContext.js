import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any existing auth state on mount
    const init = async () => {
      await auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    };
    
    init();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore
      await setDoc(doc(db, 'adminUsers', userCredential.user.uid), {
        name,
        email,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      setUser(userCredential.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Error in signup:', error);
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/Password authentication is not enabled. Please contact support.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return { 
          success: false, 
          error: 'Email and password are required' 
        };
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Error in login:', error);
      let errorMessage = 'Failed to login';
      
      switch (error.code) {
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/missing-password':
          errorMessage = 'Password is required';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error in logout:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || Date.now() // Use timestamp number
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  const addNewUser = async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: userData.name,
        email: userData.email,
        createdAt: Date.now(),  // Store as milliseconds timestamp
        role: 'user'
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding new user:', error);
      return { success: false, error: error.message };
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    signup,
    loading,
    getAllUsers,
    addNewUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
