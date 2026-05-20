import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

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

interface StaffState {
  staff: Staff[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StaffState = {
  staff: [],
  status: 'idle',
  error: null,
};

export const fetchStaff = createAsyncThunk('staff/fetchStaff', async () => {
  const { data, error } = await supabase.from('staff').select('*');
  if (error) throw error;
  return data as Staff[];
});

export const addStaffDb = createAsyncThunk('staff/addStaff', async (member: Staff) => {
  const { data, error } = await supabase.from('staff').insert([member]).select();
  if (error) throw error;
  return data[0] as Staff;
});

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    addStaffLocal: (state, action: PayloadAction<Staff>) => {
      state.staff.push(action.payload);
    },
    updateStaffLocal: (state, action: PayloadAction<Staff>) => {
      const index = state.staff.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staff[index] = action.payload;
      }
    },
    deleteStaffLocal: (state, action: PayloadAction<string>) => {
      state.staff = state.staff.filter(s => s.id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staff = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addStaffDb.fulfilled, (state, action) => {
        state.staff.push(action.payload);
      });
  }
});

export const { addStaffLocal, updateStaffLocal, deleteStaffLocal } = staffSlice.actions;
export default staffSlice.reducer;
