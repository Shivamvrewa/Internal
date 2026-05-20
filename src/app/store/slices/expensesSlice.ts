import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

export interface Expense {
  id: string;
  category: 'rent' | 'salary' | 'electricity' | 'raw-material' | 'packaging' | 'marketing' | 'maintenance' | 'miscellaneous';
  amount: number;
  date: string;
  description: string;
  vendor?: string;
  status: 'approved' | 'pending' | 'rejected';
  paymentMethod?: string;
  receiptUrl?: string;
}

interface ExpensesState {
  expenses: Expense[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  status: 'idle',
  error: null,
};

export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
  const { data, error } = await supabase.from('expenses').select('*');
  if (error) throw error;
  return data as Expense[];
});

export const addExpenseDb = createAsyncThunk('expenses/addExpense', async (expense: Expense) => {
  const { data, error } = await supabase.from('expenses').insert([expense]).select();
  if (error) throw error;
  return data[0] as Expense;
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpenseLocal: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    updateExpenseLocal: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    deleteExpenseLocal: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(e => e.id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addExpenseDb.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      });
  }
});

export const { addExpenseLocal, updateExpenseLocal, deleteExpenseLocal } = expensesSlice.actions;
export default expensesSlice.reducer;
