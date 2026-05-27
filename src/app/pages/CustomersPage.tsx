import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Customer, setSelectedCustomer, fetchCustomers, addCustomerDb, updateCustomerDb, deleteCustomerDb } from '../store/slices/customersSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { formatDateTime, calculateSubscriptionEndDate, parseSubscriptionDates, serializeSubscriptionDates, calculateDaysRemaining } from '../services/utils';
import { PhoneActionsDropdown } from '../components/ui/phone-actions-dropdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function CustomersPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { customers, selectedCustomer, status } = useSelector((state: RootState) => state.customers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [plan, setPlan] = useState('Fruit Bowl week');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const computedEndDate = useMemo(() => {
    return calculateSubscriptionEndDate(startDate, plan);
  }, [startDate, plan]);

  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const enrichedCustomers = useMemo(() => {
    return customers.map(c => {
      const { cleanNotes, startDate: parsedStart, endDate: parsedEnd } = parseSubscriptionDates(c.notes);
      const fallbackStart = c.joiningDate?.split('T')[0] || todayStr;
      const fallbackEnd = calculateSubscriptionEndDate(fallbackStart, c.plan);
      
      const finalStart = parsedStart || fallbackStart;
      const finalEnd = parsedEnd || fallbackEnd;
      
      const dynamicDays = calculateDaysRemaining(finalEnd);
      const dynamicStatus = dynamicDays < 0 ? 'overdue' : c.paymentStatus;
      
      return {
        ...c,
        cleanNotes,
        startDate: finalStart,
        endDate: finalEnd,
        daysRemaining: dynamicDays,
        paymentStatus: dynamicStatus
      };
    });
  }, [customers, todayStr]);

  const enrichedSelectedCustomer = useMemo(() => {
    if (!selectedCustomer) return null;
    return enrichedCustomers.find(c => c.id === selectedCustomer.id) || null;
  }, [selectedCustomer, enrichedCustomers]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCustomers());
    }
  }, [status, dispatch]);

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawNotes = formData.get('notes') as string;
    const serializedNotes = serializeSubscriptionDates(rawNotes, startDate, computedEndDate);
    const newCustomer: Customer = {
      id: `CUST-${uuidv4().substring(0, 8).toUpperCase()}`,
      name: formData.get('name') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      plan: plan,
      address: formData.get('address') as string,
      notes: serializedNotes,
      joiningDate: startDate,
      paymentStatus: 'pending',
      daysRemaining: calculateDaysRemaining(computedEndDate),
      pendingAmount: 0,
      lastPaymentDate: '-',
      totalPaid: 0,
      payments: []
    };
    await dispatch(addCustomerDb(newCustomer));
    setIsAddDialogOpen(false);
  };

  const filteredCustomers = enrichedCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.mobile.includes(searchQuery) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || customer.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewCustomer = (customer: Customer) => {
    dispatch(setSelectedCustomer(customer));
    setIsDrawerOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setCustomerToEdit(customer);
    setPlan(customer.plan);
    const { startDate: parsedStart } = parseSubscriptionDates(customer.notes);
    setStartDate(parsedStart || customer.joiningDate?.split('T')[0] || todayStr);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerToEdit) return;
    const formData = new FormData(e.currentTarget);
    const rawNotes = formData.get('notes') as string;
    const serializedNotes = serializeSubscriptionDates(rawNotes, startDate, computedEndDate);
    const updatedCustomer: Customer = {
      ...customerToEdit,
      name: formData.get('name') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      plan: plan,
      notes: serializedNotes,
      joiningDate: startDate,
      daysRemaining: calculateDaysRemaining(computedEndDate),
      address: formData.get('address') as string,
    };
    await dispatch(updateCustomerDb(updatedCustomer));
    setIsEditDialogOpen(false);
    setCustomerToEdit(null);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await dispatch(deleteCustomerDb(id));
      if (selectedCustomer?.id === id) {
        setIsDrawerOpen(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      pending: { variant: 'secondary', label: 'Pending' },
      overdue: { variant: 'destructive', label: 'Overdue' },
    };
    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all your customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-500">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Enter customer details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input id="mobile" name="mobile" required placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan</Label>
                    <Select value={plan} onValueChange={setPlan}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fruit Bowl week">1 Fruit Bowl week</SelectItem>
                        <SelectItem value="Fruit Bowl Month">2 Fruit Bowl Month</SelectItem>
                        <SelectItem value="Fruit + Drink week">3 Fruit + Drink week</SelectItem>
                        <SelectItem value="fruit + Drink Month">4 fruit + Drink Month</SelectItem>
                        <SelectItem value="Others">5 Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Sundays Excluded)</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={computedEndDate}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-semibold cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required placeholder="Enter address" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Additional notes..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Customer</Button>
                </div>
              </form>
            </DialogContent>

          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>Update customer details</DialogDescription>
              </DialogHeader>
              {customerToEdit && (
                <form onSubmit={handleEditSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input id="edit-name" name="name" defaultValue={customerToEdit.name} required placeholder="Enter name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-mobile">Mobile</Label>
                      <Input id="edit-mobile" name="mobile" defaultValue={customerToEdit.mobile} required placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input id="edit-email" name="email" type="email" defaultValue={customerToEdit.email} placeholder="email@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-plan">Plan</Label>
                      <Select value={plan} onValueChange={setPlan}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fruit Bowl week">1 Fruit Bowl week</SelectItem>
                          <SelectItem value="Fruit Bowl Month">2 Fruit Bowl Month</SelectItem>
                          <SelectItem value="Fruit + Drink week">3 Fruit + Drink week</SelectItem>
                          <SelectItem value="fruit + Drink Month">4 fruit + Drink Month</SelectItem>
                          <SelectItem value="Others">5 Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-startDate">Start Date</Label>
                      <Input
                        id="edit-startDate"
                        name="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-endDate">End Date (Sundays Excluded)</Label>
                      <Input
                        id="edit-endDate"
                        name="endDate"
                        type="date"
                        value={computedEndDate}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-semibold cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-address">Address</Label>
                      <Input id="edit-address" name="address" defaultValue={customerToEdit.address} required placeholder="Enter address" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-notes">Notes</Label>
                      <Textarea id="edit-notes" name="notes" defaultValue={customerToEdit.notes} placeholder="Additional notes..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, mobile, or ID...,   ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          <CardDescription>Complete list of all customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{customer.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                     <TableCell>
                       <PhoneActionsDropdown phoneNumber={customer.mobile}>
                         {customer.mobile}
                       </PhoneActionsDropdown>
                     </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit text-[11px] font-semibold">
                          {customer.plan}
                        </Badge>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          {customer.startDate} to {customer.endDate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.paymentStatus)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          customer.pendingAmount > 0
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-green-600 dark:text-green-400'
                        }
                      >
                        ₹{customer.pendingAmount.toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          customer.daysRemaining < 0
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : customer.daysRemaining <= 7
                            ? 'text-orange-600 dark:text-orange-400'
                            : ''
                        }
                      >
                        {customer.daysRemaining < 0
                          ? `${Math.abs(customer.daysRemaining)} overdue`
                          : `${customer.daysRemaining} days`}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(customer.lastPaymentDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription>Complete customer profile</SheetDescription>
          </SheetHeader>

          {enrichedSelectedCustomer && (
            <div className="space-y-6 mt-6">
              {/* Customer Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                      {enrichedSelectedCustomer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{enrichedSelectedCustomer.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {enrichedSelectedCustomer.id}
                      </p>
                      <div className="mt-2">{getStatusBadge(enrichedSelectedCustomer.paymentStatus)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500">Mobile</p>
                         <p className="font-medium">
                           <PhoneActionsDropdown phoneNumber={enrichedSelectedCustomer.mobile}>
                             {enrichedSelectedCustomer.mobile}
                           </PhoneActionsDropdown>
                         </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{enrichedSelectedCustomer.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg md:col-span-2">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-medium">{enrichedSelectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="font-semibold">{enrichedSelectedCustomer.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Days Remaining</p>
                      <p className="font-semibold">{enrichedSelectedCustomer.daysRemaining} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-semibold">{enrichedSelectedCustomer.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date (Sundays Excluded)</p>
                      <p className="font-semibold">{enrichedSelectedCustomer.endDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Paid</p>
                      <p className="font-semibold text-green-600">
                        ₹{enrichedSelectedCustomer.totalPaid.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Amount</p>
                      <p className="font-semibold text-red-600">
                        ₹{enrichedSelectedCustomer.pendingAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Payment</p>
                      <p className="font-semibold">{formatDateTime(enrichedSelectedCustomer.lastPaymentDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enrichedSelectedCustomer.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">₹{payment.amount.toLocaleString('en-IN')}</p>
                             <p className="text-xs text-gray-500">{formatDateTime(payment.date)}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{payment.method}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {enrichedSelectedCustomer.cleanNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {enrichedSelectedCustomer.cleanNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => navigate(`/payments?openAdd=true&customerId=${enrichedSelectedCustomer.id}`)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleEditClick(enrichedSelectedCustomer)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="destructive" className="flex-none" onClick={() => handleDeleteCustomer(enrichedSelectedCustomer.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
