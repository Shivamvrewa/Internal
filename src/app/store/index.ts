import { configureStore } from '@reduxjs/toolkit';
import customersReducer from './slices/customersSlice';
import paymentsReducer from './slices/paymentsSlice';
import expensesReducer from './slices/expensesSlice';
import staffReducer from './slices/staffSlice';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customersReducer,
    payments: paymentsReducer,
    expenses: expensesReducer,
    staff: staffReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
