import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  method: 'cash' | 'upi' | 'bank' | 'card';
  status: 'completed' | 'pending' | 'failed';
  type: 'full' | 'partial' | 'emi';
  invoiceNumber?: string;
  notes?: string;
}

interface PaymentsState {
  payments: Payment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  status: 'idle',
  error: null,
};

export const fetchPayments = createAsyncThunk('payments/fetchPayments', async () => {
  const { data, error } = await supabase.from('payments').select('*');
  if (error) throw error;
  return data as Payment[];
});

export const addPaymentDb = createAsyncThunk('payments/addPayment', async (payment: Payment) => {
  const { data, error } = await supabase.from('payments').insert([payment]).select();
  if (error) throw error;
  return data[0] as Payment;
});

export const updatePaymentDb = createAsyncThunk('payments/updatePayment', async (payment: Payment) => {
  const { data, error } = await supabase.from('payments').update(payment).eq('id', payment.id).select();
  if (error) throw error;
  return data[0] as Payment;
});

export const deletePaymentDb = createAsyncThunk('payments/deletePayment', async (id: string) => {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
  return id;
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    addPaymentLocal: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload);
    },
    updatePaymentLocal: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },
    deletePaymentLocal: (state, action: PayloadAction<string>) => {
      state.payments = state.payments.filter(p => p.id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addPaymentDb.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      })
      .addCase(updatePaymentDb.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(deletePaymentDb.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p.id !== action.payload);
      });
  }
});

export const { addPaymentLocal, updatePaymentLocal, deletePaymentLocal } = paymentsSlice.actions;
export default paymentsSlice.reducer;
