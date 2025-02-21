import { auth } from '../firebase/config';

export const initializeAuth = async () => {
  try {
    // Just initialize auth without automatic sign-in
    console.log('Auth service initialized');
    return null;
  } catch (error) {
    console.error('Auth initialization error:', error);
    throw error;
  }
};
