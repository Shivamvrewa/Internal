import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { RootState } from '../store';
import { fetchCustomers } from '../store/slices/customersSlice';
import { fetchPayments } from '../store/slices/paymentsSlice';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { StatsCard } from '../components/analytics/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { formatDateTime } from '../services/utils';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function DashboardPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { customers, status: customersStatus } = useSelector((state: RootState) => state.customers);
  const { payments, status: paymentsStatus } = useSelector((state: RootState) => state.payments);
  const { expenses, status: expensesStatus } = useSelector((state: RootState) => state.expenses);

  useEffect(() => {
    if (customersStatus === 'idle') dispatch(fetchCustomers());
    if (paymentsStatus === 'idle') dispatch(fetchPayments());
    if (expensesStatus === 'idle') dispatch(fetchExpenses());
  }, [customersStatus, paymentsStatus, expensesStatus, dispatch]);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.paymentStatus === 'active').length;
  const pendingPayments = customers.filter(c => c.pendingAmount > 0).length;
  const totalPendingAmount = customers.reduce((sum, c) => sum + c.pendingAmount, 0);

  const monthlyIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = monthlyIncome - monthlyExpenses;
  const cashInHand = monthlyIncome - monthlyExpenses; // Simplified for realtime display

  // Generate monthlyData based on actual payments and expenses
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap: Record<string, { month: string, income: number, expenses: number }> = {};
    
    // Initialize current year months up to current month (or all 12 if you prefer)
    const currentMonth = new Date().getMonth();
    for (let i = Math.max(0, currentMonth - 5); i <= currentMonth; i++) {
      dataMap[months[i]] = { month: months[i], income: 0, expenses: 0 };
    }

    payments.forEach(p => {
      const date = new Date(p.date);
      const monthStr = months[date.getMonth()];
      if (dataMap[monthStr]) {
        dataMap[monthStr].income += p.amount;
      }
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      const monthStr = months[date.getMonth()];
      if (dataMap[monthStr]) {
        dataMap[monthStr].expenses += e.amount;
      }
    });

    return Object.values(dataMap);
  }, [payments, expenses]);

  // Generate expense breakdown
  const expenseBreakdown = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    const formatCategoryName = (cat: string) => {
      return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    expenses.forEach(e => {
      const cat = e.category ? formatCategoryName(e.category) : 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
    });
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];
    return Object.entries(categoryTotals).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [expenses]);

  // Generate weekly cash flow (simplified mapping to past 7 days)
  const cashFlowData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap: Record<string, { day: string, amount: number }> = {};
    
    // Initialize past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = days[d.getDay()];
      dataMap[d.toISOString().split('T')[0]] = { day: dayStr, amount: 0 };
    }

    payments.forEach(p => {
      if (dataMap[p.date]) {
        dataMap[p.date].amount += p.amount;
      }
    });

    return Object.values(dataMap);
  }, [payments]);

  const recentPayments = payments.slice(0, 5);
  const upcomingDues = customers
    .filter(c => c.daysRemaining <= 10 && c.daysRemaining > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your business performance</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button 
            onClick={() => navigate('/payments?openAdd=true')}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Quick Payment
          </Button>
          <Button 
            onClick={() => navigate('/expenses?openAdd=true')}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Quick Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Customers"
          titleHi=" "
          value={totalCustomers}
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Active Customers"
          titleHi=" "
          value={activeCustomers}
          change={`${Math.round((activeCustomers / totalCustomers) * 100)}% of total`}
          changeType="positive"
          icon={UserCheck}
          iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          title="Pending Payments"
          titleHi=" "
          value={pendingPayments}
          change={`₹${totalPendingAmount.toLocaleString('en-IN')} total`}
          changeType="negative"
          icon={CreditCard}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          title="Cash In Hand"
          titleHi="  "
          value={`₹${cashInHand.toLocaleString('en-IN')}`}
          change="+8.2% this month"
          changeType="positive"
          icon={Wallet}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatsCard
          title="Monthly Income"
          titleHi=" "
          value={`₹${monthlyIncome.toLocaleString('en-IN')}`}
          change="+10.5% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Monthly Expenses"
          titleHi=" "
          value={`₹${monthlyExpenses.toLocaleString('en-IN')}`}
          change="+5.2% from last month"
          changeType="neutral"
          icon={TrendingDown}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatsCard
          title="Net Profit"
          titleHi=" "
          value={`₹${netProfit.toLocaleString('en-IN')}`}
          change={`${Math.round((netProfit / monthlyIncome) * 100)}% margin`}
          changeType="positive"
          icon={DollarSign}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Cash Flow */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Cash Flow</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Daily Collection"
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{payment.customerName}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(payment.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      +₹{payment.amount.toLocaleString('en-IN')}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {payment.method.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent payments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Dues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Dues</CardTitle>
              <CardDescription>Payments due soon</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDues.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-500">
                        Due in {customer.daysRemaining} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      ₹{customer.pendingAmount.toLocaleString('en-IN')}
                    </p>
                    <Badge variant="outline" className="text-xs border-orange-200">
                      {customer.plan}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingDues.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming dues</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
