import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  CreditCard,
  User,
  Phone,
  RefreshCw,
  FileText,
  AlertCircle,
  Database,
  Laptop,
  Layers,
  ChevronRight,
  ChevronLeft,
  Download,
  Calendar,
  Lock,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { get } from '../../services/authService';

interface FindingRecord {
  id: string;
  scanId: string;
  machineName: string;
  source: string;
  filePath: string;
  entity: string;
  isDetected: boolean;
  details: string;
  lastUpdatedUtc: string;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center"
      title="Copy ID"
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
    </button>
  );
};

const getEntityIcon = (entity: string) => {
  switch (entity?.toLowerCase()) {
    case 'email':
      return Mail;
    case 'pan':
      return CreditCard;
    case 'aadhaar':
      return User;
    case 'phone':
    case 'phonenumber':
      return Phone;
    default:
      return FileText;
  }
};

const getEntityBadgeColor = (entity: string) => {
  switch (entity?.toLowerCase()) {
    case 'email':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'pan':
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    case 'aadhaar':
      return 'bg-violet-50 text-violet-700 border-violet-100';
    case 'phone':
    case 'phonenumber':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-100';
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const Findings: React.FC = () => {
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('All Entities');
  const [selectedSource, setSelectedSource] = useState<string>('All Sources');
  const [selectedMachine, setSelectedMachine] = useState<string>('All Machines');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Sorting state
  const [sortBy, setSortBy] = useState<'filePath' | 'entity' | 'lastUpdatedUtc'>('lastUpdatedUtc');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchFindings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from FileRecord with a fallback to Filerecord
      let data: FindingRecord[];
      try {
        data = await get<FindingRecord[]>('FileRecord');
      } catch (firstErr) {
        console.warn('GET /FileRecord failed, trying /Filerecord...', firstErr);
        data = await get<FindingRecord[]>('Filerecord');
      }
      setFindings(data || []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Failed to load findings:', err);
      setError(err?.message || 'Unable to load threat findings. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, []);

  // Extract unique filters from the raw data
  const uniqueEntities = ['All Entities', ...Array.from(new Set(findings.map(f => f.entity).filter(Boolean)))];
  const uniqueSources = ['All Sources', ...Array.from(new Set(findings.map(f => f.source).filter(Boolean)))];
  const uniqueMachines = ['All Machines', ...Array.from(new Set(findings.map(f => f.machineName).filter(Boolean)))];

  // Filtering and searching logic
  const filteredFindings = findings.filter(finding => {
    const matchesSearch = 
      (finding.filePath?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (finding.details?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (finding.entity?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (finding.machineName?.toLowerCase() || '').includes(searchText.toLowerCase());

    const matchesEntity = selectedEntity === 'All Entities' || finding.entity === selectedEntity;
    const matchesSource = selectedSource === 'All Sources' || finding.source === selectedSource;
    const matchesMachine = selectedMachine === 'All Machines' || finding.machineName === selectedMachine;

    return matchesSearch && matchesEntity && matchesSource && matchesMachine;
  });

  // Sorting logic
  const sortedFindings = [...filteredFindings].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    
    if (sortBy === 'lastUpdatedUtc') {
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    }
    
    return sortOrder === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Pagination logic
  const totalItems = sortedFindings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedFindings = sortedFindings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: 'filePath' | 'entity' | 'lastUpdatedUtc') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // KPI calculations
  const totalFindingsCount = findings.length;
  const uniqueFilesCount = new Set(findings.map(f => f.filePath)).size;
  const criticalThreatsCount = findings.filter(f => ['pan', 'aadhaar', 'ssn', 'creditcard', 'credit card'].includes(f.entity?.toLowerCase())).length;
  const uniqueMachinesCount = new Set(findings.map(f => f.machineName)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sensitive Data Findings</h2>
          <p className="text-slate-500">Live list of discovered PII and compliance threat matches</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchFindings}
            className="p-2.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-100 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center"
            title="Refresh findings"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
          </button>
          <button 
            onClick={() => {
              const headers = ['Scan ID', 'Machine Name', 'Source', 'File Path', 'Entity', 'Details', 'Last Updated'];
              const csvContent = [
                headers.join(','),
                ...findings.map(f => [
                  `"${f.scanId}"`,
                  `"${f.machineName}"`,
                  `"${f.source}"`,
                  `"${f.filePath}"`,
                  `"${f.entity}"`,
                  `"${f.details.replace(/"/g, '""')}"`,
                  `"${f.lastUpdatedUtc}"`
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `CyberHound_PII_Findings_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
            disabled={findings.length === 0}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Findings', val: totalFindingsCount, desc: 'Individual matches', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { label: 'Affected Files', val: uniqueFilesCount, desc: 'Distinct paths matching PII', color: 'text-rose-600', bg: 'bg-rose-50/50' },
          { label: 'High Priority Threats', val: criticalThreatsCount, desc: 'SSN / PAN / Aadhaar matches', color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { label: 'Active Endpoints', val: uniqueMachinesCount, desc: 'Distinct machines scanned', color: 'text-slate-600', bg: 'bg-slate-50/55' },
        ].map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} p-5 rounded-2xl border border-slate-100/60 shadow-sm flex flex-col justify-between`}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
              <p className={`text-3xl font-black ${kpi.color} mt-1.5`}>
                {isLoading ? (
                  <span className="inline-block h-8 w-12 bg-slate-200/60 rounded animate-pulse"></span>
                ) : (
                  kpi.val
                )}
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-700 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} className="text-rose-500" />
            <div>
              <p className="text-sm font-bold">Failed to load findings</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchFindings}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-slate-50 flex flex-wrap gap-4 items-center bg-slate-50/30">
          <div className="flex-1 relative min-w-[240px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search findings (file, details, machine, entity)..." 
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all" 
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Entity:</span>
              <select 
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
              >
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Source:</span>
              <select 
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
              >
                {uniqueSources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Machine:</span>
              <select 
                value={selectedMachine}
                onChange={(e) => {
                  setSelectedMachine(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
              >
                {uniqueMachines.map(mach => (
                  <option key={mach} value={mach}>{mach}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20 border-b border-slate-100">
                <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('filePath')}>
                  <div className="flex items-center space-x-1.5">
                    <span>File Path</span>
                    {sortBy === 'filePath' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('entity')}>
                  <div className="flex items-center space-x-1.5">
                    <span>Entity Type</span>
                    {sortBy === 'entity' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Machine Name</th>
                <th className="px-6 py-4">Scan ID</th>
                <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('lastUpdatedUtc')}>
                  <div className="flex items-center space-x-1.5">
                    <span>Last Updated</span>
                    {sortBy === 'lastUpdatedUtc' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-slate-50">
                    <td className="px-6 py-4.5">
                      <div className="h-4 bg-slate-100 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-5 bg-slate-100 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 bg-slate-100 rounded w-64"></div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 bg-slate-100 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 bg-slate-100 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 bg-slate-100 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 bg-slate-100 rounded w-28"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedFindings.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                        <ShieldAlert size={40} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-base">No sensitive findings found</p>
                        <p className="text-sm text-slate-400 mt-1.5">
                          {searchText || selectedEntity !== 'All Entities' || selectedSource !== 'All Sources' || selectedMachine !== 'All Machines'
                            ? "Try adjusting your search criteria or active filters."
                            : "No PII elements have been flagged by active scans yet."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedFindings.map(finding => {
                  const EntityIcon = getEntityIcon(finding.entity);
                  
                  return (
                    <tr key={finding.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* File Path */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 whitespace-nowrap block" title={finding.filePath}>
                          {finding.filePath}
                        </span>
                      </td>

                      {/* Entity Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 whitespace-nowrap">
                          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-bold ${getEntityBadgeColor(finding.entity)}`}>
                            <EntityIcon size={12} />
                            <span>{finding.entity}</span>
                          </span>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium whitespace-nowrap block" title={finding.details}>
                          {finding.details}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50 whitespace-nowrap">
                          {finding.source}
                        </span>
                      </td>

                      {/* Machine Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-slate-600 text-sm whitespace-nowrap">
                          <Laptop size={14} className="text-slate-400" />
                          <span className="font-semibold text-xs">{finding.machineName}</span>
                        </div>
                      </td>

                      {/* Scan ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 whitespace-nowrap">
                          <span className="text-xs text-slate-500 font-medium font-mono" title={finding.scanId}>
                            {finding.scanId || 'N/A'}
                          </span>
                          {finding.scanId && <CopyButton text={finding.scanId} />}
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{formatDate(finding.lastUpdatedUtc)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!isLoading && totalItems > 0 && (
          <div className="p-5 border-t border-slate-50 flex justify-between items-center bg-slate-50/15">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} entries
            </p>
            {totalPages > 1 && (
              <div className="flex space-x-1.5 items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Findings;
