import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchCustomers } from '../store/slices/customersSlice';
import { addOrder, markAsDelivered, autoGenerateSubscriptionOrders, Order } from '../store/slices/ordersSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
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
import { toast } from 'sonner';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  MessageCircle,
  Check,
  Truck,
  Calendar,
  AlertCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';

const getDailyDeliveryMessage = (customerName: string, itemName: string): string => {
  const dayIndex = new Date().getDay();
  const messages = [
    `Blessed Sunday, ${customerName}! 🌸 A perfect day to refresh and restore. Your fresh meal (${itemName}) has been successfully delivered from The Healthy Bowl! 🍒🥗 Enjoy your peaceful day!`,
    `Happy Monday, ${customerName}! 🌟 Start your week with a fresh burst of energy! Your fresh daily meal (${itemName}) has been successfully delivered from The Healthy Bowl! 🥦🥗 Have a productive day ahead!`,
    `Terrific Tuesday, ${customerName}! ✨ Keeping up the healthy momentum! Your delicious meal (${itemName}) has been successfully delivered from The Healthy Bowl! 🍓🥑 Eat clean, feel great!`,
    `Wonderful Wednesday, ${customerName}! 🐫 You are halfway through the week, keep shining! Your fresh daily meal (${itemName}) has been successfully delivered from The Healthy Bowl! 🍉🥗 Fuel your day right!`,
    `Thriving Thursday, ${customerName}! 🚀 Almost the weekend, keep crushing your health goals! Your nutritious meal (${itemName}) has been successfully delivered from The Healthy Bowl! 🥝🥑 Stay healthy, stay strong!`,
    `Fabulous Friday, ${customerName}! 🎉 End your work week on a healthy high note! Your delicious meal (${itemName}) has been successfully delivered from The Healthy Bowl! 🍇🥗 Here's to a great weekend ahead!`,
    `Super Saturday, ${customerName}! ☀️ Recharge and nourish your body! Your healthy meal (${itemName}) has been successfully delivered from The Healthy Bowl! 🍊🥗 Have a beautiful and refreshing weekend!`
  ];
  return messages[dayIndex];
};

export function OrdersPage() {
  const dispatch = useDispatch<any>();
  const { customers, status: customersStatus } = useSelector((state: RootState) => state.customers);
  const { orders } = useSelector((state: RootState) => state.orders);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [custType, setCustType] = useState<'existing' | 'walkin'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Get current date string formatted in local time (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Fetch customers if not already loaded
  useEffect(() => {
    if (customersStatus === 'idle') {
      dispatch(fetchCustomers());
    }
  }, [customersStatus, dispatch]);

  // Auto-generate subscription orders for today when customers are loaded
  useEffect(() => {
    if (customersStatus === 'succeeded' && customers.length > 0) {
      dispatch(autoGenerateSubscriptionOrders({ customers, date: todayStr }));
    }
  }, [customersStatus, customers, todayStr, dispatch]);

  // Pre-fill fields for existing customer selection in form
  const selectedCustomerInfo = useMemo(() => {
    if (custType === 'existing' && selectedCustomerId) {
      return customers.find(c => c.id === selectedCustomerId);
    }
    return null;
  }, [custType, selectedCustomerId, customers]);

  // Handle Mark Delivered with local updates and WhatsApp trigger
  const handleDeliver = (order: Order) => {
    dispatch(markAsDelivered(order.id));
    toast.success(`Order ${order.id} marked as delivered!`);

    // Clean phone number (extract numbers only)
    const cleanNumber = order.customerMobile.replace(/[^\d+]/g, '');
    let whatsappNumber = cleanNumber.replace('+', '');
    if (whatsappNumber.length === 10) {
      whatsappNumber = '91' + whatsappNumber; // Default Indian country code prefix if 10-digit
    }

    // Pre-composed WhatsApp notification message
    const message = getDailyDeliveryMessage(order.customerName, order.itemName);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Open in a new tab for seamless notification sending
    window.open(url, '_blank');
  };

  // Submit manual/walk-in or custom customer order
  const handleAddCustomOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let name = '';
    let mobile = '';
    let customerId: string | undefined = undefined;

    if (custType === 'existing') {
      if (!selectedCustomerId) {
        toast.error('Please select a customer.');
        return;
      }
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        name = customer.name;
        mobile = customer.mobile;
        customerId = customer.id;
      }
    } else {
      name = formData.get('customName') as string;
      mobile = formData.get('customMobile') as string;
      if (!name || !mobile) {
        toast.error('Please enter name and mobile number.');
        return;
      }
    }

    const itemName = formData.get('itemName') as string;
    if (!itemName) {
      toast.error('Please specify order item.');
      return;
    }

    const amountStr = formData.get('amount') as string;
    const amount = amountStr ? Number(amountStr) : undefined;
    const orderDate = (formData.get('orderDate') as string) || todayStr;

    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      customerId,
      customerName: name,
      customerMobile: mobile,
      itemName,
      amount,
      orderType: 'custom',
      status: 'pending',
      date: orderDate,
      timestamp: new Date().toISOString(),
    };

    dispatch(addOrder(newOrder));
    toast.success('Custom order added successfully!');
    setIsAddDialogOpen(false);
    
    // Clear selection state
    setSelectedCustomerId('');
  };

  // Filter orders based on query and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerMobile.includes(searchQuery) ||
        order.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesOrderType = orderTypeFilter === 'all' || order.orderType === orderTypeFilter;

      return matchesSearch && matchesStatus && matchesOrderType;
    });
  }, [orders, searchQuery, statusFilter, orderTypeFilter]);

  // Group all orders by date in descending chronological order
  const ordersGroupedByDate = useMemo(() => {
    const groups: Record<string, Order[]> = {};
    filteredOrders.forEach(order => {
      const d = order.date;
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(order);
    });

    // Sort dates descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredOrders]);

  // Calculate statistics for Today
  const todayStats = useMemo(() => {
    const todayOrders = orders.filter(o => o.date === todayStr);
    const pending = todayOrders.filter(o => o.status === 'pending').length;
    const delivered = todayOrders.filter(o => o.status === 'delivered').length;
    return {
      total: todayOrders.length,
      pending,
      delivered,
    };
  }, [orders, todayStr]);

  // Filter orders specifically for Today
  const todayOrdersList = useMemo(() => {
    return filteredOrders.filter(o => o.date === todayStr);
  }, [filteredOrders, todayStr]);

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track subscription deliveries & process custom restaurant orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Place Custom Order</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Record an order for a walk-in customer or select a registered subscriber.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomOrder} className="space-y-4 pt-4">
                {/* Selector for Customer Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Customer Type</Label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCustType('existing')}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        custType === 'existing'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      Registered Subscriber
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustType('walkin')}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        custType === 'walkin'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      Walk-in (One-time)
                    </button>
                  </div>
                </div>

                {/* Existing Customer Dropdown */}
                {custType === 'existing' ? (
                  <div className="space-y-2">
                    <Label htmlFor="customer-select">Select Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="w-full bg-transparent border rounded-xl h-10">
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.mobile})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="customName">Full Name</Label>
                      <Input
                        id="customName"
                        name="customName"
                        placeholder="Enter walk-in name"
                        className="rounded-xl bg-transparent border focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customMobile">Mobile Number</Label>
                      <Input
                        id="customMobile"
                        name="customMobile"
                        placeholder="+91 XXXXX XXXXX"
                        className="rounded-xl bg-transparent border focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Pre-filled info for registered customer */}
                {custType === 'existing' && selectedCustomerInfo && (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-1">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Subscriber Details:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Mobile: {selectedCustomerInfo.mobile}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Current Plan: {selectedCustomerInfo.plan}</p>
                  </div>
                )}

                {/* Item Details */}
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item / Meal Name</Label>
                  <Input
                    id="itemName"
                    name="itemName"
                    placeholder="e.g. Mixed Fruit Salad Bowl, Keto Juice"
                    defaultValue={custType === 'existing' && selectedCustomerInfo ? selectedCustomerInfo.plan : ''}
                    className="rounded-xl bg-transparent border focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Optional)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="₹0.00"
                      className="rounded-xl bg-transparent border focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderDate">Order Date</Label>
                    <Input
                      id="orderDate"
                      name="orderDate"
                      type="date"
                      defaultValue={todayStr}
                      className="rounded-xl bg-transparent border focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md"
                  >
                    Confirm Order
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top Level Today Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/30 overflow-hidden relative group transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-wider uppercase">Today's Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{todayStats.total}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-32 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-900/20 dark:to-orange-900/10 border-amber-100 dark:border-amber-900/30 overflow-hidden relative group transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wider uppercase">Pending Deliveries</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{todayStats.pending}</h3>
              </div>
              <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
              <Clock className="h-32 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/20 dark:to-teal-900/10 border-emerald-100 dark:border-emerald-900/30 overflow-hidden relative group transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">Delivered Today</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{todayStats.delivered}</h3>
              </div>
              <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-32 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-white dark:bg-gray-800 border shadow-xs rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer, mobile, item or order ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-11 rounded-xl bg-transparent border focus-visible:ring-2 focus-visible:ring-blue-500 h-11"
              />
            </div>
            <div className="flex w-full md:w-auto gap-3 items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px] rounded-xl h-11 border bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Delivery Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deliveries</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                <SelectTrigger className="w-full md:w-[160px] rounded-xl h-11 border bg-transparent">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Order Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="custom">Custom/Walk-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Active Deliveries Section */}
      <Card className="bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/40 dark:to-gray-800 border shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="border-b dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Today's Active Orders ({todayStr})</CardTitle>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100/70 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {todayOrdersList.length} total
            </Badge>
          </div>
          <CardDescription className="text-xs text-gray-500 mt-0.5">Today's auto-generated daily subscription batches and single custom orders.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {todayOrdersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-semibold">No active orders scheduled for today.</p>
              <p className="text-xs text-gray-400 max-w-[280px] mt-1">Select a customer or verify active subscription plans to generate daily orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/30 border-b dark:border-gray-700">
                  <TableRow>
                    <TableHead className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Meal / Plan</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Cost</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayOrdersList.map(order => (
                    <TableRow key={order.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/40 border-b dark:border-gray-700/80 transition-colors">
                      <TableCell className="py-4 px-6 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {order.id}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                            {order.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{order.customerName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.customerMobile}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{order.itemName}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {order.orderType === 'subscription' ? (
                          <Badge variant="outline" className="px-2 py-0.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:bg-blue-950/20 text-xs font-medium uppercase tracking-wider">
                            Subscription
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-2 py-0.5 rounded-full border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-900 dark:text-purple-300 dark:bg-purple-950/20 text-xs font-medium uppercase tracking-wider">
                            Custom Single
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                        {order.amount ? `₹${order.amount.toLocaleString('en-IN')}` : '-'}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {order.status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 shadow-2xs border border-green-200/50">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 shadow-2xs border border-amber-200/50 animate-pulse">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        {order.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleDeliver(order)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm ml-auto"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Mark Delivered
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Trigger WhatsApp template again if needed
                              const cleanNumber = order.customerMobile.replace(/[^\d+]/g, '');
                              let whatsappNumber = cleanNumber.replace('+', '');
                              if (whatsappNumber.length === 10) whatsappNumber = '91' + whatsappNumber;
                              const message = getDailyDeliveryMessage(order.customerName, order.itemName);
                              window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5 ml-auto"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Resend Text
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Date-Wise Deliveries Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 pt-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Date-Wise Delivery Archive
        </h2>

        {ordersGroupedByDate.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-semibold">No orders match the current filters.</p>
            <p className="text-xs text-gray-400 mt-0.5">Try clearing the search query or changing filter settings.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {ordersGroupedByDate.map(([date, dateOrders]) => (
              <Card key={date} className="bg-white dark:bg-gray-800 border shadow-xs rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 py-3.5 px-6 border-b dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {date === todayStr ? `Today (${date})` : date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-medium">
                        {dateOrders.filter(o => o.status === 'delivered').length} / {dateOrders.length} Completed
                      </span>
                      <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${(dateOrders.filter(o => o.status === 'delivered').length / dateOrders.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        {dateOrders.map(order => (
                          <TableRow key={order.id} className="hover:bg-gray-50/10 dark:hover:bg-gray-900/10 border-b dark:border-gray-700/60 last:border-0">
                            <TableCell className="py-3 px-6 text-sm font-semibold text-gray-500 w-24">
                              {order.id}
                            </TableCell>
                            <TableCell className="py-3 px-6 w-60">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-800 dark:text-gray-300 text-xs">
                                  {order.customerName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{order.customerName}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.customerMobile}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                              {order.itemName}
                            </TableCell>
                            <TableCell className="py-3 px-6">
                              {order.orderType === 'subscription' ? (
                                <Badge variant="outline" className="px-2 py-0.5 text-2xs rounded-full border-blue-100 text-blue-600 bg-blue-50/30 dark:border-blue-900/40 dark:text-blue-400 dark:bg-blue-950/10 uppercase font-medium">
                                  Subscription
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="px-2 py-0.5 text-2xs rounded-full border-purple-100 text-purple-600 bg-purple-50/30 dark:border-purple-900/40 dark:text-purple-400 dark:bg-purple-950/10 uppercase font-medium">
                                  Custom Single
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                              {order.amount ? `₹${order.amount.toLocaleString('en-IN')}` : '-'}
                            </TableCell>
                            <TableCell className="py-3 px-6">
                              {order.status === 'delivered' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-150">
                                  <Check className="h-3 w-3" />
                                  Delivered
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-150">
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-3 px-6 text-right">
                              {order.status === 'pending' ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleDeliver(order)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-2xs flex items-center gap-1.5 ml-auto py-1 px-2.5"
                                >
                                  <Truck className="h-3 w-3" />
                                  Mark Delivered
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const cleanNumber = order.customerMobile.replace(/[^\d+]/g, '');
                                    let whatsappNumber = cleanNumber.replace('+', '');
                                    if (whatsappNumber.length === 10) whatsappNumber = '91' + whatsappNumber;
                                    const message = getDailyDeliveryMessage(order.customerName, order.itemName);
                                    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                  }}
                                  className="rounded-xl border-emerald-100 hover:bg-emerald-50 text-emerald-600 dark:border-emerald-950/20 dark:hover:bg-emerald-950/10 text-2xs flex items-center gap-1.5 ml-auto py-1 px-2.5"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                  Resend Text
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
