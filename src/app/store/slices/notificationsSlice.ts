import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  id: string;
  type: 'expense' | 'payment' | 'customer';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  amount?: number;
  action?: 'added' | 'updated' | 'deleted';
}

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
}

const getInitialNotifications = (): AppNotification[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
  }
  
  // Default sample notifications if none saved
  return [
    {
      id: 'noti-default-1',
      type: 'payment',
      title: 'Overdue Payment',
      description: 'Sunita Devi - ₹3,500 overdue',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      isRead: false,
      action: 'updated',
    },
    {
      id: 'noti-default-2',
      type: 'payment',
      title: 'Payment Due Soon',
      description: 'Priya Sharma - ₹2,500 due in 5 days',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      isRead: false,
      action: 'updated',
    },
    {
      id: 'noti-default-3',
      type: 'payment',
      title: 'Payment Received',
      description: 'Raj Kumar paid ₹3,000 via UPI',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      isRead: false,
      action: 'added',
    },
  ];
};

const getUnreadCount = (list: AppNotification[]) => {
  return list.filter(n => !n.isRead).length;
};

const initialList = getInitialNotifications();

const initialState: NotificationsState = {
  notifications: initialList,
  unreadCount: getUnreadCount(initialList),
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<AppNotification, 'isRead'>>) => {
      const newNoti: AppNotification = {
        ...action.payload,
        isRead: false,
      };
      state.notifications.unshift(newNoti);
      state.unreadCount = getUnreadCount(state.notifications);
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_notifications', JSON.stringify(state.notifications));
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1 && !state.notifications[index].isRead) {
        state.notifications[index].isRead = true;
        state.unreadCount = getUnreadCount(state.notifications);
        if (typeof window !== 'undefined') {
          localStorage.setItem('app_notifications', JSON.stringify(state.notifications));
        }
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
      state.unreadCount = 0;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_notifications', JSON.stringify(state.notifications));
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_notifications', JSON.stringify([]));
      }
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearAllNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
