import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchCustomers } from '../store/slices/customersSlice';
import { fetchPayments } from '../store/slices/paymentsSlice';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../components/ui/utils';
import { formatDateTime } from '../services/utils';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Filter,
  RefreshCw,
  Info,
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

const demoCustomers = [
  {
    id: 'CUST001',
    name: 'Raj Kumar',
    mobile: '+91 98765 43210',
    address: 'Sector 15, Noida',
    joiningDate: '2026-01-15',
    plan: 'Fruit Bowl Month',
    paymentStatus: 'active' as const,
    daysRemaining: 20,
    pendingAmount: 0,
    lastPaymentDate: '2026-05-10',
    totalPaid: 15000,
    payments: []
  },
  {
    id: 'CUST002',
    name: 'Priya Sharma',
    mobile: '+91 98123 45678',
    address: 'Dwarka, Delhi',
    joiningDate: '2026-03-20',
    plan: 'Fruit + Drink week',
    paymentStatus: 'pending' as const,
    daysRemaining: 5,
    pendingAmount: 2500,
    lastPaymentDate: '2026-04-15',
    totalPaid: 7500,
    payments: []
  },
  {
    id: 'CUST003',
    name: 'Amit Patel',
    mobile: '+91 99876 54321',
    address: 'Koramangala, Bangalore',
    joiningDate: '2026-02-10',
    plan: 'fruit + Drink Month',
    paymentStatus: 'active' as const,
    daysRemaining: 180,
    pendingAmount: 0,
    lastPaymentDate: '2026-02-10',
    totalPaid: 30000,
    payments: []
  },
  {
    id: 'CUST004',
    name: 'Sunita Devi',
    mobile: '+91 97654 32109',
    address: 'Varanasi, UP',
    joiningDate: '2026-01-05',
    plan: 'Fruit Bowl week',
    paymentStatus: 'overdue' as const,
    daysRemaining: -10,
    pendingAmount: 3500,
    lastPaymentDate: '2026-03-01',
    totalPaid: 4500,
    payments: []
  },
  {
    id: 'CUST005',
    name: 'Vikram Singh',
    mobile: '+91 96543 21098',
    address: 'Jaipur, Rajasthan',
    joiningDate: '2026-02-15',
    plan: 'Fruit Bowl Month',
    paymentStatus: 'active' as const,
    daysRemaining: 12,
    pendingAmount: 0,
    lastPaymentDate: '2026-05-12',
    totalPaid: 33000,
    payments: []
  },
];

const demoPayments = [
  { id: 'PAY001', customerId: 'CUST001', customerName: 'Raj Kumar', amount: 3000, date: '2026-05-10', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY002', customerId: 'CUST001', customerName: 'Raj Kumar', amount: 3000, date: '2026-04-10', method: 'cash' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY003', customerId: 'CUST001', customerName: 'Raj Kumar', amount: 3000, date: '2026-03-10', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY004', customerId: 'CUST001', customerName: 'Raj Kumar', amount: 3000, date: '2026-02-10', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY005', customerId: 'CUST001', customerName: 'Raj Kumar', amount: 3000, date: '2026-01-10', method: 'cash' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY006', customerId: 'CUST002', customerName: 'Priya Sharma', amount: 2500, date: '2026-04-15', method: 'bank' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY007', customerId: 'CUST002', customerName: 'Priya Sharma', amount: 2500, date: '2026-03-15', method: 'bank' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY008', customerId: 'CUST002', customerName: 'Priya Sharma', amount: 2500, date: '2026-02-15', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY009', customerId: 'CUST003', customerName: 'Amit Patel', amount: 30000, date: '2026-02-10', method: 'card' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY010', customerId: 'CUST004', customerName: 'Sunita Devi', amount: 1500, date: '2026-03-01', method: 'cash' as const, status: 'completed' as const, type: 'partial' as const },
  { id: 'PAY011', customerId: 'CUST004', customerName: 'Sunita Devi', amount: 1500, date: '2026-02-01', method: 'cash' as const, status: 'completed' as const, type: 'partial' as const },
  { id: 'PAY012', customerId: 'CUST004', customerName: 'Sunita Devi', amount: 1500, date: '2026-01-01', method: 'cash' as const, status: 'completed' as const, type: 'partial' as const },
  { id: 'PAY013', customerId: 'CUST005', customerName: 'Vikram Singh', amount: 3000, date: '2026-05-12', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY014', customerId: 'CUST005', customerName: 'Vikram Singh', amount: 3000, date: '2026-04-12', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY015', customerId: 'CUST005', customerName: 'Vikram Singh', amount: 3000, date: '2026-03-12', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
  { id: 'PAY016', customerId: 'CUST005', customerName: 'Vikram Singh', amount: 3000, date: '2026-02-12', method: 'upi' as const, status: 'completed' as const, type: 'full' as const },
];

const demoExpenses = [
  { id: 'EXP-001', category: 'salary', amount: 45000, date: '2026-05-01', description: 'Staff Salaries', vendor: 'Internal Staff', status: 'completed' as const, paymentMethod: 'bank' },
  { id: 'EXP-002', category: 'rent', amount: 25000, date: '2026-05-01', description: 'Store Monthly Rent', vendor: 'Vasant Realtors', status: 'completed' as const, paymentMethod: 'bank' },
  { id: 'EXP-003', category: 'raw-material', amount: 12500, date: '2026-05-05', description: 'Organic Vegetables & Grains', vendor: 'Fresh Farms Ltd', status: 'completed' as const, paymentMethod: 'upi' },
  { id: 'EXP-004', category: 'electricity', amount: 3800, date: '2026-05-10', description: 'BSES Electricity Bill', vendor: 'BSES Rajdhani', status: 'completed' as const, paymentMethod: 'bank' },
  { id: 'EXP-005', category: 'marketing', amount: 5000, date: '2026-05-12', description: 'Instagram Ads Campaign', vendor: 'Meta Platforms', status: 'completed' as const, paymentMethod: 'card' },
  { id: 'EXP-006', category: 'packaging', amount: 4200, date: '2026-05-15', description: 'Biodegradable Salad Bowls', vendor: 'EcoPack India', status: 'completed' as const, paymentMethod: 'upi' },
  { id: 'EXP-007', category: 'maintenance', amount: 1500, date: '2026-05-18', description: 'Water Purifier Service', vendor: 'Kent Service', status: 'completed' as const, paymentMethod: 'cash' },

  { id: 'EXP-008', category: 'salary', amount: 45000, date: '2026-04-01', description: 'Staff Salaries', vendor: 'Internal Staff', status: 'completed' as const, paymentMethod: 'bank' },
  { id: 'EXP-009', category: 'rent', amount: 25000, date: '2026-04-01', description: 'Store Monthly Rent', vendor: 'Vasant Realtors', status: 'completed' as const, paymentMethod: 'bank' },
  { id: 'EXP-010', category: 'raw-material', amount: 11000, date: '2026-04-05', description: 'Grains & Salad Ingredients', vendor: 'Fresh Farms Ltd', status: 'completed' as const, paymentMethod: 'upi' },
  { id: 'EXP-011', category: 'electricity', amount: 3200, date: '2026-04-10', description: 'BSES Electricity Bill', vendor: 'BSES Rajdhani', status: 'completed' as const, paymentMethod: 'bank' },

  { id: 'EXP-012', category: 'salary', amount: 45000, date: '2026-03-01', description: 'Staff Salaries', vendor: 'Internal Staff', status: 'completed' as const, paymentMethod: 'bank' },
  { id: 'EXP-013', category: 'rent', amount: 25000, date: '2026-03-01', description: 'Store Monthly Rent', vendor: 'Vasant Realtors', status: 'completed' as const, paymentMethod: 'bank' },
  { id: 'EXP-014', category: 'raw-material', amount: 14000, date: '2026-03-05', description: 'Ingredients Batch 12', vendor: 'Fresh Farms Ltd', status: 'completed' as const, paymentMethod: 'upi' },
];

const categoryIcons = {
  rent: DollarSign,
  salary: Users,
  electricity: DollarSign,
  'raw-material': DollarSign,
  packaging: DollarSign,
  marketing: TrendingUp,
  maintenance: DollarSign,
  miscellaneous: DollarSign,
};

export function ReportsPage() {
  const dispatch = useDispatch<any>();
  const { customers, status: customersStatus } = useSelector((state: RootState) => state.customers);
  const { payments, status: paymentsStatus } = useSelector((state: RootState) => state.payments);
  const { expenses, status: expensesStatus } = useSelector((state: RootState) => state.expenses);

  useEffect(() => {
    if (customersStatus === 'idle') dispatch(fetchCustomers());
    if (paymentsStatus === 'idle') dispatch(fetchPayments());
    if (expensesStatus === 'idle') dispatch(fetchExpenses());
  }, [customersStatus, paymentsStatus, expensesStatus, dispatch]);

  // If live data has 0 customers/payments, we auto-enable Demo Mode so the page is populated
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    if (customersStatus === 'succeeded' && paymentsStatus === 'succeeded') {
      if (customers.length > 0 || payments.length > 0) {
        setIsDemoMode(false);
      }
    }
  }, [customersStatus, paymentsStatus, customers, payments]);

  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('all');
  
  // Calculate dynamic default start/end dates for May 2026
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  
  const [activeTab, setActiveTab] = useState('summary');

  // Synchronize Report Type dropdown with active Tabs value
  useEffect(() => {
    if (reportType === 'all' || reportType === 'profit') setActiveTab('summary');
    else if (reportType === 'revenue') setActiveTab('revenue');
    else if (reportType === 'expenses') setActiveTab('expenses');
    else if (reportType === 'customers') setActiveTab('customers');
    else if (reportType === 'payments') setActiveTab('payments');
  }, [reportType]);

  // Synchronize Period selector to automatically calculate dates
  useEffect(() => {
    const today = new Date('2026-05-23'); // Lock reference to user's 2026 state
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    
    let start = '';
    let end = '';

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    switch (reportPeriod) {
      case 'daily':
        start = formatDate(today);
        end = formatDate(today);
        break;
      case 'weekly':
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        start = formatDate(lastWeek);
        end = formatDate(today);
        break;
      case 'monthly':
        start = `${currentYear}-${currentMonth}-01`;
        const lastDay = new Date(currentYear, today.getMonth() + 1, 0).getDate();
        end = `${currentYear}-${currentMonth}-${String(lastDay).padStart(2, '0')}`;
        break;
      case 'quarterly':
        const currentQuarterMonth = Math.floor(today.getMonth() / 3) * 3;
        start = formatDate(new Date(currentYear, currentQuarterMonth, 1));
        end = formatDate(today);
        break;
      case 'yearly':
        start = `${currentYear}-01-01`;
        end = `${currentYear}-12-31`;
        break;
      case 'custom':
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
  }, [reportPeriod]);

  // Choose between Live Database and Demo Data Showcase
  const baseCustomers = isDemoMode ? demoCustomers : customers;
  const basePayments = isDemoMode ? demoPayments : payments;
  const baseExpenses = isDemoMode ? demoExpenses : expenses;

  // Filter datasets based on active Start Date and End Date
  const filteredCustomers = useMemo(() => {
    return baseCustomers.filter(c => {
      if (!c.joiningDate) return true;
      return c.joiningDate >= startDate && c.joiningDate <= endDate;
    });
  }, [baseCustomers, startDate, endDate]);

  const filteredPayments = useMemo(() => {
    return basePayments.filter(p => {
      if (!p.date) return true;
      return p.date >= startDate && p.date <= endDate;
    });
  }, [basePayments, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return baseExpenses.filter(e => {
      if (!e.date) return true;
      return e.date >= startDate && e.date <= endDate;
    });
  }, [baseExpenses, startDate, endDate]);

  // Generate monthlyRevenueData based on actual filtered payments and expenses
  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap: Record<string, { month: string, revenue: number, expenses: number, profit: number }> = {};
    
    // Determine which months should be displayed on chart based on filtered items
    const uniqueMonths = new Set<number>();
    filteredPayments.forEach(p => uniqueMonths.add(new Date(p.date).getMonth()));
    filteredExpenses.forEach(e => uniqueMonths.add(new Date(e.date).getMonth()));

    if (uniqueMonths.size === 0) {
      // Fallback past 5 months if empty
      const currentMonth = new Date('2026-05-23').getMonth();
      for (let i = Math.max(0, currentMonth - 4); i <= currentMonth; i++) {
        uniqueMonths.add(i);
      }
    }

    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => a - b);
    sortedMonths.forEach(m => {
      dataMap[months[m]] = { month: months[m], revenue: 0, expenses: 0, profit: 0 };
    });

    filteredPayments.forEach(p => {
      const date = new Date(p.date);
      const monthStr = months[date.getMonth()];
      if (dataMap[monthStr]) {
        dataMap[monthStr].revenue += p.amount;
        dataMap[monthStr].profit = dataMap[monthStr].revenue - dataMap[monthStr].expenses;
      }
    });

    filteredExpenses.forEach(e => {
      const date = new Date(e.date);
      const monthStr = months[date.getMonth()];
      if (dataMap[monthStr]) {
        dataMap[monthStr].expenses += e.amount;
        dataMap[monthStr].profit = dataMap[monthStr].revenue - dataMap[monthStr].expenses;
      }
    });

    return Object.values(dataMap);
  }, [filteredPayments, filteredExpenses]);

  // Generate categoryExpenses breakdown
  const categoryExpenses = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    const formatCategoryName = (cat: string) => {
      return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    filteredExpenses.forEach(e => {
      const cat = e.category ? formatCategoryName(e.category) : 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
    });
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];
    return Object.entries(categoryTotals).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [filteredExpenses]);

  // Calculate filtered report metrics
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const pendingPayments = filteredCustomers.filter(c => c.pendingAmount > 0).length;
  const totalPendingAmount = filteredCustomers.reduce((sum, c) => sum + c.pendingAmount, 0);

  // Download real dynamic CSV Excel file based on currently active tab data
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = `healthybowl_${activeTab}_report_${startDate}_to_${endDate}.csv`;

    if (activeTab === 'summary') {
      headers = ['Metric Summary', 'Amount (INR)'];
      rows = [
        ['Total Revenue', `₹${totalRevenue}`],
        ['Total Expenses', `₹${totalExpenses}`],
        ['Net Profit Margin', `₹${totalProfit}`],
        ['Outstanding Customer Dues', `₹${totalPendingAmount}`],
        ['Pending Dues Invoices count', pendingPayments.toString()]
      ];
    } else if (activeTab === 'revenue') {
      headers = ['Month Period', 'Gross Revenue Collected (INR)'];
      rows = monthlyRevenueData.map(item => [item.month, `₹${item.revenue}`]);
    } else if (activeTab === 'expenses') {
      headers = ['Expense ID', 'Date', 'Category', 'Description', 'Amount (INR)', 'Vendor', 'Status'];
      rows = filteredExpenses.map(e => [
        e.id,
        e.date,
        e.category,
        e.description || '',
        `₹${e.amount}`,
        e.vendor || 'N/A',
        e.status
      ]);
    } else if (activeTab === 'customers') {
      headers = ['Customer Name', 'Mobile', 'Address', 'Joining Date', 'Plan Type', 'Payment Status', 'Pending Dues (INR)'];
      rows = filteredCustomers.map(c => [
        c.name,
        c.mobile,
        c.address || '',
        c.joiningDate,
        c.plan,
        c.paymentStatus,
        `₹${c.pendingAmount}`
      ]);
    } else if (activeTab === 'payments') {
      headers = ['Payment ID', 'Transaction Date', 'Customer Name', 'Method', 'Amount (INR)', 'Payment Status', 'Type'];
      rows = filteredPayments.map(p => [
        p.id,
        p.date,
        p.customerName,
        p.method,
        `₹${p.amount}`,
        p.status,
        p.type
      ]);
    }

    if (rows.length === 0) {
      toast.error('No data available in selected date range to export.');
      return;
    }

    // Include UTF-8 BOM so MS Excel displays Rupee symbol correctly
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${activeTab} report as Excel (CSV) successfully!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    toast.success(`Filtered report generated successfully from ${startDate} to ${endDate}!`);
  };

  return (
    <div className="space-y-6">
      {/* Stylesheet injection for print styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide standard dashboard wrappers */
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and export business reports</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Demo Mode Badge and Toggle Switch */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Demo Showcase</span>
            <button
              onClick={() => {
                setIsDemoMode(!isDemoMode);
                toast.info(isDemoMode ? "Switched to Live database mode" : "Switched to Demo Showcase mode");
              }}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isDemoMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  isDemoMode ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Demo Mode Info Banner */}
      {isDemoMode && (
        <div className="flex gap-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-900/20 text-blue-800 dark:text-blue-300">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Demo Showcase Active</p>
            <p className="mt-0.5 opacity-90">The live database contains zero customer or payment records. Realistic simulated restaurant logs are loaded so you can view fully populated tables, print invoices, and explore charts instantly. Switch the toggle above to check live database reports.</p>
          </div>
        </div>
      )}

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
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
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setReportPeriod('custom');
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setReportPeriod('custom');
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="invisible">Action</Label>
              <Button onClick={handleGenerateReport} className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 border-0">
                <RefreshCw className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
          <TabsTrigger value="summary" className="py-2.5 rounded-lg text-sm font-medium">Summary</TabsTrigger>
          <TabsTrigger value="revenue" className="py-2.5 rounded-lg text-sm font-medium">Revenue</TabsTrigger>
          <TabsTrigger value="expenses" className="py-2.5 rounded-lg text-sm font-medium">Expenses</TabsTrigger>
          <TabsTrigger value="customers" className="py-2.5 rounded-lg text-sm font-medium">Customers</TabsTrigger>
          <TabsTrigger value="payments" className="py-2.5 rounded-lg text-sm font-medium">Payments</TabsTrigger>
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
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalRevenue.toLocaleString()}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">For selected date range</p>
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
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalExpenses.toLocaleString()}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">For selected date range</p>
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
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalProfit.toLocaleString()}</div>
                </div>
                <p className={cn("text-xs mt-1 font-semibold", totalProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                  {totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
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
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalPendingAmount.toLocaleString()}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pendingPayments} customers unpaid</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Revenue vs Expenses Trend</CardTitle>
                <CardDescription>Monthly comparison breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyRevenueData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No timeline data to graph in the selected date range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid stroke-border',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                      <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Expense Breakdown</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryExpenses.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expense data to graph in the selected date range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryExpenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
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
                          border: '1px solid stroke-border',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Monthly Revenue Report</CardTitle>
              <CardDescription>Detailed revenue analysis for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyRevenueData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No revenue data in selected date range.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid stroke-border',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 rounded-lg border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                          <th className="text-left p-3 font-medium text-gray-500">Period</th>
                          <th className="text-right p-3 font-medium text-gray-500">Revenue</th>
                          <th className="text-right p-3 font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyRevenueData.map((item, index) => (
                          <tr key={item.month} className="border-b hover:bg-gray-50/20 dark:hover:bg-gray-800/20">
                            <td className="p-3 font-medium text-gray-900 dark:text-white">{item.month} 2026</td>
                            <td className="text-right p-3 font-medium text-gray-900 dark:text-white">₹{item.revenue.toLocaleString()}</td>
                            <td className="text-right p-3">
                              {index > 0 && monthlyRevenueData[index - 1].revenue > 0 ? (
                                <Badge
                                  variant={
                                    item.revenue > monthlyRevenueData[index - 1].revenue
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {item.revenue > monthlyRevenueData[index - 1].revenue ? '+' : ''}
                                  {(
                                    ((item.revenue - monthlyRevenueData[index - 1].revenue) /
                                      monthlyRevenueData[index - 1].revenue) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Baseline</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Report */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Expense Analysis</CardTitle>
              <CardDescription>Detailed breakdown of all expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expense records in this date range.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryExpenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                        outerRadius={90}
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
                          border: '1px solid stroke-border',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {categoryExpenses.map((category) => (
                      <div key={category.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3.5 h-3.5 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">₹{category.value.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {totalExpenses > 0 ? `${((category.value / totalExpenses) * 100).toFixed(1)}%` : '0%'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Report */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Customer Statistics</CardTitle>
              <CardDescription>Overview of customer data and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Total Customers</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredCustomers.length}</div>
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Active Customers</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredCustomers.filter(c => c.paymentStatus === 'active').length}
                  </div>
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Dues</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingPayments}</div>
                </div>
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                      <th className="text-left p-3 font-medium text-gray-500">Customer</th>
                      <th className="text-left p-3 font-medium text-gray-500">Status</th>
                      <th className="text-right p-3 font-medium text-gray-500">Pending Dues</th>
                      <th className="text-left p-3 font-medium text-gray-500">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center p-8 text-muted-foreground">
                          No customer records found in the selected date range.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.slice(0, 10).map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50/20 dark:hover:bg-gray-800/20">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                              <div className="text-xs text-muted-foreground">{customer.mobile}</div>
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
                          <td className="text-right p-3 font-semibold text-gray-900 dark:text-white">
                            ₹{customer.pendingAmount.toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{formatDateTime(customer.lastPaymentDate) || 'N/A'}</td>
                        </tr>
                      ))
                    )}
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
              <CardTitle className="text-gray-900 dark:text-white">Payment Report</CardTitle>
              <CardDescription>Complete payment transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Total Collected</div>
                  <div className="text-xl font-bold text-green-600">
                    ₹{filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Total Pending</div>
                  <div className="text-xl font-bold text-orange-600">
                    ₹{totalPendingAmount.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Transactions count</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{filteredPayments.length}</div>
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Avg. Transaction</div>
                  <div className="text-xl font-bold text-blue-600">
                    ₹{(filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length || 0).toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                      <th className="text-left p-3 font-medium text-gray-500">Date</th>
                      <th className="text-left p-3 font-medium text-gray-500">Customer</th>
                      <th className="text-left p-3 font-medium text-gray-500">Method</th>
                      <th className="text-right p-3 font-medium text-gray-500">Amount</th>
                      <th className="text-left p-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          No payment transactions found in this date range.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.slice(0, 15).map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50/20 dark:hover:bg-gray-800/20">
                          <td className="p-3 text-gray-600 dark:text-gray-400">{formatDateTime(payment.date)}</td>
                          <td className="p-3 font-medium text-gray-900 dark:text-white">{payment.customerName}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="uppercase">{payment.method}</Badge>
                          </td>
                          <td className="text-right p-3 font-bold text-gray-900 dark:text-white">₹{payment.amount.toLocaleString()}</td>
                          <td className="p-3">
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden Printable Invoice-Style Document Template */}
      <div id="print-area" className="hidden p-8 bg-white text-black space-y-6">
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">The Healthy Bowl</h1>
            <p className="text-gray-500 text-sm mt-1">Premium Health Bowls & Analytics</p>
          </div>
          <div className="text-right text-xs text-gray-400 font-mono">
            <p>Generated: {new Date().toLocaleString()}</p>
            <p>Period: {reportPeriod.toUpperCase()} ({startDate} to {endDate})</p>
            <p>Data Source: {isDemoMode ? "DEMO DATA" : "LIVE RECORDS"}</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 border rounded-xl p-4 bg-gray-50/50">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Revenue</p>
            <p className="text-lg font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Expenses</p>
            <p className="text-lg font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Net Profit</p>
            <p className="text-lg font-bold text-blue-600">₹{totalProfit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Dues</p>
            <p className="text-lg font-bold text-orange-600">₹{totalPendingAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Detailed Active Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold capitalize border-b pb-2 tracking-wide text-gray-800">{activeTab} Details</h2>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 text-gray-500">
                {activeTab === 'summary' && <>
                  <th className="py-2 font-semibold">Financial Metric</th>
                  <th className="text-right py-2 font-semibold">Value (INR)</th>
                </>}
                {activeTab === 'revenue' && <>
                  <th className="py-2 font-semibold">Month / Period</th>
                  <th className="text-right py-2 font-semibold">Gross Revenue</th>
                </>}
                {activeTab === 'expenses' && <>
                  <th className="py-2 font-semibold">ID</th>
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Category</th>
                  <th className="py-2 font-semibold">Description</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                  <th className="py-2 font-semibold">Vendor</th>
                </>}
                {activeTab === 'customers' && <>
                  <th className="py-2 font-semibold">Customer</th>
                  <th className="py-2 font-semibold">Mobile</th>
                  <th className="py-2 font-semibold">Plan</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="text-right py-2 font-semibold">Outstanding Dues</th>
                </>}
                {activeTab === 'payments' && <>
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Customer Name</th>
                  <th className="py-2 font-semibold">Payment Method</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                  <th className="py-2 font-semibold">Status</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'summary' && <>
                <tr className="border-b"><td className="py-2.5">Total Revenue</td><td className="text-right py-2.5 font-bold text-green-600">₹{totalRevenue.toLocaleString()}</td></tr>
                <tr className="border-b"><td className="py-2.5">Total Expenses</td><td className="text-right py-2.5 font-bold text-red-600">₹{totalExpenses.toLocaleString()}</td></tr>
                <tr className="border-b"><td className="py-2.5">Net Profit Margin</td><td className="text-right py-2.5 font-bold text-blue-600">₹{totalProfit.toLocaleString()}</td></tr>
                <tr className="border-b"><td className="py-2.5">Outstanding Outstanding Dues</td><td className="text-right py-2.5 font-bold text-orange-600">₹{totalPendingAmount.toLocaleString()}</td></tr>
              </>}
              {activeTab === 'revenue' && monthlyRevenueData.map(item => (
                <tr key={item.month} className="border-b text-gray-800">
                  <td className="py-2.5">{item.month} 2026</td>
                  <td className="text-right py-2.5 font-semibold">₹{item.revenue.toLocaleString()}</td>
                </tr>
              ))}
              {activeTab === 'expenses' && filteredExpenses.map(e => (
                <tr key={e.id} className="border-b text-gray-700">
                  <td className="py-2.5 font-mono">{e.id}</td>
                  <td className="py-2.5">{formatDateTime(e.date)}</td>
                  <td className="py-2.5 capitalize">{e.category}</td>
                  <td className="py-2.5">{e.description}</td>
                  <td className="text-right py-2.5 font-semibold">₹{e.amount.toLocaleString()}</td>
                  <td className="py-2.5">{e.vendor}</td>
                </tr>
              ))}
              {activeTab === 'customers' && filteredCustomers.map(c => (
                <tr key={c.id} className="border-b text-gray-700">
                  <td className="py-2.5 font-semibold">{c.name}</td>
                  <td className="py-2.5 font-mono">{c.mobile}</td>
                  <td className="py-2.5">{c.plan}</td>
                  <td className="py-2.5 capitalize">{c.paymentStatus}</td>
                  <td className="text-right py-2.5 font-bold text-gray-800">₹{c.pendingAmount.toLocaleString()}</td>
                </tr>
              ))}
              {activeTab === 'payments' && filteredPayments.map(p => (
                <tr key={p.id} className="border-b text-gray-700">
                  <td className="py-2.5">{formatDateTime(p.date)}</td>
                  <td className="py-2.5 font-semibold">{p.customerName}</td>
                  <td className="py-2.5 uppercase font-mono">{p.method}</td>
                  <td className="text-right py-2.5 font-bold text-gray-800">₹{p.amount.toLocaleString()}</td>
                  <td className="py-2.5 capitalize">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
