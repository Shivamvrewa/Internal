import { Bell, Search, Sun, Moon, User, LogOut, Menu, Receipt, TrendingUp, Check, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { login } from '../../store/slices/authSlice';
import { useTheme } from 'next-themes';
import { markAsRead, markAllAsRead, clearAllNotifications } from '../../store/slices/notificationsSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications = [], unreadCount = 0 } = useSelector((state: RootState) => state.notifications || {});
  const { setTheme } = useTheme();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    setTheme(mode === 'light' ? 'dark' : 'light');
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (e) {
      return 'some time ago';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* Search */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers, payments, invoices...,  ..."
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Mobile Search Icon */}
        <Button variant="ghost" size="sm" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleTheme}
            className="rounded-full text-gray-700 dark:text-gray-300"
          >
            {mode === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full relative text-gray-700 dark:text-gray-300">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs border-2 border-white dark:border-gray-800 rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
                <DropdownMenuLabel className="p-0 text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 p-0 h-auto hover:bg-transparent"
                    onClick={() => dispatch(markAllAsRead())}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto space-y-2 p-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="h-8 w-8 mb-2 opacity-40 text-gray-400" />
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((noti) => {
                    const Icon = noti.type === 'payment' ? TrendingUp : noti.type === 'expense' ? Receipt : User;
                    const bgClass = noti.type === 'payment' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    noti.type === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
                    
                    return (
                      <div
                        key={noti.id}
                        onClick={() => dispatch(markAsRead(noti.id))}
                        className={`p-3 rounded-lg flex gap-3 transition-all duration-200 cursor-pointer border border-transparent ${
                          !noti.isRead 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{noti.title}</p>
                            <span className="text-[10px] text-gray-400 shrink-0 font-medium">{formatTime(noti.timestamp)}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-normal line-clamp-2">{noti.description}</p>
                        </div>
                        {!noti.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2 flex justify-center bg-gray-50/50 dark:bg-gray-800/20 rounded-b-xl">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 gap-1.5 font-semibold"
                      onClick={() => dispatch(clearAllNotifications())}
                    >
                      Clear all history
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Switcher Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                  user?.name?.startsWith('Aman') ? 'from-emerald-500 to-teal-600' :
                  user?.name?.startsWith('Priya') ? 'from-rose-500 to-orange-500' :
                  'from-blue-600 to-indigo-600'
                } text-white flex items-center justify-center font-bold text-sm shadow-sm transition-all`}>
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-1.5">
              <DropdownMenuLabel className="px-2.5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Current Identity
              </DropdownMenuLabel>
              <div className="px-2.5 py-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg mb-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                <span className="inline-block text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md mt-1.5 uppercase tracking-wide border border-blue-100/50 dark:border-blue-900/20">
                  {user?.role}
                </span>
              </div>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Switch User
              </DropdownMenuLabel>
              {[
                { name: 'Shivam Vrewa', email: 'shivam.vrewa@gmail.com', role: 'Admin', color: 'from-blue-600 to-indigo-600' },
                { name: 'Aman Kumar', email: 'aman.kumar@gmail.com', role: 'Manager', color: 'from-emerald-500 to-teal-600' },
                { name: 'Priya Sharma', email: 'priya.sharma@gmail.com', role: 'Accountant', color: 'from-rose-500 to-orange-500' }
              ].map((profile) => {
                const isActive = user?.email === profile.email;
                return (
                  <DropdownMenuItem
                    key={profile.email}
                    onClick={() => {
                      if (isActive) return;
                      dispatch(login({ name: profile.name, email: profile.email, role: profile.role }));
                      toast.success(`Identity switched to ${profile.name} (${profile.role})`, {
                        icon: <Check className="h-4 w-4 text-emerald-500" />,
                      });
                    }}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-semibold' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${profile.color} text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm`}>
                      {profile.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 dark:text-gray-100 truncate leading-none">{profile.name}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{profile.role}</p>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
