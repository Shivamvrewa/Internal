import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchExpenses, addExpenseDb, Expense } from '../store/slices/expensesSlice';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { StatsCard } from '../components/analytics/StatsCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
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
import { Textarea } from '../components/ui/textarea';
import {
  Receipt,
  Plus,
  Download,
  Search,
  Filter,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  Users,
  Zap,
  Package,
  TrendingUp,
  Wrench,
  MoreHorizontal,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const categoryIcons = {
  rent: Home,
  salary: Users,
  electricity: Zap,
  'raw-material': Package,
  packaging: Package,
  marketing: TrendingUp,
  maintenance: Wrench,
  miscellaneous: MoreHorizontal,
};

const expenseByCategory = [
  { name: 'Salary', value: 45000, color: '#3b82f6' },
  { name: 'Rent', value: 25000, color: '#10b981' },
  { name: 'Raw Material', value: 15000, color: '#f59e0b' },
  { name: 'Marketing', value: 8000, color: '#8b5cf6' },
  { name: 'Electricity', value: 3500, color: '#ef4444' },
  { name: 'Other', value: 6500, color: '#6b7280' },
];

export function ExpensesPage() {
  const dispatch = useDispatch<any>();
  const { expenses, status } = useSelector((state: RootState) => state.expenses);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [category, setCategory] = useState('rent');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExpenses());
    }
  }, [status, dispatch]);

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newExpense: Expense = {
      id: `EXP-${uuidv4().substring(0, 8).toUpperCase()}`,
      category: category as Expense['category'],
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      vendor: formData.get('vendor') as string,
      status: 'pending',
      paymentMethod: paymentMethod,
    };
    await dispatch(addExpenseDb(newExpense));
    setIsAddExpenseOpen(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
    }[status];

    if (!config) return null;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Record expense details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpense}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
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
                    <Label>Amount</Label>
                    <Input name="amount" type="number" required placeholder="₹ 0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor(Optional)</Label>
                    <Input name="vendor" placeholder="Vendor name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea name="description" required placeholder="Expense details..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Expense</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Expenses"
          titleHi=" "
          value={`₹${totalExpenses.toLocaleString('en-IN')}`}
          change="+5.2% from last month"
          changeType="neutral"
          icon={Receipt}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatsCard
          title="Approved"
          titleHi=""
          value={approvedExpenses}
          change={`${expenses.length} total entries`}
          changeType="neutral"
          icon={CheckCircle}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Pending Approval"
          titleHi=" "
          value={pendingExpenses}
          change="Awaiting review"
          changeType="neutral"
          icon={Clock}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          title="Average/Day"
          titleHi="/"
          value={`₹${Math.round(totalExpenses / 19).toLocaleString('en-IN')}`}
          change="Current month"
          changeType="neutral"
          icon={TrendingUp}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Comparison</CardTitle>
            <CardDescription>Expense distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses......"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses ({filteredExpenses.length})</CardTitle>
          <CardDescription>Complete expense records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const Icon = categoryIcons[expense.category as keyof typeof categoryIcons] || Receipt;
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="capitalize">{expense.category.replace('-', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {expense.description}
                      </TableCell>
                      <TableCell>{expense.vendor || '-'}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          -₹{expense.amount.toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {expense.paymentMethod || 'N/A'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
