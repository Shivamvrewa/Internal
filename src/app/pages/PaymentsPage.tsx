import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchPayments, addPaymentDb, Payment } from '../store/slices/paymentsSlice';
import { fetchCustomers } from '../store/slices/customersSlice';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
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
} from 'lucide-react';
import { StatsCard } from '../components/analytics/StatsCard';

export function PaymentsPage() {
  const dispatch = useDispatch<any>();
  const { payments, status: paymentsStatus } = useSelector((state: RootState) => state.payments);
  const { customers, status: customersStatus } = useSelector((state: RootState) => state.customers);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [customerId, setCustomerId] = useState('');
  const [method, setMethod] = useState('cash');
  const [type, setType] = useState('full');

  useEffect(() => {
    if (paymentsStatus === 'idle') {
      dispatch(fetchPayments());
    }
    if (customersStatus === 'idle') {
      dispatch(fetchCustomers());
    }
  }, [paymentsStatus, customersStatus, dispatch]);

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newPayment: Payment = {
      id: `PAY-${uuidv4().substring(0, 8).toUpperCase()}`,
      customerId,
      customerName: customer.name,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      method: method as Payment['method'],
      status: 'completed',
      type: type as Payment['type'],
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    };
    await dispatch(addPaymentDb(newPayment));
    setIsAddPaymentOpen(false);
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>Add payment details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment}>
                <div className="space-y-4 py-4">
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
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!customerId}>Record Payment</Button>
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
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const Icon = getPaymentMethodIcon(payment.method);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>{payment.customerName}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              ₹{payment.amount.toLocaleString('en-IN')}
                            </span>
                          </TableCell>
                          <TableCell>{payment.date}</TableCell>
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
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{payment.customerName}</p>
                          <p className="text-sm text-gray-500">
                            {payment.date} • {payment.method.toUpperCase()}
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
    </div>
  );
}
