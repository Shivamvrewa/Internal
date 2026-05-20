import { NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Receipt, 
  UserCog, 
  FileText, 
  Settings,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelHi: '' },
  { to: '/customers', icon: Users, label: 'Customers', labelHi: '' },
  { to: '/payments', icon: CreditCard, label: 'Payments', labelHi: '' },
  { to: '/accounting', icon: TrendingUp, label: 'Accounting', labelHi: '' },
  { to: '/expenses', icon: Receipt, label: 'Expenses', labelHi: '' },
  { to: '/staff', icon: UserCog, label: 'Staff', labelHi: '' },
  { to: '/reports', icon: FileText, label: 'Reports', labelHi: '' },
  { to: '/settings', icon: Settings, label: 'Settings', labelHi: '' },
];

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        <LayoutDashboard className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">BizManager</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400"> </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-xs opacity-70">{item.labelHi}</span>
                </div>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
              <p className="text-sm font-medium">Need Help?</p>
              <p className="text-xs opacity-90"> ?</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
