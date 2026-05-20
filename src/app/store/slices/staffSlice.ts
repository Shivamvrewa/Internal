import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Staff {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'accountant' | 'staff';
  email: string;
  mobile: string;
  joiningDate: string;
  salary: number;
  status: 'active' | 'inactive';
  lastActive?: string;
}

const mockStaff: Staff[] = [
  {
    id: 'STF001',
    name: 'अनिल वर्मा / Anil Verma',
    role: 'admin',
    email: 'anil@business.com',
    mobile: '+91 98765 11111',
    joiningDate: '2023-01-01',
    salary: 50000,
    status: 'active',
    lastActive: '2026-05-19',
  },
  {
    id: 'STF002',
    name: 'रेखा सिंह / Rekha Singh',
    role: 'manager',
    email: 'rekha@business.com',
    mobile: '+91 98765 22222',
    joiningDate: '2023-06-15',
    salary: 35000,
    status: 'active',
    lastActive: '2026-05-19',
  },
  {
    id: 'STF003',
    name: 'मोहन लाल / Mohan Lal',
    role: 'accountant',
    email: 'mohan@business.com',
    mobile: '+91 98765 33333',
    joiningDate: '2024-02-01',
    salary: 30000,
    status: 'active',
    lastActive: '2026-05-18',
  },
  {
    id: 'STF004',
    name: 'सीता देवी / Seeta Devi',
    role: 'staff',
    email: 'seeta@business.com',
    mobile: '+91 98765 44444',
    joiningDate: '2024-08-10',
    salary: 20000,
    status: 'active',
    lastActive: '2026-05-19',
  },
];

interface StaffState {
  staff: Staff[];
}

const initialState: StaffState = {
  staff: mockStaff,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    addStaff: (state, action: PayloadAction<Staff>) => {
      state.staff.push(action.payload);
    },
    updateStaff: (state, action: PayloadAction<Staff>) => {
      const index = state.staff.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staff[index] = action.payload;
      }
    },
    deleteStaff: (state, action: PayloadAction<string>) => {
      state.staff = state.staff.filter(s => s.id !== action.payload);
    },
  },
});

export const { addStaff, updateStaff, deleteStaff } = staffSlice.actions;
export default staffSlice.reducer;
