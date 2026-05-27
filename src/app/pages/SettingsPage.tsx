import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { toggleTheme } from '../store/slices/themeSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  Building2,
  FileText,
  CreditCard,
  Bell,
  Moon,
  Sun,
  Users,
  Save,
  Edit,
  Trash2,
  Plus,
  Shield,
  Lock,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export function SettingsPage() {
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  // Security / App Lock State
  const [isLockEnabled, setIsLockEnabled] = useState(() => {
    return localStorage.getItem('app_lock_enabled') === 'true';
  });
  const [backupPin, setBackupPin] = useState(() => {
    return localStorage.getItem('app_lock_pin') || '';
  });
  const [confirmPin, setConfirmPin] = useState('');
  const [isEditingPin, setIsEditingPin] = useState(false);

  const handleSaveBackupPin = () => {
    if (backupPin.length !== 4) {
      toast.error('PIN must be exactly 4 digits.');
      return;
    }
    if (backupPin !== confirmPin) {
      toast.error('PINs do not match. Please verify.');
      return;
    }
    localStorage.setItem('app_lock_pin', backupPin);
    setIsEditingPin(false);
    setConfirmPin('');
    toast.success('Backup security PIN saved successfully!');
    
    // Automatically enable lock if it wasn't already configured
    if (!isLockEnabled) {
      setIsLockEnabled(true);
      localStorage.setItem('app_lock_enabled', 'true');
      toast.info('App Lock has been automatically enabled with your new PIN.');
    }
  };

  // Company Settings State
  const [companyName, setCompanyName] = useState('The Healthy Bowl');
  const [companyAddress, setCompanyAddress] = useState('123 Health Street, Mumbai, Maharashtra');
  const [companyPhone, setCompanyPhone] = useState('+91 9876543210');
  const [companyEmail, setCompanyEmail] = useState('info@thehealthybowl.com');
  const [gstNumber, setGstNumber] = useState('27AABCU9603R1ZM');
  const [fssaiNumber, setFssaiNumber] = useState('12345678901234');
  const [panNumber, setPanNumber] = useState('AABCU9603R');

  // Bank Details State
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('50200012345678');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [accountHolderName, setAccountHolderName] = useState('The Healthy Bowl');
  const [upiId, setUpiId] = useState('thehealthybowl@hdfc');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [dueReminders, setDueReminders] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true);

  // User Management State
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@thehealthybowl.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Manager User', email: 'manager@thehealthybowl.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Accountant', email: 'accountant@thehealthybowl.com', role: 'Accountant', status: 'Active' },
  ]);

  const handleSaveCompanySettings = () => {
    toast.success('Company settings saved successfully!');
  };

  const handleSaveBankDetails = () => {
    toast.success('Bank details saved successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved successfully!');
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your application settings and preferences
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto gap-2">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="banking" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Banking</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and registration information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <Input
                    id="companyPhone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Enter company address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="company@example.com"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Registration Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="Enter GST number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fssaiNumber">FSSAI Number</Label>
                    <Input
                      id="fssaiNumber"
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value)}
                      placeholder="Enter FSSAI number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompanySettings} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banking Tab */}
        <TabsContent value="banking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Manage your bank account information for transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Enter account holder name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@bank"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBankDetails} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Due Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders for upcoming payment dues
                    </p>
                  </div>
                  <Switch
                    checked={dueReminders}
                    onCheckedChange={setDueReminders}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when payments are received
                    </p>
                  </div>
                  <Switch
                    checked={paymentAlerts}
                    onCheckedChange={setPaymentAlerts}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Low Balance Alert</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when cash balance is low
                    </p>
                  </div>
                  <Switch
                    checked={lowBalanceAlert}
                    onCheckedChange={setLowBalanceAlert}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleTheme}
                    className="gap-2"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Switch to Light
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Switch to Dark
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-medium mb-2">Current Theme</h4>
                  <Badge variant={theme === 'dark' ? 'default' : 'secondary'} className="text-sm">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage users and their access permissions
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Security Tab Content */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Shield className="h-5 w-5 text-emerald-500" />
                Security & App Lock
              </CardTitle>
              <CardDescription>
                Configure native biometrics (fingerprint/pattern/PIN) and setup your backup PIN to protect access to the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-base font-semibold">Enable Security App Lock</Label>
                    <p className="text-sm text-muted-foreground">
                      Require authentication via Android biometrics (fingerprint/pattern/PIN) or backup PIN to open the app.
                    </p>
                  </div>
                  <Switch
                    checked={isLockEnabled}
                    onCheckedChange={(checked) => {
                      if (checked && !localStorage.getItem('app_lock_pin')) {
                        toast.error('Please set up a 4-digit backup PIN first.');
                        return;
                      }
                      setIsLockEnabled(checked);
                      localStorage.setItem('app_lock_enabled', checked ? 'true' : 'false');
                      toast.success(checked ? 'App lock security enabled!' : 'App lock security disabled.');
                    }}
                  />
                </div>

                <div className="p-4 rounded-lg border bg-muted/20 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-500" />
                    Backup 4-Digit PIN Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This PIN will be used as a backup when biometrics are unavailable, or when testing in web browsers.
                  </p>

                  {localStorage.getItem('app_lock_pin') && !isEditingPin ? (
                    <div className="flex items-center justify-between bg-card p-4 rounded border">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Check className="h-4 w-4 bg-emerald-100 dark:bg-emerald-900/30 p-0.5 rounded-full" />
                        <span>Backup PIN is configured & active</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditingPin(true);
                        setBackupPin('');
                        setConfirmPin('');
                      }}>
                        Change PIN
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="backupPin">New 4-Digit PIN</Label>
                          <Input
                            id="backupPin"
                            type="password"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength={4}
                            value={backupPin}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setBackupPin(val);
                            }}
                            placeholder="Enter 4 digits"
                            className="text-center font-mono tracking-widest text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPin">Confirm New PIN</Label>
                          <Input
                            id="confirmPin"
                            type="password"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength={4}
                            value={confirmPin}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setConfirmPin(val);
                            }}
                            placeholder="Confirm 4 digits"
                            className="text-center font-mono tracking-widest text-lg"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        {localStorage.getItem('app_lock_pin') && (
                          <Button variant="ghost" size="sm" onClick={() => {
                            setIsEditingPin(false);
                            setBackupPin(localStorage.getItem('app_lock_pin') || '');
                            setConfirmPin('');
                          }}>
                            Cancel
                          </Button>
                        )}
                        <Button size="sm" onClick={handleSaveBackupPin} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Save className="h-4 w-4" />
                          Save PIN
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
