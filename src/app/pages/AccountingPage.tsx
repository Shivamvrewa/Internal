import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchPayments } from '../store/slices/paymentsSlice';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { parseMetadata, formatDateTime, getCurrentLocalDateTimeString } from '../services/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { StatsCard } from '../components/analytics/StatsCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '../components/ui/badge';

export function AccountingPage() {
  const dispatch = useDispatch<any>();
  const { expenses, status: expensesStatus } = useSelector((state: RootState) => state.expenses);
  const { payments, status: paymentsStatus } = useSelector((state: RootState) => state.payments);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  useEffect(() => {
    if (expensesStatus === 'idle') dispatch(fetchExpenses());
    if (paymentsStatus === 'idle') dispatch(fetchPayments());
  }, [expensesStatus, paymentsStatus, dispatch]);

  const monthlyIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = monthlyIncome - monthlyExpenses;
  const profitMargin = monthlyIncome > 0 ? ((netProfit / monthlyIncome) * 100).toFixed(1) : '0.0';
  const openingBalance = 200000;
  const cashBalance = openingBalance + monthlyIncome - monthlyExpenses;
  const closingBalance = openingBalance + monthlyIncome - monthlyExpenses;
  const netChange = monthlyIncome - monthlyExpenses;

  // Generate monthlyComparison based on actual payments and expenses
  const monthlyComparison = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap: Record<string, { month: string, income: number, expense: number, profit: number }> = {};
    
    // Initialize current year months up to current month
    const currentMonth = new Date().getMonth();
    for (let i = Math.max(0, currentMonth - 5); i <= currentMonth; i++) {
      dataMap[months[i]] = { month: months[i], income: 0, expense: 0, profit: 0 };
    }

    payments.forEach(p => {
      const date = new Date(p.date);
      const monthStr = months[date.getMonth()];
      if (dataMap[monthStr]) {
        dataMap[monthStr].income += p.amount;
        dataMap[monthStr].profit = dataMap[monthStr].income - dataMap[monthStr].expense;
      }
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      const monthStr = months[date.getMonth()];
      if (dataMap[monthStr]) {
        dataMap[monthStr].expense += e.amount;
        dataMap[monthStr].profit = dataMap[monthStr].income - dataMap[monthStr].expense;
      }
    });

    return Object.values(dataMap);
  }, [payments, expenses]);

  // Combine payments and expenses into ledger entries, sorted by date
  const ledgerEntries = useMemo(() => {
    const combined = [
      ...payments.map(p => {
        const parsed = parseMetadata(p.notes || '');
        return {
          id: p.id,
          date: p.date,
          description: `Customer Payment - ${p.customerName}`,
          createdBy: parsed.createdBy,
          type: 'income',
          amount: p.amount,
          balance: 0 // Will compute running balance below
        };
      }),
      ...expenses.map(e => {
        const parsed = parseMetadata(e.description);
        return {
          id: e.id,
          date: e.date,
          description: `${e.category || 'Expense'} - ${parsed.cleanText}`,
          createdBy: parsed.createdBy,
          type: 'expense',
          amount: -e.amount,
          balance: 0
        };
      })
    ];

    // Sort by date descending
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Compute running balance from bottom up starting from opening balance
    let runningBalance = 200000;
    for (let i = combined.length - 1; i >= 0; i--) {
      runningBalance += combined[i].amount;
      combined[i].balance = runningBalance;
    }
    
    return combined;
  }, [payments, expenses]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounting & Cash Flow</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Complete financial overview
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-900/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Income Entry</DialogTitle>
                <DialogDescription>Record new income</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="₹ 0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer Payment</SelectItem>
                      <SelectItem value="other">Other Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="datetime-local" defaultValue={getCurrentLocalDateTimeString()} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Enter details" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddIncomeOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddIncomeOpen(false)}>Add Income</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense Entry</DialogTitle>
                <DialogDescription>Record new expense</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="₹ 0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="raw-material">Raw Material</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="datetime-local" defaultValue={getCurrentLocalDateTimeString()} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Enter details" />
                </div>
                <div className="space-y-2">
                  <Label>Vendor (Optional)</Label>
                  <Input placeholder="Vendor name" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddExpenseOpen(false)}>Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Income"
          titleHi=" "
          value={`₹${monthlyIncome.toLocaleString('en-IN')}`}
          change="+10.5% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Total Expenses"
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
          change={`${profitMargin}% margin`}
          changeType="positive"
          icon={DollarSign}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Cash Balance"
          titleHi=" "
          value={`₹${cashBalance.toLocaleString('en-IN')}`}
          change="+8.2% this month"
          changeType="positive"
          icon={Wallet}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit/Loss Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss Trend</CardTitle>
            <CardDescription>/6 month comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyComparison}>
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
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
            <CardDescription>Income vs Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison}>
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
                <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ledger & Cash Flow */}
      <Tabs defaultValue="ledger" className="w-full">
        <TabsList>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Ledger</CardTitle>
              <CardDescription>All transactions in chronological order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Entry ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{formatDateTime(entry.date)}</TableCell>
                        <TableCell className="text-gray-500">{entry.id}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-semibold px-2.5 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30 rounded-full">
                            {entry.createdBy || 'System'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.type === 'income' ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              Income
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                              Expense
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={entry.amount > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                            {entry.amount > 0 ? '+' : ''}₹{Math.abs(entry.amount).toLocaleString('en-IN')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{entry.balance.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Opening Balance</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  ₹{openingBalance.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">May 1, 2026</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  +₹{monthlyIncome.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  -₹{monthlyExpenses.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Closing Balance</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  ₹{closingBalance.toLocaleString('en-IN')}
                </p>
                <p className={`text-xs font-semibold mt-1 ${netChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {netChange >= 0 ? '+' : ''}₹{netChange.toLocaleString('en-IN')} net change
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
