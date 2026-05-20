import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const mockExpenses: Expense[] = [
  {
    id: 'EXP001',
    category: 'rent',
    amount: 25000,
    date: '2026-05-01',
    description: 'Monthly office rent',
    vendor: 'Property Owner',
    status: 'approved',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'EXP002',
    category: 'salary',
    amount: 45000,
    date: '2026-05-01',
    description: 'Staff salaries for May',
    status: 'approved',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'EXP003',
    category: 'electricity',
    amount: 3500,
    date: '2026-05-10',
    description: 'Electricity bill',
    vendor: 'Electric Company',
    status: 'approved',
    paymentMethod: 'UPI',
  },
  {
    id: 'EXP004',
    category: 'raw-material',
    amount: 15000,
    date: '2026-05-15',
    description: 'Kitchen supplies and ingredients',
    vendor: 'Wholesale Supplier',
    status: 'approved',
    paymentMethod: 'Cash',
  },
  {
    id: 'EXP005',
    category: 'marketing',
    amount: 8000,
    date: '2026-05-18',
    description: 'Social media advertising',
    vendor: 'Digital Agency',
    status: 'pending',
    paymentMethod: 'Card',
  },
];

interface ExpensesState {
  expenses: Expense[];
}

const initialState: ExpensesState = {
  expenses: mockExpenses,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(e => e.id !== action.payload);
    },
  },
});

export const { addExpense, updateExpense, deleteExpense } = expensesSlice.actions;
export default expensesSlice.reducer;
