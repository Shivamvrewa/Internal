import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  itemName: string;
  amount?: number;
  orderType: 'subscription' | 'custom';
  status: 'pending' | 'delivered';
  date: string; // YYYY-MM-DD
  timestamp: string;
}

interface OrdersState {
  orders: Order[];
}

const loadSavedOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem('healthybowl_orders');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load orders from localStorage:', e);
    return [];
  }
};

const initialState: OrdersState = {
  orders: loadSavedOrders(),
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
      localStorage.setItem('healthybowl_orders', JSON.stringify(state.orders));
    },
    markAsDelivered: (state, action: PayloadAction<string>) => {
      const index = state.orders.findIndex(o => o.id === action.payload);
      if (index !== -1) {
        state.orders[index].status = 'delivered';
        localStorage.setItem('healthybowl_orders', JSON.stringify(state.orders));
      }
    },
    autoGenerateSubscriptionOrders: (state, action: PayloadAction<{ customers: any[]; date: string }>) => {
      const { customers, date } = action.payload;
      let changed = false;

      customers.forEach(customer => {
        const activePlans = [
          'Fruit Bowl week',
          'Fruit Bowl Month',
          'Fruit + Drink week',
          'fruit + Drink Month'
        ];
        
        if (activePlans.includes(customer.plan)) {
          // Check if there's already an order for this customer for today
          const exists = state.orders.some(o => o.customerId === customer.id && o.date === date);
          if (!exists) {
            const newOrder: Order = {
              id: `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              customerId: customer.id,
              customerName: customer.name,
              customerMobile: customer.mobile,
              itemName: customer.plan,
              orderType: 'subscription',
              status: 'pending',
              date: date,
              timestamp: new Date().toISOString()
            };
            state.orders.push(newOrder);
            changed = true;
          }
        }
      });

      if (changed) {
        localStorage.setItem('healthybowl_orders', JSON.stringify(state.orders));
      }
    }
  }
});

export const { addOrder, markAsDelivered, autoGenerateSubscriptionOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
