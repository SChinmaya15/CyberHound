
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  ShieldAlert, 
  Files, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  User as UserIcon,
  ChevronRight,
  List
} from 'lucide-react';
import { CyberHoundMascot } from './constants';
import Dashboard from './pages/Dashboard';
import CreateScan from './pages/CreateScan';
import ScansList from './pages/ScansList';
import Findings from './pages/Findings';
import ScannedFiles from './pages/ScannedFiles';
import SettingsPage from './pages/Settings';

const SidebarItem: React.FC<{ to: string; icon: React.ElementType; label: string; active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </Link>
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {!sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 h-full w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <CyberHoundMascot className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">CyberHound</h1>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem 
              to="/dashboard" 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={location.pathname === '/dashboard'} 
            />
            <SidebarItem 
              to="/scans" 
              icon={List} 
              label="Scans List" 
              active={location.pathname === '/scans'} 
            />
            <SidebarItem 
              to="/findings" 
              icon={ShieldAlert} 
              label="PII Findings" 
              active={location.pathname === '/findings'} 
            />
            <SidebarItem 
              to="/scanned-files" 
              icon={Files} 
              label="Scanned Files" 
              active={location.pathname === '/scanned-files'} 
            />
            <SidebarItem 
              to="/settings" 
              icon={Settings} 
              label="Settings" 
              active={location.pathname === '/settings'} 
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors rounded-lg">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <button 
            className="md:hidden text-slate-500" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 hidden md:block">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search scans, findings..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-indigo-100 transition-colors">
                <UserIcon size={18} />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-700 leading-none">Guest User</p>
                <p className="text-xs text-slate-400 mt-1">Enterprise Admin</p>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </section>
      </main>
    </div>
  );
};

const Login: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full opacity-10"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500 rounded-full opacity-10"></div>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white mb-6 shadow-xl shadow-indigo-100">
            <CyberHoundMascot className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">CyberHound</h2>
          <p className="text-slate-500 mt-2">Intelligent PII Threat Detection</p>
        </div>

        <div className="space-y-4">
          <Link 
            to="/dashboard" 
            className="block w-full bg-indigo-600 text-white text-center py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200"
          >
            Enter as Guest
          </Link>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400">Enterprise Access</span>
            </div>
          </div>
          <button disabled className="w-full bg-slate-50 text-slate-400 py-4 rounded-xl font-bold cursor-not-allowed border border-slate-100">
            Full SSO Login (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/scans" element={<AppLayout><ScansList /></AppLayout>} />
        <Route path="/create-scan" element={<AppLayout><CreateScan /></AppLayout>} />
        <Route path="/edit-scan/:id" element={<AppLayout><CreateScan /></AppLayout>} />
        <Route path="/findings" element={<AppLayout><Findings /></AppLayout>} />
        <Route path="/scanned-files" element={<AppLayout><ScannedFiles /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
