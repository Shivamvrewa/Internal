import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const mockCustomers: Customer[] = [
  {
    id: 'CUST001',
    name: 'राज कुमार / Raj Kumar',
    mobile: '+91 98765 43210',
    address: 'Sector 15, Noida',
    joiningDate: '2024-01-15',
    plan: 'Premium Monthly',
    paymentStatus: 'active',
    daysRemaining: 20,
    pendingAmount: 0,
    lastPaymentDate: '2026-05-01',
    totalPaid: 15000,
    email: 'raj@example.com',
    payments: [
      { id: 'PAY001', amount: 3000, date: '2026-05-01', method: 'UPI', status: 'completed' },
      { id: 'PAY002', amount: 3000, date: '2026-04-01', method: 'Cash', status: 'completed' },
    ],
    notes: 'Regular customer, very punctual with payments',
  },
  {
    id: 'CUST002',
    name: 'प्रिया शर्मा / Priya Sharma',
    mobile: '+91 98123 45678',
    address: 'Dwarka, Delhi',
    joiningDate: '2024-03-20',
    plan: 'Basic Quarterly',
    paymentStatus: 'pending',
    daysRemaining: 5,
    pendingAmount: 2500,
    lastPaymentDate: '2026-02-15',
    totalPaid: 7500,
    email: 'priya@example.com',
    payments: [
      { id: 'PAY003', amount: 2500, date: '2026-02-15', method: 'Bank Transfer', status: 'completed' },
    ],
  },
  {
    id: 'CUST003',
    name: 'अमित पटेल / Amit Patel',
    mobile: '+91 99876 54321',
    address: 'Koramangala, Bangalore',
    joiningDate: '2023-11-10',
    plan: 'Premium Annual',
    paymentStatus: 'active',
    daysRemaining: 180,
    pendingAmount: 0,
    lastPaymentDate: '2025-11-10',
    totalPaid: 30000,
    email: 'amit@example.com',
    payments: [
      { id: 'PAY004', amount: 30000, date: '2025-11-10', method: 'Card', status: 'completed' },
    ],
  },
  {
    id: 'CUST004',
    name: 'सुनीता देवी / Sunita Devi',
    mobile: '+91 97654 32109',
    address: 'Varanasi, UP',
    joiningDate: '2025-12-01',
    plan: 'Basic Monthly',
    paymentStatus: 'overdue',
    daysRemaining: -10,
    pendingAmount: 3500,
    lastPaymentDate: '2026-03-01',
    totalPaid: 4500,
    email: 'sunita@example.com',
    payments: [
      { id: 'PAY005', amount: 1500, date: '2026-03-01', method: 'Cash', status: 'completed' },
    ],
  },
  {
    id: 'CUST005',
    name: 'विक्रम सिंह / Vikram Singh',
    mobile: '+91 96543 21098',
    address: 'Jaipur, Rajasthan',
    joiningDate: '2024-06-15',
    plan: 'Premium Monthly',
    paymentStatus: 'active',
    daysRemaining: 12,
    pendingAmount: 0,
    lastPaymentDate: '2026-05-10',
    totalPaid: 33000,
    email: 'vikram@example.com',
    payments: [
      { id: 'PAY006', amount: 3000, date: '2026-05-10', method: 'UPI', status: 'completed' },
    ],
  },
];

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
}

const initialState: CustomersState = {
  customers: mockCustomers,
  selectedCustomer: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
  },
});

export const { addCustomer, updateCustomer, deleteCustomer, setSelectedCustomer } = customersSlice.actions;
export default customersSlice.reducer;
