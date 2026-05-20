import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { toast } from 'sonner';

const monthlyRevenueData = [
  { month: 'Jan', revenue: 85000, expenses: 45000, profit: 40000 },
  { month: 'Feb', revenue: 92000, expenses: 48000, profit: 44000 },
  { month: 'Mar', revenue: 88000, expenses: 47000, profit: 41000 },
  { month: 'Apr', revenue: 95000, expenses: 50000, profit: 45000 },
  { month: 'May', revenue: 105000, expenses: 52000, profit: 53000 },
  { month: 'Jun', revenue: 98000, expenses: 51000, profit: 47000 },
];

const categoryExpenses = [
  { name: 'Salary', value: 45000, color: '#3b82f6' },
  { name: 'Rent', value: 25000, color: '#10b981' },
  { name: 'Materials', value: 15000, color: '#f59e0b' },
  { name: 'Utilities', value: 8500, color: '#ef4444' },
  { name: 'Marketing', value: 8000, color: '#8b5cf6' },
  { name: 'Other', value: 6500, color: '#6b7280' },
];

export function ReportsPage() {
  const { customers } = useSelector((state: RootState) => state.customers);
  const { payments } = useSelector((state: RootState) => state.payments);
  const { expenses } = useSelector((state: RootState) => state.expenses);

  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('all');
  const [startDate, setStartDate] = useState('2024-05-01');
  const [endDate, setEndDate] = useState('2024-05-31');

  // Calculate report metrics
  const totalRevenue = monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = monthlyRevenueData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const pendingPayments = customers.filter(c => c.pendingAmount > 0).length;
  const totalPendingAmount = customers.reduce((sum, c) => sum + c.pendingAmount, 0);

  const handleExportPDF = () => {
    toast.success('Report exported as PDF successfully!');
  };

  const handleExportExcel = () => {
    toast.success('Report exported as Excel successfully!');
  };

  const handlePrint = () => {
    toast.success('Printing report...');
  };

  const handleGenerateReport = () => {
    toast.success('Report generated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and export business reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Select date range and report type to generate customized reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="expenses">Expense Report</SelectItem>
                  <SelectItem value="profit">Profit/Loss Report</SelectItem>
                  <SelectItem value="customers">Customer Report</SelectItem>
                  <SelectItem value="payments">Payment Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="invisible">Action</Label>
              <Button onClick={handleGenerateReport} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Summary Report */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  For selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  For selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div className="text-2xl font-bold">₹{totalProfit.toLocaleString()}</div>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +{((totalProfit / totalRevenue) * 100).toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <div className="text-2xl font-bold">₹{totalPendingAmount.toLocaleString()}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pendingPayments} customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses Trend</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Report</CardTitle>
              <CardDescription>Detailed revenue analysis for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Month</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRevenueData.map((item, index) => (
                      <tr key={item.month} className="border-b">
                        <td className="p-3">{item.month} 2024</td>
                        <td className="text-right p-3">₹{item.revenue.toLocaleString()}</td>
                        <td className="text-right p-3">
                          {index > 0 && (
                            <Badge
                              variant={
                                item.revenue > monthlyRevenueData[index - 1].revenue
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {(
                                ((item.revenue - monthlyRevenueData[index - 1].revenue) /
                                  monthlyRevenueData[index - 1].revenue) *
                                100
                              ).toFixed(1)}
                              %
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Report */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <CardDescription>Detailed breakdown of all expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {categoryExpenses.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{category.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {((category.value / totalExpenses) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Report */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Statistics</CardTitle>
              <CardDescription>Overview of customer data and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Total Customers</span>
                  </div>
                  <div className="text-2xl font-bold">{customers.length}</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Active Customers</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {customers.filter(c => c.paymentStatus === 'active').length}
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Pending Dues</span>
                  </div>
                  <div className="text-2xl font-bold">{pendingPayments}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-right p-3">Pending</th>
                      <th className="text-left p-3">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 10).map((customer) => (
                      <tr key={customer.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.mobile}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              customer.paymentStatus === 'active'
                                ? 'default'
                                : customer.paymentStatus === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {customer.paymentStatus}
                          </Badge>
                        </td>
                        <td className="text-right p-3">₹{customer.pendingAmount.toLocaleString()}</td>
                        <td className="p-3">{customer.lastPaymentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Report */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Report</CardTitle>
              <CardDescription>Complete payment transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Total Collected</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Total Pending</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{totalPendingAmount.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Transactions</div>
                  <div className="text-2xl font-bold">{payments.length}</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Avg. Transaction</div>
                  <div className="text-2xl font-bold">
                    ₹{(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length || 0).toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Method</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 15).map((payment) => (
                      <tr key={payment.id} className="border-b">
                        <td className="p-3">{payment.date}</td>
                        <td className="p-3">{payment.customerName}</td>
                        <td className="p-3">
                          <Badge variant="outline">{payment.method}</Badge>
                        </td>
                        <td className="text-right p-3 font-medium">₹{payment.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
