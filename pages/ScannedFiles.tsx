import React, { useState, useEffect } from 'react';
import { StorageSource, ScannedFile, BackendFileRecord } from '../types';
import { 
  File, 
  Database, 
  ExternalLink, 
  Search, 
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { getFileRecords } from '../services/scanService';

const SourceIcon: React.FC<{ source: StorageSource }> = ({ source }) => {
  switch (source) {
    case StorageSource.AWS_S3: return <Database size={16} className="text-orange-500" />;
    case StorageSource.GOOGLE_DRIVE: return <File size={16} className="text-blue-500" />;
    case StorageSource.ONEDRIVE: return <File size={16} className="text-sky-600" />;
    default: return <File size={16} className="text-slate-400" />;
  }
};

const getStorageSourceName = (source: StorageSource): string => {
  switch (source) {
    case StorageSource.GOOGLE_DRIVE:
      return 'Google Drive';
    case StorageSource.DROPBOX:
      return 'Dropbox';
    case StorageSource.ONEDRIVE:
      return 'Azure Blob';
    case StorageSource.AWS_S3:
      return 'AWS S3 Bucket';
    default:
      return 'Google Drive';
  }
};

const ScannedFiles: React.FC = () => {
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('All Sources');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');

  // Map backend file record model to frontend representation
  const mapBackendFileRecordToScannedFile = (bRecord: BackendFileRecord): ScannedFile => {
    const idStr = bRecord.id && typeof bRecord.id === 'object'
      ? `${bRecord.id.timestamp}-${bRecord.id.machine}-${bRecord.id.pid}-${bRecord.id.increment}`
      : (typeof bRecord.id === 'string' ? bRecord.id : Math.random().toString());

    // Map source using path prefix or source property
    let mappedSource = StorageSource.GOOGLE_DRIVE;
    if (bRecord.path && bRecord.path.toLowerCase().startsWith('s3:')) {
      mappedSource = StorageSource.AWS_S3;
    } else if (bRecord.source) {
      const srcLower = bRecord.source.toLowerCase();
      if (srcLower.includes('s3') || srcLower.includes('aws')) {
        mappedSource = StorageSource.AWS_S3;
      } else if (srcLower.includes('onedrive')) {
        mappedSource = StorageSource.ONEDRIVE;
      } else if (srcLower.includes('google') || srcLower.includes('drive')) {
        mappedSource = StorageSource.GOOGLE_DRIVE;
      }
    }

    // Format scan date nicely
    let dateStr = 'Never';
    if (bRecord.lastScanned) {
      try {
        const d = new Date(bRecord.lastScanned);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      } catch {
        dateStr = bRecord.lastScanned;
      }
    }

    return {
      id: idStr,
      name: bRecord.fileName || 'Untitled File',
      source: mappedSource,
      date: dateStr,
      piiFound: !!bRecord.hasPii,
      piiCount: bRecord.piiTypes ? bRecord.piiTypes.length : 0,
      status: bRecord.hasPii ? 'Alerted' : 'Clean'
    };
  };

  const fetchFiles = () => {
    setIsLoading(true);
    setError(null);
    getFileRecords()
      .then((data) => {
        const recordsArray = Array.isArray(data) ? data : [];
        const mapped = recordsArray.map(mapBackendFileRecordToScannedFile);
        setFiles(mapped);
      })
      .catch((err) => {
        console.error('Failed to load file records:', err);
        setError('Unable to load file scanning logs. Please check your connection or try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Filter file logs dynamically
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesSource = selectedSource === 'All Sources' || 
      (selectedSource === 'AWS S3' && file.source === StorageSource.AWS_S3) ||
      (selectedSource === 'Google Drive' && file.source === StorageSource.GOOGLE_DRIVE) ||
      (selectedSource === 'Dropbox' && file.source === StorageSource.DROPBOX) ||
      (selectedSource === 'Azure Blob' && file.source === StorageSource.ONEDRIVE);

    const matchesStatus = selectedStatus === 'All Statuses' ||
      (selectedStatus === 'Clean' && file.status === 'Clean') ||
      (selectedStatus === 'Alerted' && file.status === 'Alerted');

    return matchesSearch && matchesSource && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Scanned Files</h2>
          <p className="text-slate-500">Track and manage every file processed by the engine</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchFiles}
            className="p-2.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-100 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center"
            title="Refresh Scan Log"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            <span>Download Log</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-700 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} className="text-rose-500" />
            <div>
              <p className="text-sm font-bold">Error Loading File Log</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchFiles}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-50 flex flex-wrap gap-4 items-center bg-slate-50/50">
          <div className="flex-1 relative min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search filenames..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all" 
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Source:</span>
            <select 
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs font-bold text-slate-600 border border-slate-200 bg-white rounded-md py-1.5 px-3 focus:ring-0 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option>All Sources</option>
              <option>AWS S3</option>
              <option>Google Drive</option>
              <option>Dropbox</option>
              <option>Azure Blob</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-bold text-slate-600 border border-slate-200 bg-white rounded-md py-1.5 px-3 focus:ring-0 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Clean</option>
              <option>Alerted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20 border-b border-slate-50">
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Storage Source</th>
                <th className="px-6 py-4">Scan Date</th>
                <th className="px-6 py-4 text-center">PII Found</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-slate-100 rounded"></div>
                        <div className="h-4 bg-slate-100 rounded w-40"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-100 rounded w-24 mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-100 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredFiles.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-350">
                        <File size={40} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-base">No file logs found</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {searchText || selectedSource !== 'All Sources' || selectedStatus !== 'All Statuses'
                            ? "Try adjusting your filters or search keywords."
                            : "No processed file records are currently registered."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 rounded text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <File size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-slate-600 text-sm">
                        <SourceIcon source={file.source} />
                        <span>{getStorageSourceName(file.source)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{file.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        {file.piiFound ? (
                          <div className="flex items-center space-x-1.5 text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded text-xs font-bold border border-rose-100">
                            <AlertCircle size={14} />
                            <span>{file.piiCount} detected</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded text-xs font-bold border border-emerald-100">
                            <CheckCircle2 size={14} />
                            <span>Clean</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        file.status === 'Clean' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors ml-auto">
                        <ExternalLink size={14} />
                        <span>View details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination block */}
        {!isLoading && filteredFiles.length > 0 && (
          <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/20">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredFiles.length} of {files.length} files
            </p>
            <div className="flex space-x-1">
              <button disabled className="w-8 h-8 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm">1</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannedFiles;
