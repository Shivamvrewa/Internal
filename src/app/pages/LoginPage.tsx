import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Moon, Sun, ShieldAlert, Sparkles, User, Shield, Terminal, ArrowLeft, Mail } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toggleTheme } from '../store/slices/themeSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function LoginPage() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  const { setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Google Accounts Selector Dialog States
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('Admin');

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    setTheme(mode === 'light' ? 'dark' : 'light');
  };

  const handleGoogleLogin = () => {
    // Open the premium simulation picker immediately to avoid disabled Supabase redirect errors
    setIsGoogleModalOpen(true);
  };

  const handleRealSupabaseOAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.warn('Real OAuth failed:', error.message);
      toast.error(`Live OAuth failed: ${error.message}. Make sure Google is enabled in your Supabase dashboard.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockLogin = (name: string, email: string, role: string) => {
    dispatch(login({ name, email, role }));
    setIsGoogleModalOpen(false);
    toast.success(`Welcome back, ${name}! Signed in as ${role} via Google Account.`, {
      icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      toast.error('Please fill in both Name and Email!');
      return;
    }
    handleMockLogin(customName, customEmail, customRole);
  };

  const sandboxProfiles = [
    { name: 'Shivam', email: 'shivam@example.com', role: 'Admin', color: 'from-blue-600 to-indigo-600' },
    { name: 'Aman', email: 'aman@example.com', role: 'Manager', color: 'from-emerald-500 to-teal-600' },
    { name: 'Priya', email: 'priya@example.com', role: 'Accountant', color: 'from-rose-500 to-orange-500' },
  ];

  const googleProfiles = [
    { name: 'Shivam Vrewa', email: 'shivam.vrewa@gmail.com', role: 'Admin', color: 'bg-blue-100 text-blue-700' },
    { name: 'Aman Kumar', email: 'aman.kumar@gmail.com', role: 'Manager', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Priya Sharma', email: 'priya.sharma@gmail.com', role: 'Accountant', color: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-500 overflow-hidden px-4">
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-blue-600/10 to-teal-500/10 dark:from-blue-500/5 dark:to-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-purple-500/10 to-rose-500/10 dark:from-purple-500/5 dark:to-rose-500/5 blur-[120px] pointer-events-none" />

      {/* Floating Theme Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleTheme}
        className="absolute top-4 right-4 rounded-full w-10 h-10 p-0 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur"
      >
        {mode === 'light' ? <Moon className="h-4 w-4 text-gray-800" /> : <Sun className="h-4 w-4 text-yellow-400" />}
      </Button>

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-lg shadow-blue-500/20 text-white mb-2">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-emerald-400">
            Smart Ledger
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Collaborative Financial Ledger & Real-time Expenses
          </p>
        </div>

        {/* Login Card */}
        <Card className="border border-white/20 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-xs">Sign in to sync ledger updates in real time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Google Sign-in Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg shadow-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Sign in with Google
            </Button>

            {/* Separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                Developer Sandbox
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            {/* Sandbox Quick Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
                <Terminal className="h-3.5 w-3.5" />
                <span>Quick Sandbox profiles for local testing:</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {sandboxProfiles.map((profile) => (
                  <button
                    key={profile.name}
                    onClick={() => handleMockLogin(profile.name, profile.email, profile.role)}
                    className="group relative w-full p-3.5 text-left border border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-950/20 hover:bg-white dark:hover:bg-gray-950/60 rounded-2xl transition-all duration-300 hover:shadow shadow-sm flex items-center justify-between outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${profile.color} text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                        {profile.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {profile.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {profile.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Google Sign-in Selector Simulation Modal */}
      <Dialog open={isGoogleModalOpen} onOpenChange={(open) => {
        setIsGoogleModalOpen(open);
        if (!open) setUseCustomAccount(false);
      }}>
        <DialogContent className="max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-950 shadow-2xl">
          <DialogHeader className="text-center pb-2">
            <svg className="h-6 w-6 mx-auto mb-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Choose an account</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
              to continue to <span className="font-semibold text-blue-600 dark:text-blue-400">Smart Ledger</span>
            </DialogDescription>
          </DialogHeader>

          {!useCustomAccount ? (
            <div className="space-y-4">
              {/* Account List */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                {googleProfiles.map((profile) => (
                  <button
                    key={profile.email}
                    onClick={() => handleMockLogin(profile.name, profile.email, profile.role)}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors outline-none"
                  >
                    <div className={`w-9 h-9 rounded-full ${profile.color} flex items-center justify-center font-bold text-sm shadow-sm`}>
                      {profile.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{profile.email}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-2 py-0.5 border rounded-full shrink-0">
                      {profile.role}
                    </span>
                  </button>
                ))}
              </div>

              {/* Use Another Account Option */}
              <button
                onClick={() => setUseCustomAccount(true)}
                className="w-full p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors outline-none"
              >
                <User className="h-4 w-4 text-gray-400" />
                Use another account
              </button>

              {/* Real OAuth Option for Developers */}
              <button
                type="button"
                onClick={handleRealSupabaseOAuth}
                className="w-full py-2.5 px-4 border border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all outline-none"
              >
                <Shield className="h-3.5 w-3.5 text-blue-500" />
                Try Live Supabase Google OAuth
              </button>

              <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed text-center px-2">
                To continue, Google will share your name, email address, language preference, and profile picture with Smart Ledger.
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setUseCustomAccount(false)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold p-1 outline-none mb-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to accounts
              </button>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-name" className="text-xs font-bold text-gray-700 dark:text-gray-300">Google Profile Name</Label>
                  <Input
                    id="custom-name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name (e.g. John Doe)"
                    required
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="custom-email" className="text-xs font-bold text-gray-700 dark:text-gray-300">Google Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="custom-email"
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Enter your email (e.g. john@gmail.com)"
                      required
                      className="h-10 pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Ledger Role / Permission</Label>
                  <Select value={customRole} onValueChange={setCustomRole}>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="Manager">Manager (Edit Access)</SelectItem>
                      <SelectItem value="Accountant">Accountant (Ledger Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mt-2 transition-colors hover:shadow-lg"
              >
                Sign in with Custom Google Account
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
