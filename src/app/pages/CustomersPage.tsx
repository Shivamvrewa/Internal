import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Customer, setSelectedCustomer } from '../store/slices/customersSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function CustomersPage() {
  const dispatch = useDispatch();
  const { customers, selectedCustomer } = useSelector((state: RootState) => state.customers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCustomers = customers.filter((customer) => {
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
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ग्राहक प्रबंधन - Manage all your customers
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
                <DialogDescription>नया ग्राहक जोड़ें - Enter customer details</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name / पूरा नाम</Label>
                  <Input id="name" placeholder="Enter name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile / मोबाइल</Label>
                  <Input id="mobile" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan / योजना</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic-monthly">Basic Monthly</SelectItem>
                      <SelectItem value="premium-monthly">Premium Monthly</SelectItem>
                      <SelectItem value="basic-quarterly">Basic Quarterly</SelectItem>
                      <SelectItem value="premium-annual">Premium Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address / पता</Label>
                  <Input id="address" placeholder="Enter address" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes / टिप्पणी</Label>
                  <Textarea id="notes" placeholder="Additional notes..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Add Customer</Button>
              </div>
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
                placeholder="Search by name, mobile, or ID... / नाम, मोबाइल से खोजें..."
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
          <CardDescription>Complete list of all customers / सभी ग्राहकों की सूची</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name / नाम</TableHead>
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
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {customer.plan}
                      </Badge>
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
                      {customer.lastPaymentDate}
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
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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
            <SheetDescription>ग्राहक विवरण - Complete customer profile</SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="space-y-6 mt-6">
              {/* Customer Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {selectedCustomer.id}
                      </p>
                      <div className="mt-2">{getStatusBadge(selectedCustomer.paymentStatus)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500">Mobile</p>
                        <p className="font-medium">{selectedCustomer.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{selectedCustomer.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg md:col-span-2">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-medium">{selectedCustomer.address}</p>
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
                      <p className="font-semibold">{selectedCustomer.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Days Remaining</p>
                      <p className="font-semibold">{selectedCustomer.daysRemaining} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joining Date</p>
                      <p className="font-semibold">{selectedCustomer.joiningDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Paid</p>
                      <p className="font-semibold text-green-600">
                        ₹{selectedCustomer.totalPaid.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Amount</p>
                      <p className="font-semibold text-red-600">
                        ₹{selectedCustomer.pendingAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Payment</p>
                      <p className="font-semibold">{selectedCustomer.lastPaymentDate}</p>
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
                    {selectedCustomer.payments.map((payment) => (
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
                            <p className="text-xs text-gray-500">{payment.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{payment.method}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedCustomer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCustomer.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
