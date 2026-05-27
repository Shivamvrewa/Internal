import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { supabase } from '../../services/supabase';
import { addExpenseLocal, updateExpenseLocal, deleteExpenseLocal } from '../../store/slices/expensesSlice';
import { addPaymentLocal, updatePaymentLocal, deletePaymentLocal } from '../../store/slices/paymentsSlice';
import { addCustomerLocal, updateCustomerLocal, deleteCustomerLocal } from '../../store/slices/customersSlice';
import { addNotification } from '../../store/slices/notificationsSlice';
import { toast } from 'sonner';
import { parseMetadata } from '../../services/utils';

export function RootLayout() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const payments = useSelector((state: RootState) => state.payments.payments);
  const customers = useSelector((state: RootState) => state.customers.customers);

  const expensesRef = useRef(expenses);
  const paymentsRef = useRef(payments);
  const customersRef = useRef(customers);

  useEffect(() => {
    expensesRef.current = expenses;
  }, [expenses]);

  useEffect(() => {
    paymentsRef.current = payments;
  }, [payments]);

  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    // 1. Expenses subscription
    const expensesChannel = supabase
      .channel('expenses-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          console.log('Realtime expense change:', payload);
          if (payload.eventType === 'INSERT') {
            const newExpense = payload.new as any;
            if (!newExpense || !newExpense.id) return;
            const exists = expensesRef.current.some((e) => e.id === newExpense.id);
            if (!exists) {
              dispatch(addExpenseLocal(newExpense));
              const amountVal = newExpense.amount || 0;
              const { cleanText, createdBy } = parseMetadata(newExpense.description || '');
              const catVal = (newExpense.category || 'miscellaneous').replace('-', ' ');
              dispatch(addNotification({
                id: `noti-exp-ins-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'expense',
                title: 'New Expense Added',
                description: `${cleanText} - ₹${amountVal.toLocaleString('en-IN')} recorded by ${createdBy} for ${catVal}`,
                timestamp: new Date().toISOString(),
                action: 'added',
                amount: amountVal,
              }));
              toast.info(`${createdBy} added a new expense: ₹${amountVal.toLocaleString('en-IN')} for ${cleanText}`);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedExpense = payload.new as any;
            if (!updatedExpense || !updatedExpense.id) return;
            const existing = expensesRef.current.find((e) => e.id === updatedExpense.id);
            if (existing && JSON.stringify(existing) !== JSON.stringify(updatedExpense)) {
              dispatch(updateExpenseLocal(updatedExpense));
              const amountVal = updatedExpense.amount || 0;
              const { cleanText, createdBy } = parseMetadata(updatedExpense.description || '');
              const catVal = (updatedExpense.category || 'miscellaneous').replace('-', ' ');
              dispatch(addNotification({
                id: `noti-exp-upd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'expense',
                title: 'Expense Updated',
                description: `Expense "${cleanText}" updated by ${createdBy}: ₹${amountVal.toLocaleString('en-IN')}`,
                timestamp: new Date().toISOString(),
                action: 'updated',
                amount: amountVal,
              }));
              toast.info(`${createdBy} updated an expense: ₹${amountVal.toLocaleString('en-IN')} (${cleanText})`);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (!oldId) return;
            const exists = expensesRef.current.some((e) => e.id === oldId);
            if (exists) {
              dispatch(deleteExpenseLocal(oldId));
              dispatch(addNotification({
                id: `noti-exp-del-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'expense',
                title: 'Expense Deleted',
                description: `Expense ID ${oldId} was deleted`,
                timestamp: new Date().toISOString(),
                action: 'deleted',
              }));
              toast.warning(`An expense entry was deleted`);
            }
          }
        }
      )
      .subscribe();

    // 2. Payments subscription
    const paymentsChannel = supabase
      .channel('payments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Realtime payment change:', payload);
          if (payload.eventType === 'INSERT') {
            const newPayment = payload.new as any;
            if (!newPayment || !newPayment.id) return;
            const exists = paymentsRef.current.some((p) => p.id === newPayment.id);
            if (!exists) {
              dispatch(addPaymentLocal(newPayment));
              const amountVal = newPayment.amount || 0;
              const methodVal = (newPayment.method || 'cash').toUpperCase();
              const { cleanText, createdBy } = parseMetadata(newPayment.notes || '');
              dispatch(addNotification({
                id: `noti-pay-ins-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'payment',
                title: 'Payment Received',
                description: `${newPayment.customerName || 'Customer'} paid ₹${amountVal.toLocaleString('en-IN')} via ${methodVal} (added by ${createdBy})`,
                timestamp: new Date().toISOString(),
                action: 'added',
                amount: amountVal,
              }));
              toast.success(`${createdBy} recorded a payment of ₹${amountVal.toLocaleString('en-IN')} from ${newPayment.customerName || 'Customer'}!`);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedPayment = payload.new as any;
            if (!updatedPayment || !updatedPayment.id) return;
            const existing = paymentsRef.current.find((p) => p.id === updatedPayment.id);
            if (existing && JSON.stringify(existing) !== JSON.stringify(updatedPayment)) {
              dispatch(updatePaymentLocal(updatedPayment));
              const amountVal = updatedPayment.amount || 0;
              const { cleanText, createdBy } = parseMetadata(updatedPayment.notes || '');
              dispatch(addNotification({
                id: `noti-pay-upd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'payment',
                title: 'Payment Updated',
                description: `Payment from ${updatedPayment.customerName || 'Customer'} updated by ${createdBy}: ₹${amountVal.toLocaleString('en-IN')}`,
                timestamp: new Date().toISOString(),
                action: 'updated',
                amount: amountVal,
              }));
              toast.info(`${createdBy} updated a payment of ₹${amountVal.toLocaleString('en-IN')} for ${updatedPayment.customerName || 'Customer'}`);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (!oldId) return;
            const exists = paymentsRef.current.some((p) => p.id === oldId);
            if (exists) {
              dispatch(deletePaymentLocal(oldId));
              dispatch(addNotification({
                id: `noti-pay-del-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'payment',
                title: 'Payment Deleted',
                description: `Payment ID ${oldId} was deleted`,
                timestamp: new Date().toISOString(),
                action: 'deleted',
              }));
              toast.warning(`A payment entry was deleted`);
            }
          }
        }
      )
      .subscribe();

    // 3. Customers subscription
    const customersChannel = supabase
      .channel('customers-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Realtime customer change:', payload);
          if (payload.eventType === 'INSERT') {
            const newCustomer = payload.new as any;
            if (!newCustomer || !newCustomer.id) return;
            const exists = customersRef.current.some((c) => c.id === newCustomer.id);
            if (!exists) {
              dispatch(addCustomerLocal(newCustomer));
              dispatch(addNotification({
                id: `noti-cust-ins-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'customer',
                title: 'New Customer Registered',
                description: `${newCustomer.name || 'Customer'} joined on ${newCustomer.plan || 'Standard'} plan`,
                timestamp: new Date().toISOString(),
                action: 'added',
              }));
              toast.success(`New customer registered: ${newCustomer.name || 'Customer'}`);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCustomer = payload.new as any;
            if (!updatedCustomer || !updatedCustomer.id) return;
            const existing = customersRef.current.find((c) => c.id === updatedCustomer.id);
            if (existing && JSON.stringify(existing) !== JSON.stringify(updatedCustomer)) {
              dispatch(updateCustomerLocal(updatedCustomer));
              dispatch(addNotification({
                id: `noti-cust-upd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'customer',
                title: 'Customer Info Updated',
                description: `Details for ${updatedCustomer.name || 'Customer'} were updated`,
                timestamp: new Date().toISOString(),
                action: 'updated',
              }));
              toast.info(`Customer profile updated: ${updatedCustomer.name || 'Customer'}`);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (!oldId) return;
            const exists = customersRef.current.some((c) => c.id === oldId);
            if (exists) {
              dispatch(deleteCustomerLocal(oldId));
              dispatch(addNotification({
                id: `noti-cust-del-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'customer',
                title: 'Customer Removed',
                description: `Customer account ID ${oldId} was deleted`,
                timestamp: new Date().toISOString(),
                action: 'deleted',
              }));
              toast.warning(`A customer record was deleted`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(customersChannel);
    };
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

