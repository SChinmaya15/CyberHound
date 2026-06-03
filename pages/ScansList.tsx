import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Play, 
  Edit2, 
  Trash2, 
  Database, 
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Scan, ScanStatus, StorageSource, BackendScan } from '../types';
import { getScanList, runScan } from '../services/scanService';

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
    <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      <Icon size={12} />
      <span>{status}</span>
    </div>
  );
};

const ScansList: React.FC = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [frequencyFilter, setFrequencyFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    variant?: 'default' | 'danger';
  } | null>(null);

  // Helper to map backend scans to frontend representation
  const mapBackendScanToScan = (bScan: BackendScan): Scan => {
    const idStr = bScan.id && typeof bScan.id === 'object'
      ? `${bScan.id.timestamp}-${bScan.id.machine}-${bScan.id.pid}-${bScan.id.increment}`
      : (typeof bScan.id === 'string' ? bScan.id : Math.random().toString());

    // Map location number to string
    let locationString = 'Google Drive';
    switch (bScan.location) {
      case 0:
        locationString = 'Google Drive';
        break;
      case 1:
        locationString = 'Dropbox';
        break;
      case 2:
        locationString = 'Azure Blob';
        break;
      case 3:
        locationString = 'AWS S3 Bucket';
        break;
      default:
        locationString = 'Google Drive';
    }

    // Map frequency number to frequency string
    let frequencyString: 'One-time' | 'Daily' | 'Weekly' | 'Monthly' = 'Weekly';
    switch (bScan.frequency) {
      case 0:
        frequencyString = 'Daily';
        break;
      case 1:
        frequencyString = 'Weekly';
        break;
      case 2:
        frequencyString = 'Monthly';
        break;
    }

    // Map status string or null to ScanStatus enum
    let statusMapped = ScanStatus.DRAFT;
    if (bScan.status) {
      const norm = bScan.status.toLowerCase();
      if (norm.includes('complete')) {
        statusMapped = ScanStatus.COMPLETED;
      } else if (norm.includes('progress') || norm.includes('running')) {
        statusMapped = ScanStatus.IN_PROGRESS;
      } else if (norm.includes('fail')) {
        statusMapped = ScanStatus.FAILED;
      } else if (norm.includes('pend')) {
        statusMapped = ScanStatus.PENDING;
      }
    }

    // Map lastRun date string or null
    let lastRunString = 'Never';
    if (bScan.lastRun) {
      try {
        const d = new Date(bScan.lastRun);
        if (!isNaN(d.getTime())) {
          const pad = (n: number) => String(n).padStart(2, '0');
          lastRunString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } else {
          lastRunString = bScan.lastRun;
        }
      } catch {
        lastRunString = bScan.lastRun;
      }
    }

    return {
      id: idStr,
      name: bScan.name || 'Untitled Scan',
      location: locationString as any,
      frequency: frequencyString,
      status: statusMapped,
      lastRun: lastRunString
    };
  };

  const fetchScans = () => {
    setIsLoading(true);
    setError(null);
    getScanList()
      .then((data) => {
        const scansArray = Array.isArray(data) ? data : [];
        const mapped = scansArray.map(mapBackendScanToScan);
        setScans(mapped);
      })
      .catch((err) => {
        console.error('Failed to load scans:', err);
        setError('Unable to load scan configurations. Please check if the local service is running.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchScans();
  }, []);

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
      runScan(id)
        .then(() => {
          setModalState({
            title: 'Scan launched',
            message: 'Scan launched successfully.',
            confirmLabel: 'OK',
            onConfirm: () => {
              setModalState(null);
              fetchScans();
            },
          });
        })
        .catch(err => {
          console.error('Failed to launch scan:', err);
          setModalState({
            title: 'Launch failed',
            message: 'Failed to launch scan. Please check if the service is running.',
            confirmLabel: 'OK',
            variant: 'danger',
          });
        });
    } else if (action === 'delete') {
      setModalState({
        title: 'Delete scan',
        message: `Are you sure you want to delete scan ${id}?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'danger',
        onConfirm: () => {
          setModalState({
            title: 'Delete requested',
            message: `Scan ${id} deletion requested. This feature will be implemented soon.`,
            confirmLabel: 'OK',
          });
        },
      });
    }
  };

  const statusLabel = (status: ScanStatus) => {
    switch (status) {
      case ScanStatus.COMPLETED:
        return 'Completed';
      case ScanStatus.IN_PROGRESS:
        return 'In Progress';
      case ScanStatus.FAILED:
        return 'Failed';
      case ScanStatus.PENDING:
        return 'Pending';
      default:
        return 'Draft';
    }
  };

  const filteredScans = scans.filter((scan) => {
    const statusMatches = statusFilter === 'All' || statusLabel(scan.status) === statusFilter;
    const frequencyMatches = frequencyFilter === 'All' || scan.frequency === frequencyFilter;
    return statusMatches && frequencyMatches;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Scans List</h2>
          <p className="text-slate-500">Manage and monitor all your PII data detection tasks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <span className="text-slate-500 text-sm">Review recent scans or start a new compliance workflow.</span>
          <Button variant="outline" size="sm" className="rounded-2xl gap-2" onClick={fetchScans}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md" className="rounded-2xl gap-2" onClick={() => navigate('/create-scan')}>
            <Plus size={16} />
            Create New Scan
          </Button>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-700 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} className="text-rose-500" />
            <div>
              <p className="text-sm font-bold">Error Loading Scans</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchScans}
            className="px-4 py-2 bg-rose-650 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,_280px)_minmax(200px,_280px)] w-full">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option>All</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Failed</option>
                <option>Draft</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Frequency</label>
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option>All</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <span className="text-slate-500 text-sm font-semibold">{isLoading ? 'Loading scans...' : `Showing ${filteredScans.length} of ${scans.length} scans`}</span>
            <div className="hidden md:block border-l border-slate-200 h-8"></div>
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
              {isLoading ? (
                // Premium Skeleton Loader Rows
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-slate-50">
                    <td className="px-8 py-5">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-6 bg-slate-100 rounded-full w-20"></div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-slate-100 rounded-md w-24"></div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredScans.length === 0 ? (
                // Beautiful Empty State
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-350">
                        <Database size={40} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-base">No scans found</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {filterText 
                            ? "We couldn't find any scans matching your filter query." 
                            : "Get started by creating a compliance scan targeting your data sources."}
                        </p>
                      </div>
                      {!filterText && (
                        <button 
                          onClick={() => navigate('/create-scan')}
                          className="mt-2 px-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-xl transition-all"
                        >
                          Configure First Scan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredScans.map(scan => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info (Premium layout) */}
        {!isLoading && filteredScans.length > 0 && (
          <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page 1 of 1</span>
            <div className="flex space-x-2">
              <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-300 text-xs font-bold cursor-not-allowed transition-all">Previous</button>
              <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-300 text-xs font-bold cursor-not-allowed transition-all">Next</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScansList;
