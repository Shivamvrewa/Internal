import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
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
  const { expenses } = useSelector((state: RootState) => state.expenses);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            व्यय प्रबंधन - Track and manage all expenses
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
                <DialogDescription>नया व्यय जोड़ें - Record expense details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category / श्रेणी</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent / किराया</SelectItem>
                      <SelectItem value="salary">Salary / वेतन</SelectItem>
                      <SelectItem value="electricity">Electricity / बिजली</SelectItem>
                      <SelectItem value="raw-material">Raw Material / सामग्री</SelectItem>
                      <SelectItem value="packaging">Packaging / पैकेजिंग</SelectItem>
                      <SelectItem value="marketing">Marketing / विपणन</SelectItem>
                      <SelectItem value="maintenance">Maintenance / रखरखाव</SelectItem>
                      <SelectItem value="miscellaneous">Miscellaneous / अन्य</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount / राशि</Label>
                  <Input type="number" placeholder="₹ 0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Date / तारीख</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Vendor / विक्रेता (Optional)</Label>
                  <Input placeholder="Vendor name" />
                </div>
                <div className="space-y-2">
                  <Label>Description / विवरण</Label>
                  <Textarea placeholder="Expense details..." />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select>
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
                <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddExpenseOpen(false)}>Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Expenses"
          titleHi="कुल व्यय"
          value={`₹${totalExpenses.toLocaleString('en-IN')}`}
          change="+5.2% from last month"
          changeType="neutral"
          icon={Receipt}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatsCard
          title="Approved"
          titleHi="स्वीकृत"
          value={approvedExpenses}
          change={`${expenses.length} total entries`}
          changeType="neutral"
          icon={CheckCircle}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Pending Approval"
          titleHi="अनुमोदन लंबित"
          value={pendingExpenses}
          change="Awaiting review"
          changeType="neutral"
          icon={Clock}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          title="Average/Day"
          titleHi="औसत/दिन"
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
            <CardDescription>श्रेणी के अनुसार व्यय - Current month breakdown</CardDescription>
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
            <CardDescription>श्रेणी तुलना - Expense distribution</CardDescription>
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
                placeholder="Search expenses... / व्यय खोजें..."
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
          <CardDescription>सभी व्यय - Complete expense records</CardDescription>
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
