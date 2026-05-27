import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchPayments, addPaymentDb, updatePaymentDb, deletePaymentDb, Payment } from '../store/slices/paymentsSlice';
import { fetchCustomers } from '../store/slices/customersSlice';
import { v4 as uuidv4 } from 'uuid';
import { parseMetadata, appendMetadata, compressImage } from '../services/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  CreditCard,
  Plus,
  Download,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  Smartphone,
  Building,
  Edit,
  Trash2,
  Camera,
  Upload,
  Maximize2,
  UserPlus,
  X,
  Trash,
} from 'lucide-react';
import { StatsCard } from '../components/analytics/StatsCard';

const getCurrentLocalDateTimeString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getLocalDateTimeString = (dateStr: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.substring(0, 16);
  return `${dateStr}T12:00`;
};

const formatPaymentDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
};

export function PaymentsPage() {
  const dispatch = useDispatch<any>();
  const { payments, status: paymentsStatus } = useSelector((state: RootState) => state.payments);
  const { customers, status: customersStatus } = useSelector((state: RootState) => state.customers);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Modals and General States
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  // States for Add Payment
  const [isCustomCustomer, setIsCustomCustomer] = useState(false);
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [method, setMethod] = useState('cash');
  const [type, setType] = useState('full');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);

  // States for Edit Payment
  const [isEditCustomCustomer, setIsEditCustomCustomer] = useState(false);
  const [editCustomCustomerName, setEditCustomCustomerName] = useState('');
  const [editCustomerId, setEditCustomerId] = useState('');
  const [editMethod, setEditMethod] = useState<Payment['method']>('cash');
  const [editType, setEditType] = useState<Payment['type']>('full');
  const [editStatus, setEditStatus] = useState<Payment['status']>('completed');
  const [editReceiptUrl, setEditReceiptUrl] = useState<string | undefined>(undefined);

  // Lightbox Viewer State
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string>('');

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
    if (!isAddPaymentOpen) {
      stopCamera();
    }
  }, [isAddPaymentOpen]);

  useEffect(() => {
    if (!isEditPaymentOpen) {
      stopCamera();
    }
  }, [isEditPaymentOpen]);

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

  const handleEditClick = (payment: Payment) => {
    setPaymentToEdit(payment);
    const parsed = parseMetadata(payment.notes || '');
    setEditReceiptUrl(parsed.receiptUrl);

    const isCustom = payment.customerId.startsWith('CUST-TEMP-') || !customers.some(c => c.id === payment.customerId);
    setIsEditCustomCustomer(isCustom);
    if (isCustom) {
      setEditCustomCustomerName(payment.customerName);
      setEditCustomerId('');
    } else {
      setEditCustomerId(payment.customerId);
      setEditCustomCustomerName('');
    }

    setEditMethod(payment.method);
    setEditType(payment.type);
    setEditStatus(payment.status);
    setIsEditPaymentOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentToEdit) return;

    const formData = new FormData(e.currentTarget);
    
    let finalCustomerId = '';
    let finalCustomerName = '';

    if (isEditCustomCustomer) {
      if (!editCustomCustomerName.trim()) return;
      finalCustomerName = editCustomCustomerName.trim();
      finalCustomerId = paymentToEdit.customerId.startsWith('CUST-TEMP-') 
        ? paymentToEdit.customerId 
        : `CUST-TEMP-${uuidv4().substring(0, 8).toUpperCase()}`;
    } else {
      const customer = customers.find(c => c.id === editCustomerId);
      if (!customer) return;
      finalCustomerId = customer.id;
      finalCustomerName = customer.name;
    }

    const rawNotes = formData.get('notes') as string || '';
    const signedNotes = appendMetadata(rawNotes, user?.name || 'System', editReceiptUrl);

    const updatedPayment: Payment = {
      ...paymentToEdit,
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      method: editMethod,
      status: editStatus,
      type: editType,
      notes: signedNotes,
    };

    await dispatch(updatePaymentDb(updatedPayment));
    setIsEditPaymentOpen(false);
    setPaymentToEdit(null);
    setEditReceiptUrl(undefined);
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      await dispatch(deletePaymentDb(id));
    }
  };

  useEffect(() => {
    if (paymentsStatus === 'idle') {
      dispatch(fetchPayments());
    }
    if (customersStatus === 'idle') {
      dispatch(fetchCustomers());
    }
  }, [paymentsStatus, customersStatus, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openAdd') === 'true') {
      setIsAddPaymentOpen(true);
      const preselectedCustomerId = params.get('customerId');
      if (preselectedCustomerId) {
        setCustomerId(preselectedCustomerId);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let finalCustomerId = '';
    let finalCustomerName = '';

    if (isCustomCustomer) {
      if (!customCustomerName.trim()) return;
      finalCustomerName = customCustomerName.trim();
      finalCustomerId = `CUST-TEMP-${uuidv4().substring(0, 8).toUpperCase()}`;
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;
      finalCustomerId = customer.id;
      finalCustomerName = customer.name;
    }

    const rawNotes = formData.get('notes') as string || '';
    const signedNotes = appendMetadata(rawNotes, user?.name || 'System', receiptUrl);

    const newPayment: Payment = {
      id: `PAY-${uuidv4().substring(0, 8).toUpperCase()}`,
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      method: method as Payment['method'],
      status: 'completed',
      type: type as Payment['type'],
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      notes: signedNotes,
    };

    await dispatch(addPaymentDb(newPayment));
    setIsAddPaymentOpen(false);
    // Reset states
    setIsCustomCustomer(false);
    setCustomCustomerName('');
    setCustomerId('');
    setReceiptUrl(undefined);
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalPending = customers.reduce((sum, c) => sum + c.pendingAmount, 0);

  const filteredPayments = payments.filter(payment =>
    payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Failed' },
    }[status] || { variant: 'default' as const, icon: CheckCircle, label: 'Completed' };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      cash: Wallet,
      upi: Smartphone,
      bank: Building,
      card: CreditCard,
    };
    return icons[method as keyof typeof icons] || CreditCard;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track all payments and dues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>Add payment details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment}>
                <div className="space-y-4 py-4">
                  {/* Custom / Unregistered Customer Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-150 dark:border-gray-800">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <UserPlus className="h-4 w-4 text-blue-500" />
                        Unregistered Customer
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Toggle to record payment for a customer not in the database
                      </p>
                    </div>
                    <Switch
                      checked={isCustomCustomer}
                      onCheckedChange={(checked) => {
                        setIsCustomCustomer(checked);
                        if (checked) {
                          setCustomerId('');
                        }
                      }}
                    />
                  </div>

                  {!isCustomCustomer ? (
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="customCustomerName">Customer Name</Label>
                      <Input
                        id="customCustomerName"
                        name="customCustomerName"
                        required
                        value={customCustomerName}
                        onChange={(e) => setCustomCustomerName(e.target.value)}
                        placeholder="Enter custom customer name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" required placeholder="₹ 0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={method} onValueChange={setMethod}>
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
                    <Label htmlFor="type">Payment Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Payment</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                        <SelectItem value="emi">EMI/Installment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input id="date" name="date" type="datetime-local" defaultValue={getCurrentLocalDateTimeString()} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input id="notes" name="notes" placeholder="e.g. Paid via UPI QR code..." />
                  </div>

                  {/* Receipt Upload / Camera direct capture */}
                  <div className="space-y-2 pt-2">
                    <Label className="font-semibold text-gray-700 dark:text-gray-300">Receipt / Proof of Payment (Optional)</Label>
                    
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
                                onClick={() => setReceiptUrl(undefined)}
                              >
                                <Trash className="h-4 w-4" /> Remove
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
                              <span className="text-xs font-semibold text-gray-755 dark:text-gray-300">
                                Open Camera
                              </span>
                              <span className="text-[10px] text-gray-400">Take receipt photo</span>
                            </div>
                            <div
                              onClick={() => document.getElementById('receipt-upload')?.click()}
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
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!isCustomCustomer ? !customerId : !customCustomerName.trim()}
                  >
                    Record Payment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Collected"
          titleHi=" "
          value={`₹${totalPayments.toLocaleString('en-IN')}`}
          change="+15% this month"
          changeType="positive"
          icon={CreditCard}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Completed"
          titleHi=" "
          value={completedPayments}
          change={`${payments.length} total payments`}
          changeType="neutral"
          icon={CheckCircle}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Pending Dues"
          titleHi=" "
          value={`₹${totalPending.toLocaleString('en-IN')}`}
          change={`${customers.filter(c => c.pendingAmount > 0).length} customers`}
          changeType="negative"
          icon={Clock}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          title="This Month"
          titleHi=" "
          value={`₹${totalPayments.toLocaleString('en-IN')}`}
          change="+12% from last month"
          changeType="positive"
          icon={Calendar}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending Dues</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>All Payments</CardTitle>
                  <CardDescription>Complete payment records</CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const Icon = getPaymentMethodIcon(payment.method);
                      const parsed = parseMetadata(payment.notes || '');
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {parsed.receiptUrl ? (
                                <div 
                                  className="w-10 h-10 rounded border border-gray-250 dark:border-gray-800 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center group relative shadow-sm"
                                  onClick={() => {
                                    setSelectedReceiptUrl(parsed.receiptUrl!);
                                    setIsReceiptViewOpen(true);
                                  }}
                                >
                                  <img src={parsed.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="h-3.5 w-3.5 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded border border-dashed border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/30">
                                  <CreditCard className="h-4 w-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                  {payment.customerName}
                                  {payment.customerId.startsWith('CUST-TEMP-') && (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50/50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 rounded-full font-semibold">
                                      Custom
                                    </Badge>
                                  )}
                                </p>
                                {parsed.cleanText && <p className="text-[10px] text-gray-400 font-medium">{parsed.cleanText}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-semibold px-2.5 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30 rounded-full">
                              {parsed.createdBy}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              ₹{payment.amount.toLocaleString('en-IN')}
                            </span>
                          </TableCell>
                           <TableCell>{formatPaymentDate(payment.date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gray-500" />
                              <span className="capitalize">{payment.method}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            {payment.invoiceNumber && (
                              <Button variant="ghost" size="sm">
                                {payment.invoiceNumber}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(payment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePayment(payment.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

        <TabsContent value="pending" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Dues</CardTitle>
              <CardDescription>Customers with outstanding payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Due Amount</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers
                      .filter(c => c.pendingAmount > 0)
                      .map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.id}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.mobile}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.plan}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              ₹{customer.pendingAmount.toLocaleString('en-IN')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {customer.daysRemaining < 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-semibold">
                                {Math.abs(customer.daysRemaining)} days
                              </span>
                            ) : (
                              <span className="text-orange-600 dark:text-orange-400">
                                Due in {customer.daysRemaining} days
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button size="sm">Collect Payment</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Chronological payment records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.slice(0, 10).map((payment) => {
                  const Icon = getPaymentMethodIcon(payment.method);
                  const parsed = parseMetadata(payment.notes || '');
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {parsed.receiptUrl ? (
                          <div 
                            className="w-12 h-12 rounded-full border border-gray-250 dark:border-gray-800 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity shrink-0 bg-gray-100 dark:bg-gray-800 relative group flex items-center justify-center shadow-sm"
                            onClick={() => {
                              setSelectedReceiptUrl(parsed.receiptUrl!);
                              setIsReceiptViewOpen(true);
                            }}
                          >
                            <img src={parsed.receiptUrl} alt="Receipt" className="w-full h-full object-cover rounded-full" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                              <Maximize2 className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                              {payment.customerName}
                              {payment.customerId.startsWith('CUST-TEMP-') && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50/50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 rounded-full font-semibold">
                                  Custom
                                </Badge>
                              )}
                            </p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold border-indigo-100 dark:border-indigo-900/30">
                              By {parsed.createdBy}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {formatPaymentDate(payment.date)} • {payment.method.toUpperCase()} {parsed.cleanText && `• ${parsed.cleanText}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">
                          +₹{payment.amount.toLocaleString('en-IN')}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment Record</DialogTitle>
            <DialogDescription>Update payment details</DialogDescription>
          </DialogHeader>
          {paymentToEdit && (
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4 py-4">
                {/* Custom / Unregistered Customer Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-150 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                      Unregistered Customer
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Toggle to record payment for a customer not in the database
                    </p>
                  </div>
                  <Switch
                    checked={isEditCustomCustomer}
                    onCheckedChange={(checked) => {
                      setIsEditCustomCustomer(checked);
                      if (checked) {
                        setEditCustomerId('');
                      }
                    }}
                  />
                </div>

                {!isEditCustomCustomer ? (
                  <div className="space-y-2">
                    <Label htmlFor="edit-customer">Customer</Label>
                    <Select value={editCustomerId} onValueChange={setEditCustomerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="editCustomCustomerName">Customer Name</Label>
                    <Input
                      id="editCustomCustomerName"
                      name="editCustomCustomerName"
                      required
                      value={editCustomCustomerName}
                      onChange={(e) => setEditCustomCustomerName(e.target.value)}
                      placeholder="Enter custom customer name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input id="edit-amount" name="amount" type="number" defaultValue={paymentToEdit.amount} required placeholder="₹ 0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-method">Payment Method</Label>
                  <Select value={editMethod} onValueChange={(val) => setEditMethod(val as Payment['method'])}>
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
                  <Label htmlFor="edit-type">Payment Type</Label>
                  <Select value={editType} onValueChange={(val) => setEditType(val as Payment['type'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Payment</SelectItem>
                      <SelectItem value="partial">Partial Payment</SelectItem>
                      <SelectItem value="emi">EMI/Installment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editStatus} onValueChange={(val) => setEditStatus(val as Payment['status'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date & Time</Label>
                  <Input id="edit-date" name="date" type="datetime-local" defaultValue={getLocalDateTimeString(paymentToEdit.date)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes (Optional)</Label>
                  <Input id="edit-notes" name="notes" defaultValue={parseMetadata(paymentToEdit.notes || '').cleanText} placeholder="e.g. UPI QR code..." />
                </div>

                {/* Receipt Upload / Camera capture for edit */}
                <div className="space-y-2 pt-2">
                  <Label className="font-semibold text-gray-700 dark:text-gray-300">Receipt / Proof of Payment (Optional)</Label>
                  
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
                              onClick={() => setEditReceiptUrl(undefined)}
                            >
                              <Trash className="h-4 w-4" /> Remove
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
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isEditCustomCustomer ? !editCustomerId : !editCustomCustomerName.trim()}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox / View Receipt Dialog */}
      <Dialog open={isReceiptViewOpen} onOpenChange={setIsReceiptViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>Viewing uploaded receipt for this transaction</DialogDescription>
          </DialogHeader>
          {selectedReceiptUrl && (
            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-150 dark:border-gray-800">
              <img 
                src={selectedReceiptUrl} 
                alt="Receipt Full View" 
                className="max-h-[60vh] object-contain rounded-lg shadow-sm transition-all"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
