import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { StatsCard } from '../components/analytics/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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

const monthlyData = [
  { month: 'Jan', income: 85000, expenses: 45000 },
  { month: 'Feb', income: 92000, expenses: 48000 },
  { month: 'Mar', income: 88000, expenses: 47000 },
  { month: 'Apr', income: 95000, expenses: 50000 },
  { month: 'May', income: 105000, expenses: 52000 },
];

const cashFlowData = [
  { day: 'Mon', amount: 8500 },
  { day: 'Tue', amount: 12000 },
  { day: 'Wed', amount: 9500 },
  { day: 'Thu', amount: 15000 },
  { day: 'Fri', amount: 18000 },
  { day: 'Sat', amount: 22000 },
  { day: 'Sun', amount: 16000 },
];

const expenseBreakdown = [
  { name: 'Salary', value: 45000, color: '#3b82f6' },
  { name: 'Rent', value: 25000, color: '#10b981' },
  { name: 'Materials', value: 15000, color: '#f59e0b' },
  { name: 'Utilities', value: 3500, color: '#ef4444' },
  { name: 'Marketing', value: 8000, color: '#8b5cf6' },
  { name: 'Other', value: 6500, color: '#6b7280' },
];

export function DashboardPage() {
  const { customers } = useSelector((state: RootState) => state.customers);
  const { payments } = useSelector((state: RootState) => state.payments);
  const { expenses } = useSelector((state: RootState) => state.expenses);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.paymentStatus === 'active').length;
  const pendingPayments = customers.filter(c => c.pendingAmount > 0).length;
  const totalPendingAmount = customers.reduce((sum, c) => sum + c.pendingAmount, 0);

  const monthlyIncome = 105000;
  const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = monthlyIncome - monthlyExpenses;
  const cashInHand = 245000;

  const recentPayments = payments.slice(0, 5);
  const upcomingDues = customers
    .filter(c => c.daysRemaining <= 10 && c.daysRemaining > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your business performance
        </p>
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
                      <p className="text-xs text-gray-500">{payment.date}</p>
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
