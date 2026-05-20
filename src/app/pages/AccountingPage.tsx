import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
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

const monthlyComparison = [
  { month: 'Dec', income: 95000, expense: 48000, profit: 47000 },
  { month: 'Jan', income: 85000, expense: 45000, profit: 40000 },
  { month: 'Feb', income: 92000, expense: 48000, profit: 44000 },
  { month: 'Mar', income: 88000, expense: 47000, profit: 41000 },
  { month: 'Apr', income: 95000, expense: 50000, profit: 45000 },
  { month: 'May', income: 105000, expense: 52000, profit: 53000 },
];

const cashFlowSummary = [
  { name: 'Opening Balance', value: 200000, color: '#3b82f6' },
  { name: 'Income', value: 105000, color: '#10b981' },
  { name: 'Expenses', value: -52000, color: '#ef4444' },
  { name: 'Net Change', value: 53000, color: '#8b5cf6' },
];

export function AccountingPage() {
  const { expenses } = useSelector((state: RootState) => state.expenses);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const monthlyIncome = 105000;
  const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = monthlyIncome - monthlyExpenses;
  const profitMargin = ((netProfit / monthlyIncome) * 100).toFixed(1);
  const cashBalance = 245000;

  const ledgerEntries = [
    { id: 'L001', date: '2026-05-19', description: 'Customer Payment - Raj Kumar', type: 'income', amount: 3000, balance: 245000 },
    { id: 'L002', date: '2026-05-18', description: 'Marketing Expense', type: 'expense', amount: -8000, balance: 242000 },
    { id: 'L003', date: '2026-05-17', description: 'Customer Payment - Vikram Singh', type: 'income', amount: 3000, balance: 250000 },
    { id: 'L004', date: '2026-05-15', description: 'Raw Material Purchase', type: 'expense', amount: -15000, balance: 247000 },
    { id: 'L005', date: '2026-05-10', description: 'Electricity Bill', type: 'expense', amount: -3500, balance: 262000 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounting & Cash Flow</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            लेखा और नकदी प्रवाह - Complete financial overview
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
                <DialogDescription>आय जोड़ें - Record new income</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount / राशि</Label>
                  <Input type="number" placeholder="₹ 0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Source / स्रोत</Label>
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
                  <Input type="date" />
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
                <DialogDescription>व्यय जोड़ें - Record new expense</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount / राशि</Label>
                  <Input type="number" placeholder="₹ 0.00" />
                </div>
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
                  <Label>Date</Label>
                  <Input type="date" />
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
          titleHi="कुल आय"
          value={`₹${monthlyIncome.toLocaleString('en-IN')}`}
          change="+10.5% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Total Expenses"
          titleHi="कुल व्यय"
          value={`₹${monthlyExpenses.toLocaleString('en-IN')}`}
          change="+5.2% from last month"
          changeType="neutral"
          icon={TrendingDown}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatsCard
          title="Net Profit"
          titleHi="शुद्ध लाभ"
          value={`₹${netProfit.toLocaleString('en-IN')}`}
          change={`${profitMargin}% margin`}
          changeType="positive"
          icon={DollarSign}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Cash Balance"
          titleHi="नकद शेष"
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
            <CardDescription>लाभ/हानि प्रवृत्ति - 6 month comparison</CardDescription>
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
            <CardDescription>मासिक तुलना - Income vs Expenses</CardDescription>
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
          <TabsTrigger value="ledger">Ledger / खाता बही</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Ledger</CardTitle>
              <CardDescription>खाता बही - All transactions in chronological order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Entry ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.date}</TableCell>
                        <TableCell className="text-gray-500">{entry.id}</TableCell>
                        <TableCell>{entry.description}</TableCell>
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
                  ₹2,00,000
                </p>
                <p className="text-xs text-gray-500 mt-1">May 1, 2026</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  +₹1,05,000
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
                  ₹{cashBalance.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+₹45,000 net change</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
