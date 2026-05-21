import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  joiningDate: string;
  plan: string;
  paymentStatus: 'active' | 'pending' | 'overdue';
  daysRemaining: number;
  pendingAmount: number;
  lastPaymentDate: string;
  totalPaid: number;
  email?: string;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    status: string;
  }>;
  notes?: string;
}

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  status: 'idle',
  error: null,
};

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async () => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) throw error;
  return data as Customer[];
});

export const addCustomerDb = createAsyncThunk('customers/addCustomer', async (customer: Customer) => {
  const { data, error } = await supabase.from('customers').insert([customer]).select();
  if (error) throw error;
  return data[0] as Customer;
});

export const updateCustomerDb = createAsyncThunk('customers/updateCustomer', async (customer: Customer) => {
  const { data, error } = await supabase.from('customers').update(customer).eq('id', customer.id).select();
  if (error) throw error;
  return data[0] as Customer;
});

export const deleteCustomerDb = createAsyncThunk('customers/deleteCustomer', async (id: string) => {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
  return id;
});

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    // optimistic local updates if needed, though thunks handle the real data
    addCustomerLocal: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomerLocal: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomerLocal: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addCustomerDb.fulfilled, (state, action) => {
        state.customers.push(action.payload);
      })
      .addCase(updateCustomerDb.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(deleteCustomerDb.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
      });
  }
});

export const { setSelectedCustomer, addCustomerLocal, updateCustomerLocal, deleteCustomerLocal } = customersSlice.actions;
export default customersSlice.reducer;
