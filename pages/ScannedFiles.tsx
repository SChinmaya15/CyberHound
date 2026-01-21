
import React from 'react';
import { StorageSource } from '../types';
import { 
  File, 
  Database, 
  ExternalLink, 
  Filter, 
  Search, 
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const scannedFiles = [
  { id: '1', name: 'user_database_export.csv', source: StorageSource.AWS_S3, date: '2024-05-14', piiFound: true, piiCount: 42, status: 'Alerted' },
  { id: '2', name: 'corporate_strategy_2024.pdf', source: StorageSource.GOOGLE_DRIVE, date: '2024-05-14', piiFound: false, piiCount: 0, status: 'Clean' },
  { id: '3', name: 'customer_support_logs.xlsx', source: StorageSource.ONEDRIVE, date: '2024-05-13', piiFound: true, piiCount: 5, status: 'Alerted' },
  { id: '4', name: 'financial_reconciliation.csv', source: StorageSource.AWS_S3, date: '2024-05-12', piiFound: true, piiCount: 156, status: 'Quarantined' },
  { id: '5', name: 'employee_contracts.docx', source: StorageSource.GOOGLE_DRIVE, date: '2024-05-11', piiFound: true, piiCount: 12, status: 'Alerted' },
  { id: '6', name: 'public_assets_library.json', source: StorageSource.AWS_S3, date: '2024-05-11', piiFound: false, piiCount: 0, status: 'Clean' },
];

const SourceIcon: React.FC<{ source: StorageSource }> = ({ source }) => {
  switch (source) {
    case StorageSource.AWS_S3: return <Database size={16} className="text-orange-500" />;
    case StorageSource.GOOGLE_DRIVE: return <File size={16} className="text-blue-500" />;
    case StorageSource.ONEDRIVE: return <File size={16} className="text-sky-600" />;
    default: return <File size={16} className="text-slate-400" />;
  }
};

const ScannedFiles: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Scanned Files</h2>
          <p className="text-slate-500">Track and manage every file processed by the engine</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Download size={16} />
            <span>Download Log</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-50 flex flex-wrap gap-4 items-center">
          <div className="flex-1 relative min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search filenames..." className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Source:</span>
            <select className="text-xs font-bold text-slate-600 border-none bg-slate-50 rounded-md py-1.5 px-3 focus:ring-0">
              <option>All Sources</option>
              <option>AWS S3</option>
              <option>Google Drive</option>
              <option>OneDrive</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            <select className="text-xs font-bold text-slate-600 border-none bg-slate-50 rounded-md py-1.5 px-3 focus:ring-0">
              <option>All Statuses</option>
              <option>Clean</option>
              <option>Alerted</option>
              <option>Quarantined</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Storage Source</th>
                <th className="px-6 py-4">Scan Date</th>
                <th className="px-6 py-4 text-center">PII Found</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {scannedFiles.map(file => (
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
                      <span>{file.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{file.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      {file.piiFound ? (
                        <div className="flex items-center space-x-1.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs font-bold border border-rose-100">
                          <AlertCircle size={14} />
                          <span>{file.piiCount} detected</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold border border-emerald-100">
                          <CheckCircle2 size={14} />
                          <span>Clean</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      file.status === 'Clean' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                      file.status === 'Quarantined' ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-100' :
                      'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      <ExternalLink size={14} />
                      <span>View details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-50 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing 1-6 of 2,492 files</p>
          <div className="flex space-x-1">
            {[1, 2, 3, '...', 42].map((n, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                n === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-100'
              }`}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannedFiles;
