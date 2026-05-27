import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const getInitialAuth = (): AuthState => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.email) {
          return {
            isAuthenticated: true,
            user,
          };
        }
      } catch (e) {
        console.error('Failed to parse persistent user auth session', e);
      }
    }
  }
  return {
    isAuthenticated: true,
    user: {
      name: 'Shivam Vrewa',
      email: 'shivam.vrewa@gmail.com',
      role: 'Admin',
    },
  };
};

const initialState: AuthState = getInitialAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; name: string; role: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_user', JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('app_user');
      }
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
