import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const mockPayments: Payment[] = [
  {
    id: 'PAY001',
    customerId: 'CUST001',
    customerName: 'राज कुमार / Raj Kumar',
    amount: 3000,
    date: '2026-05-19',
    method: 'upi',
    status: 'completed',
    type: 'full',
    invoiceNumber: 'INV-2026-001',
  },
  {
    id: 'PAY002',
    customerId: 'CUST002',
    customerName: 'प्रिया शर्मा / Priya Sharma',
    amount: 1500,
    date: '2026-05-18',
    method: 'cash',
    status: 'completed',
    type: 'partial',
    invoiceNumber: 'INV-2026-002',
  },
  {
    id: 'PAY003',
    customerId: 'CUST005',
    customerName: 'विक्रम सिंह / Vikram Singh',
    amount: 3000,
    date: '2026-05-17',
    method: 'bank',
    status: 'completed',
    type: 'full',
    invoiceNumber: 'INV-2026-003',
  },
];

interface PaymentsState {
  payments: Payment[];
}

const initialState: PaymentsState = {
  payments: mockPayments,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload);
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },
  },
});

export const { addPayment, updatePayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
