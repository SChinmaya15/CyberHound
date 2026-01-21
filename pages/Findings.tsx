
import React from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight, 
  MoreHorizontal,
  Mail,
  CreditCard,
  User,
  Phone
} from 'lucide-react';
import { PIILevel } from '../types';

const findingsData = [
  { id: '1', type: 'Email Address', count: 154, severity: PIILevel.LOW, status: 'Detected', lastSeen: '2024-05-12', icon: Mail },
  { id: '2', type: 'Credit Card Number', count: 42, severity: PIILevel.CRITICAL, status: 'In-Progress', lastSeen: '2024-05-13', icon: CreditCard },
  { id: '3', type: 'Social Security Number', count: 12, severity: PIILevel.CRITICAL, status: 'Detected', lastSeen: '2024-05-14', icon: User },
  { id: '4', type: 'Phone Number', count: 89, severity: PIILevel.MEDIUM, status: 'Resolved', lastSeen: '2024-05-10', icon: Phone },
  { id: '5', type: 'Full Name', count: 210, severity: PIILevel.LOW, status: 'Detected', lastSeen: '2024-05-14', icon: User },
];

const SeverityBadge: React.FC<{ level: PIILevel }> = ({ level }) => {
  const styles = {
    [PIILevel.CRITICAL]: 'bg-rose-100 text-rose-700 border-rose-200',
    [PIILevel.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
    [PIILevel.MEDIUM]: 'bg-amber-100 text-amber-700 border-amber-200',
    [PIILevel.LOW]: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[level]}`}>{level}</span>;
};

const Findings: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">PII Findings</h2>
          <p className="text-slate-500">Inventory of all sensitive data elements discovered</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search finding..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical Threats', val: 54, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Unresolved', val: 32, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'New This Week', val: 12, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Files Affected', val: 1542, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} p-4 rounded-xl border border-slate-100`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <p className={`text-2xl font-black ${kpi.color} mt-1`}>{kpi.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">PII Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Count</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Severity</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Last Detected</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {findingsData.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <item.icon size={18} />
                    </div>
                    <span className="font-semibold text-slate-700">{item.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 tabular-nums">{item.count.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <SeverityBadge level={item.severity} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'Resolved' ? 'bg-emerald-500' : item.status === 'In-Progress' ? 'bg-sky-500' : 'bg-amber-500'
                    }`}></div>
                    <span className="text-sm font-medium text-slate-600">{item.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-400 font-medium">{item.lastSeen}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Findings;
