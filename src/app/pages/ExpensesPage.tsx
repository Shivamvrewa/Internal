import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchExpenses, addExpenseDb, updateExpenseDb, deleteExpenseDb, Expense } from '../store/slices/expensesSlice';
import { v4 as uuidv4 } from 'uuid';
import { parseMetadata, appendMetadata, compressImage, formatDateTime, getCurrentLocalDateTimeString, getLocalDateTimeString } from '../services/utils';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
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
  Edit2,
  Trash2,
  Camera,
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
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [category, setCategory] = useState('rent');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [receiptUrl, setReceiptUrl] = useState('');
  const [editReceiptUrl, setEditReceiptUrl] = useState('');
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | undefined>('');

  // Camera Live Access States & Refs
  const [showCamera, setShowCamera] = useState(false);
  const [isEditShowCamera, setIsEditShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const editVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Stop camera when modals open/close
  useEffect(() => {
    if (!isAddExpenseOpen) {
      stopCamera();
    }
  }, [isAddExpenseOpen]);

  useEffect(() => {
    if (!isEditExpenseOpen) {
      stopCamera();
    }
  }, [isEditExpenseOpen]);

  const startCamera = async (isEdit = false) => {
    setCameraError(null);
    if (streamRef.current) {
      stopCamera();
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (isEdit) {
        setIsEditShowCamera(true);
        setTimeout(() => {
          if (editVideoRef.current) {
            editVideoRef.current.srcObject = stream;
          }
        }, 100);
      } else {
        setShowCamera(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload a file.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsEditShowCamera(false);
    setCameraError(null);
  };

  const capturePhoto = (isEdit = false) => {
    const video = isEdit ? editVideoRef.current : videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg');
      compressImage(base64).then(compressed => {
        if (isEdit) {
          setEditReceiptUrl(compressed);
        } else {
          setReceiptUrl(compressed);
        }
        stopCamera();
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      compressImage(base64String).then(compressed => {
        if (isEdit) {
          setEditReceiptUrl(compressed);
        } else {
          setReceiptUrl(compressed);
        }
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExpenses());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openAdd') === 'true') {
      setIsAddExpenseOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawDesc = formData.get('description') as string;
    const signedDesc = appendMetadata(rawDesc, user?.name || 'System');
    
    const newExpense: Expense = {
      id: `EXP-${uuidv4().substring(0, 8).toUpperCase()}`,
      category: category as Expense['category'],
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      description: signedDesc,
      vendor: formData.get('vendor') as string,
      status: 'pending',
      paymentMethod: paymentMethod,
      receiptUrl: receiptUrl || undefined,
    };
    await dispatch(addExpenseDb(newExpense));
    setIsAddExpenseOpen(false);
    setReceiptUrl('');
  };

  const handleEditExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExpense) return;
    const formData = new FormData(e.currentTarget);
    const rawDesc = formData.get('description') as string;
    const signedDesc = appendMetadata(rawDesc, user?.name || 'System');

    const updatedExpense: Expense = {
      ...editingExpense,
      category: formData.get('category') as Expense['category'],
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      description: signedDesc,
      vendor: formData.get('vendor') as string,
      paymentMethod: formData.get('paymentMethod') as string,
      receiptUrl: editReceiptUrl || undefined,
    };
    await dispatch(updateExpenseDb(updatedExpense));
    setIsEditExpenseOpen(false);
    setEditingExpense(null);
    setEditReceiptUrl('');
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await dispatch(deleteExpenseDb(id));
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setEditReceiptUrl(expense.receiptUrl || '');
    setIsEditExpenseOpen(true);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

  const categoryColors: Record<string, string> = {
    salary: '#3b82f6',
    rent: '#10b981',
    'raw-material': '#f59e0b',
    marketing: '#8b5cf6',
    electricity: '#ef4444',
    packaging: '#ec4899',
    maintenance: '#14b8a6',
    miscellaneous: '#6b7280',
  };

  const categoryLabels: Record<string, string> = {
    salary: 'Salary',
    rent: 'Rent',
    'raw-material': 'Raw Material',
    marketing: 'Marketing',
    electricity: 'Electricity',
    packaging: 'Packaging',
    maintenance: 'Maintenance',
    miscellaneous: 'Other',
  };

  const dynamicExpenseByCategory = Object.keys(categoryLabels).map(catKey => {
    const totalAmount = expenses
      .filter(e => e.category === catKey)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: categoryLabels[catKey],
      value: totalAmount,
      color: categoryColors[catKey] || '#6b7280',
    };
  }).filter(item => item.value > 0);

  const chartsData = dynamicExpenseByCategory.length > 0 ? dynamicExpenseByCategory : expenseByCategory;

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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                    <Label>Date & Time</Label>
                    <Input name="date" type="datetime-local" defaultValue={getCurrentLocalDateTimeString()} required />
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
                    <input
                      type="file"
                      id="receipt-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, false)}
                    />

                    {/* Camera stream live view */}
                    {showCamera && (
                      <div className="relative border rounded-lg overflow-hidden bg-black aspect-video flex flex-col items-center justify-center shadow-md">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        {cameraError && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-center text-red-400 text-sm font-medium">
                            {cameraError}
                          </div>
                        )}
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                          <Button 
                            type="button" 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                            onClick={() => capturePhoto(false)}
                          >
                            <Camera className="h-4 w-4" />
                            Capture Photo
                          </Button>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm"
                            onClick={stopCamera}
                          >
                            Close Camera
                          </Button>
                        </div>
                      </div>
                    )}

                    {!showCamera && (
                      <>
                        {receiptUrl ? (
                          <div className="relative border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 flex flex-col items-center gap-2 group shadow-sm">
                            <img src={receiptUrl} alt="Receipt Preview" className="max-h-40 rounded object-contain" />
                            <div className="flex gap-2 w-full justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => startCamera(false)}
                              >
                                <Camera className="h-4 w-4" /> Retake
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => setReceiptUrl('')}
                              >
                                <Trash2 className="h-4 w-4" /> Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              onClick={() => startCamera(false)}
                              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all flex flex-col items-center justify-center gap-1"
                            >
                              <Camera className="h-6 w-6 text-gray-400" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Open Camera
                              </span>
                              <span className="text-[10px] text-gray-400">Take receipt photo</span>
                            </div>
                            <div
                              onClick={() => document.getElementById('receipt-upload')?.click()}
                              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all flex flex-col items-center justify-center gap-1"
                            >
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Upload File
                              </span>
                              <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
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
                  data={chartsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartsData.map((entry, index) => (
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
              <BarChart data={chartsData}>
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
                  {chartsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto mb-6">
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="history">Expense History</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
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
                  <TableHead>Author</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const Icon = categoryIcons[expense.category as keyof typeof categoryIcons] || Receipt;
                  const parsed = parseMetadata(expense.description);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                       <TableCell>{formatDateTime(expense.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="capitalize">{expense.category.replace('-', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {parsed.cleanText}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-semibold px-2.5 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30 rounded-full">
                          {parsed.createdBy}
                        </Badge>
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
                      <TableCell>
                        {expense.receiptUrl ? (
                          <div 
                            className="w-10 h-10 rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedReceiptUrl(expense.receiptUrl);
                              setIsReceiptViewOpen(true);
                            }}
                          >
                            <img src={expense.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(expense)}>
                              <Edit2 className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 dark:text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>Chronological expense records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => {
                  const Icon = categoryIcons[expense.category as keyof typeof categoryIcons] || Receipt;
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{parseMetadata(expense.description).cleanText}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold border-indigo-100 dark:border-indigo-900/30">
                              By {parseMetadata(expense.description).createdBy}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(expense.date)} • {expense.category.replace('-', ' ').toUpperCase()} • {expense.vendor || 'No Vendor'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-red-600 dark:text-red-400">
                          -₹{expense.amount.toLocaleString('en-IN')}
                        </p>
                        {getStatusBadge(expense.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update expense details</DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <form onSubmit={handleEditExpense}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select name="category" defaultValue={editingExpense.category}>
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
                  <Input name="amount" type="number" required placeholder="₹ 0.00" defaultValue={editingExpense.amount} />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input name="date" type="datetime-local" required defaultValue={getLocalDateTimeString(editingExpense.date)} />
                </div>
                <div className="space-y-2">
                  <Label>Vendor(Optional)</Label>
                  <Input name="vendor" placeholder="Vendor name" defaultValue={editingExpense.vendor} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" required placeholder="Expense details..." defaultValue={parseMetadata(editingExpense.description).cleanText} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select name="paymentMethod" defaultValue={editingExpense.paymentMethod || 'cash'}>
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
                        <div className="space-y-2 pt-2">
                  <Label>Receipt (Optional)</Label>
                  <input
                    type="file"
                    id="edit-receipt-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, true)}
                  />

                  {/* Camera stream live view for edit */}
                  {isEditShowCamera && (
                    <div className="relative border rounded-lg overflow-hidden bg-black aspect-video flex flex-col items-center justify-center shadow-md">
                      <video 
                        ref={editVideoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                      {cameraError && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-center text-red-400 text-sm font-medium">
                          {cameraError}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                        <Button 
                          type="button" 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                          onClick={() => capturePhoto(true)}
                        >
                          <Camera className="h-4 w-4" />
                          Capture Photo
                        </Button>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          onClick={stopCamera}
                        >
                          Close Camera
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isEditShowCamera && (
                    <>
                      {editReceiptUrl ? (
                        <div className="relative border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 flex flex-col items-center gap-2 group shadow-sm">
                          <img src={editReceiptUrl} alt="Receipt Preview" className="max-h-40 rounded object-contain" />
                          <div className="flex gap-2 w-full justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => startCamera(true)}
                            >
                              <Camera className="h-4 w-4" /> Replace
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => setEditReceiptUrl('')}
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            onClick={() => startCamera(true)}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <Camera className="h-6 w-6 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-755 dark:text-gray-300">
                              Open Camera
                            </span>
                            <span className="text-[10px] text-gray-400">Take new photo</span>
                          </div>
                          <div
                            onClick={() => document.getElementById('edit-receipt-upload')?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-755 dark:text-gray-300">
                              Upload File
                            </span>
                            <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>          </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditExpenseOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog open={isReceiptViewOpen} onOpenChange={setIsReceiptViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Expense Receipt</DialogTitle>
            <DialogDescription>Viewing receipt image</DialogDescription>
          </DialogHeader>
          {selectedReceiptUrl && (
            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <img 
                src={selectedReceiptUrl} 
                alt="Receipt Full View" 
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setIsReceiptViewOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
