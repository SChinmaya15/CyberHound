
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { CyberHoundMascot } from './constants';
import { apiClient } from './api/client'; 
import { getRoleFromToken, saveToken, saveUser, clearToken, isAuthenticated, isTenantAdmin, restoreSession, isSuperAdmin } from './services/authService';
import { EnterpriseShell } from './components/layout/EnterpriseShell';
import { Button } from './components/ui/Button';

const ScansList = lazy(() => import('./pages/scans'));
const Findings = lazy(() => import('./pages/insights'));
const TenantPage = lazy(() => import('./pages/tenants'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const SettingsPage = lazy(() => import('./pages/settings'));
const CreateScan = lazy(() => import('./pages/scans/CreateScan'));
const ScannedFiles = lazy(() => import('./pages/scans/ScannedFiles'));

const PageFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center text-slate-500 text-sm">
    Loading Application…
  </div>
);

const LazyPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageFallback />}>{children}</Suspense>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (!isSuperAdmin()) {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
};

const SettingsRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (!isSuperAdmin() && !isTenantAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const NonSuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (isSuperAdmin()) {
    return <Navigate to="/tenants" replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  return <EnterpriseShell onLogout={handleLogout}>{children}</EnterpriseShell>;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showCredentials, setShowCredentials] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Request for token using the API client
      const response = await apiClient.post('auth/login', {
        email: username,
        username,
        password
      });
      
      // Extract the token appropriately based on expected backend response type.
      const token = response?.token || response?.accessToken || response?.data?.token || response?.data?.accessToken || (typeof response === 'string' ? response : null);
      
      if (token) {
        // Save the token to session storage and sync with apiClient
        saveToken(token);

        const userProfile = response?.user || response?.data?.user || {
          id: 'guest',
          name: username,
          email: username.includes('@') ? username : `${username}@enterprise.com`,
          role: getRoleFromToken() || 'Admin',
          status: 'Active'
        };

        saveUser(userProfile);
        navigate(isSuperAdmin() ? '/tenants' : '/dashboard');
      } else {
        setError('Login failed: Token missing from response.');
        console.warn('Login returned successfully, but no token was found in the response body:', response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect or invalid credentials.');
      console.error('Login Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500 rounded-full opacity-10 pointer-events-none"></div>

        <div className="flex flex-col items-center text-center mb-10 relative z-10">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white mb-6 shadow-xl shadow-indigo-100">
            <CyberHoundMascot className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">CyberHound</h2>
          <p className="text-slate-500 mt-2">Intelligent PII Threat Detection</p>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400">Enterprise Access</span>
            </div>
          </div>
          {!showCredentials ? (
            <>
              <Button 
                type="button"
                fullWidth
                variant="primary"
                size="lg"
                onClick={() => setShowCredentials(true)}
              >
                Login with Credentials
              </Button>
              <Button 
                type="button"
                fullWidth
                variant="outline"
                size="lg"
                disabled
              >
                Full SSO Login (Coming Soon)
              </Button>
            </>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
              </div>
              
              {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}
              
              <div className="flex space-x-3 mt-4">
                <Button type="button" variant="outline" size="lg" className="w-1/3" onClick={() => setShowCredentials(false)}>
                Back
              </Button>
              <Button type="submit" fullWidth variant="primary" size="lg" disabled={isLoading} className="w-2/3">
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  // Restore any existing session token into apiClient on app startup
  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<NonSuperAdminRoute><AppLayout><LazyPage><Dashboard /></LazyPage></AppLayout></NonSuperAdminRoute>} />
        <Route path="/scans" element={<NonSuperAdminRoute><AppLayout><LazyPage><ScansList /></LazyPage></AppLayout></NonSuperAdminRoute>} />
        <Route path="/create-scan" element={<NonSuperAdminRoute><AppLayout><LazyPage><CreateScan /></LazyPage></AppLayout></NonSuperAdminRoute>} />
        <Route path="/edit-scan/:id" element={<NonSuperAdminRoute><AppLayout><LazyPage><CreateScan /></LazyPage></AppLayout></NonSuperAdminRoute>} />
        <Route path="/findings" element={<NonSuperAdminRoute><AppLayout><LazyPage><Findings /></LazyPage></AppLayout></NonSuperAdminRoute>} />
        <Route path="/scanned-files" element={<NonSuperAdminRoute><AppLayout><LazyPage><ScannedFiles /></LazyPage></AppLayout></NonSuperAdminRoute>} />
        <Route path="/tenants" element={<SuperAdminRoute><AppLayout><LazyPage><TenantPage /></LazyPage></AppLayout></SuperAdminRoute>} />
        <Route path="/settings" element={<SettingsRoute><AppLayout><LazyPage><SettingsPage /></LazyPage></AppLayout></SettingsRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
