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
import {
  UserCog,
  Plus,
  Search,
  Shield,
  UserCheck,
  Users,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Activity,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const roleConfig = {
  admin: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Shield },
  manager: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: UserCheck },
  accountant: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: DollarSign },
  staff: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Users },
};

export function StaffPage() {
  const { staff } = useSelector((state: RootState) => state.staff);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const totalSalary = staff.reduce((sum, s) => sum + s.salary, 0);

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.mobile.includes(searchQuery)
  );

  const getRoleBadge = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    const Icon = config?.icon || Users;
    return (
      <Badge className={`${config?.color} flex items-center gap-1 w-fit capitalize`}>
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            कर्मचारी प्रबंधन - Manage team members and roles
          </p>
        </div>
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-500">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>नया कर्मचारी जोड़ें - Enter staff details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Full Name / पूरा नाम</Label>
                <Input placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <Label>Role / भूमिका</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin / प्रशासक</SelectItem>
                    <SelectItem value="manager">Manager / प्रबंधक</SelectItem>
                    <SelectItem value="accountant">Accountant / लेखाकार</SelectItem>
                    <SelectItem value="staff">Staff / कर्मचारी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Mobile / मोबाइल</Label>
                <Input placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label>Salary / वेतन</Label>
                <Input type="number" placeholder="₹ 0.00" />
              </div>
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddStaffOpen(false)}>Add Staff</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Staff"
          titleHi="कुल कर्मचारी"
          value={totalStaff}
          change="4 departments"
          changeType="neutral"
          icon={Users}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Active Today"
          titleHi="आज सक्रिय"
          value={activeStaff}
          change="100% attendance"
          changeType="positive"
          icon={UserCheck}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Total Salary"
          titleHi="कुल वेतन"
          value={`₹${totalSalary.toLocaleString('en-IN')}`}
          change="Monthly cost"
          changeType="neutral"
          icon={DollarSign}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title="Departments"
          titleHi="विभाग"
          value="4"
          change="Well organized"
          changeType="neutral"
          icon={UserCog}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search staff by name, email, or mobile... / कर्मचारी खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-emerald-500 text-white text-xl font-bold">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.id}</p>
                  <div className="mt-2">{getRoleBadge(member.role)}</div>
                </div>
                <Badge
                  variant={member.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {member.status}
                </Badge>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{member.mobile}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Joined {member.joiningDate}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ₹{member.salary.toLocaleString('en-IN')}/month
                  </span>
                </div>
                {member.lastActive && (
                  <div className="flex items-center gap-3 text-sm">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Last active: {member.lastActive}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>कर्मचारी निर्देशिका - Complete staff list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name / नाम</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-emerald-500 text-white text-xs">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{member.email}</div>
                        <div className="text-xs text-gray-500">{member.mobile}</div>
                      </div>
                    </TableCell>
                    <TableCell>{member.joiningDate}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ₹{member.salary.toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {member.lastActive || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
