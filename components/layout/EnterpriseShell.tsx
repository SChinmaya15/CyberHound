import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Files, ShieldAlert, Settings, LogOut, Menu, X, Bell, Search, User as UserIcon, Mail, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { CyberHoundMascot } from '../../constants';import { getUser } from '../../services/authService';
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scans', label: 'Scans', icon: List },
  { to: '/scanned-files', label: 'Files', icon: Files },
  { to: '/findings', label: 'Insights', icon: ShieldAlert },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface EnterpriseShellProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const SidebarItem: React.FC<{ to: string; label: string; icon: React.ElementType; active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${active ? 'bg-slate-900 text-white shadow-lg shadow-slate-200/10' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
  >
    <Icon size={18} className="transition-colors" />
    <span className="text-sm font-semibold">{label}</span>
  </Link>
);

export const EnterpriseShell: React.FC<EnterpriseShellProps> = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const user = getUser();
  const displayName = user?.name || 'Guest User';
  const displayEmail = user?.email || 'guest@enterprise.com';
  const displayRole = user?.role || 'ADMIN';

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="relative flex min-h-screen overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-slate-200 bg-white p-6 transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-slate-900 p-3 text-white">
                <CyberHoundMascot className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold">CyberHound</p>
                <p className="text-xs text-slate-400">Enterprise PII Shield</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-900">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={onLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col md:pl-72">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-3">
              <button className="md:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="relative hidden md:inline-flex">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search scans, findings, dashboards..."
                  className="w-72 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100">
                <Bell size={20} />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              <div className="relative" ref={profileRef}>
                <button
                  className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:border-slate-300 transition-all"
                  onClick={() => setProfileOpen((value) => !value)}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white font-semibold">GU</span>
                  <span className="hidden md:inline">{displayName}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
                    <div className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-600 text-base font-bold text-white">{displayName.charAt(0) || 'G'}</div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Official Partner</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 border-t border-slate-100 px-5 py-4">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Mail size={16} className="text-slate-400" />
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Email</p>
                            <p className="text-sm font-semibold text-slate-900">{displayEmail}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <ShieldAlert size={16} className="text-slate-400" />
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Role</p>
                            <p className="text-sm font-semibold text-slate-900">{displayRole}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 px-5 py-4">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                      >
                        <Key size={16} className="text-slate-500" />
                        Change Password
                      </button>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-all"
                      >
                        <LogOut size={16} className="text-rose-600" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
