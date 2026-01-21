
import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Lock, 
  Plus, 
  Mail, 
  Trash2, 
  Shield, 
  Globe, 
  Save,
  CheckCircle2
} from 'lucide-react';

const users = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@enterprise.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Sarah Chen', email: 's.chen@enterprise.com', role: 'Operator', status: 'Active' },
  { id: '3', name: 'Michael Scott', email: 'mscott@dundermifflin.com', role: 'Viewer', status: 'Inactive' },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenant' | 'users'>('tenant');
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Manage tenant preferences and team access</p>
      </div>

      <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('tenant')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'tenant' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building size={16} />
          <span>Tenant Configuration</span>
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} />
          <span>User Management</span>
        </button>
      </div>

      {activeTab === 'tenant' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <Globe size={18} className="text-indigo-600" />
                  <span>General Preferences</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Enterprise Domain</label>
                    <input type="text" defaultValue="enterprise-shield.cloud" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Default Storage Region</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option>US-East (N. Virginia)</option>
                      <option>EU-Central (Frankfurt)</option>
                      <option>AP-South (Singapore)</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-8 border-t border-slate-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <Lock size={18} className="text-indigo-600" />
                  <span>Security & Vaulting</span>
                </h3>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-indigo-900">Tenant-Level Credentials</p>
                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    Allow scans to reuse shared credentials stored at the tenant level. This is more secure and easier to manage than providing keys per scan.
                  </p>
                </div>
                <div className="flex items-center space-x-2 p-4 border border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-slate-400">
                  <Plus size={20} />
                  <span className="text-sm font-medium">Add tenant-wide AWS Access Key</span>
                </div>
              </section>

              <div className="pt-6 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <Save size={18} />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h4 className="font-bold text-slate-800">Compliance Health</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">Your tenant is currently following all 12 SOC2-Type 2 automated PII discovery requirements.</p>
              <button className="text-xs font-bold text-indigo-600 border border-indigo-100 rounded-lg px-4 py-2 hover:bg-indigo-50 transition-all">Download Audit Report</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Manage Team Access</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all">
              <Plus size={16} />
              <span>Add Team Member</span>
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-2">
                      <Shield size={14} className="text-indigo-500" />
                      <span className="text-sm font-medium text-slate-600">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right space-x-2">
                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                      <Mail size={18} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSaved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="text-sm font-bold">Settings saved successfully</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
