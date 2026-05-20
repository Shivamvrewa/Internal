import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark';
  language: 'en' | 'hi';
}

const initialState: ThemeState = {
  mode: 'light',
  language: 'en',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { toggleTheme, setLanguage } = themeSlice.actions;
export default themeSlice.reducer;
