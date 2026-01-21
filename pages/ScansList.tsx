
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Play, 
  Edit2, 
  Trash2, 
  Database, 
  Search, 
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Scan, ScanStatus, StorageSource } from '../types';

const mockScans: Scan[] = [
  { id: '1', name: 'Q4 Customer Data Scan', location: StorageSource.AWS_S3, frequency: 'Weekly', status: ScanStatus.COMPLETED, lastRun: '2024-05-14 14:30' },
  { id: '2', name: 'Finance Shared Drive Daily', location: StorageSource.ONEDRIVE, frequency: 'Daily', status: ScanStatus.IN_PROGRESS, lastRun: 'Running Now' },
  { id: '3', name: 'HR Folder Deep Scan', location: StorageSource.GOOGLE_DRIVE, frequency: 'Monthly', status: ScanStatus.FAILED, lastRun: '2024-05-12 09:15' },
  { id: '4', name: 'Draft Marketing Audit', location: StorageSource.AWS_S3, frequency: 'One-time', status: ScanStatus.DRAFT, lastRun: 'Never' },
];

const StatusBadge: React.FC<{ status: ScanStatus }> = ({ status }) => {
  const styles = {
    [ScanStatus.COMPLETED]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [ScanStatus.IN_PROGRESS]: 'bg-sky-50 text-sky-600 border-sky-100 animate-pulse',
    [ScanStatus.FAILED]: 'bg-rose-50 text-rose-600 border-rose-100',
    [ScanStatus.DRAFT]: 'bg-slate-50 text-slate-400 border-slate-100',
    [ScanStatus.PENDING]: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  
  const Icon = status === ScanStatus.COMPLETED ? CheckCircle2 : status === ScanStatus.FAILED ? AlertCircle : Clock;

  return (
    <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${styles[status]}`}>
      <Icon size={12} />
      <span>{status}</span>
    </div>
  );
};

const ScansList: React.FC = () => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleAction = (action: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (action === 'edit') {
      navigate(`/edit-scan/${id}`);
    } else if (action === 'launch') {
      alert(`Launching scan ${id}...`);
    } else if (action === 'delete') {
      alert(`Deleting scan ${id}...`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" onClick={() => setOpenMenuId(null)}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Scans List</h2>
          <p className="text-slate-500">Manage and monitor all your PII data detection tasks</p>
        </div>
        <button 
          onClick={() => navigate('/create-scan')}
          className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          <span>Create New Scan</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter scans by name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>Total: {mockScans.length} Scans</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-4">Scan Name</th>
                <th className="px-8 py-4">Storage Source</th>
                <th className="px-8 py-4">Frequency</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Last Run</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockScans.map(scan => (
                <tr 
                  key={scan.id} 
                  className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                  onClick={() => navigate(`/edit-scan/${scan.id}`)}
                >
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{scan.name}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2 text-slate-500 text-sm">
                      <Database size={14} className="text-slate-400" />
                      <span>{scan.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{scan.frequency}</span>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={scan.status} />
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400 tabular-nums">
                    {scan.lastRun}
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      onClick={(e) => toggleMenu(scan.id, e)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openMenuId === scan.id && (
                      <div className="absolute right-8 top-12 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={(e) => handleAction('launch', scan.id, e)}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center space-x-3 transition-colors"
                        >
                          <Play size={14} />
                          <span>Launch Now</span>
                        </button>
                        <button 
                          onClick={(e) => handleAction('edit', scan.id, e)}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-3 transition-colors"
                        >
                          <Edit2 size={14} />
                          <span>Edit Configuration</span>
                        </button>
                        <div className="h-px bg-slate-50"></div>
                        <button 
                          onClick={(e) => handleAction('delete', scan.id, e)}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 flex items-center space-x-3 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Delete Scan</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page 1 of 1</span>
          <div className="flex space-x-2">
            <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-300 text-xs font-bold cursor-not-allowed transition-all">Previous</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScansList;
