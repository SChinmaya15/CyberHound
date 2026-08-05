
import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Activity,
  Search,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { COLORS } from '../../constants';
import { Card } from '../../components/ui/Card';
import { getDashboard } from '../../services/dashboardService';
import { getTenantIdFromToken } from '../../services/authService';
import { DashboardResponse } from '../../types';

const PIE_PALETTE = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.danger, COLORS.success];

const SEVERITY_STYLES: Record<string, string> = {
  high: 'bg-rose-500 text-white',
  medium: 'bg-amber-500 text-white',
  low: 'bg-emerald-500 text-white',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      fontSize={13}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${payload.percent}%`}
    </text>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <Card className="p-6 hover:shadow-md transition-all group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${color} text-white group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const tenantId = getTenantIdFromToken();
      const data = await getDashboard(tenantId);
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totals = dashboard?.totals;
  const chartData = dashboard?.chart.data ?? [];
  const breakdown = dashboard?.findings.breakdown ?? [];
  const findingsTotal = dashboard?.findings.total ?? 0;
  const insights = dashboard?.insights ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Operational Overview</h2>
          <p className="text-slate-500">Real-time threat landscape and scan status</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Export Report
          </button>
          <button
            onClick={() => loadDashboard()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 p-16 text-sm font-semibold text-slate-500">
          <Loader2 size={18} className="animate-spin text-indigo-600" />
          Loading dashboard
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Scans Created" value={totals?.totalScansCreated ?? 0} icon={Search} color="bg-indigo-600" />
            <StatCard title="Total Scans Executed" value={totals?.totalScansExecuted ?? 0} icon={Activity} color="bg-sky-500" />
            <StatCard title="PII Threats Detected" value={totals?.piiThreatsDetected ?? 0} icon={AlertTriangle} color="bg-amber-500" />
            <StatCard title="PII Threats Resolved" value={totals?.piiThreatsResolved ?? 0} icon={CheckCircle} color="bg-emerald-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-800">Scan Frequency & Threat Trends</h3>
                <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="scans" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorScans)" strokeWidth={3} />
                    <Area type="monotone" dataKey="threats" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorThreats)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-8">Findings Breakdown</h3>
              {breakdown.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-400">
                  No findings yet
                </div>
              ) : (
                <>
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdown}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                          label={renderCustomizedLabel}
                          labelLine={false}
                        >
                          {breakdown.map((_, idx) => (
                            <Cell key={idx} fill={PIE_PALETTE[idx % PIE_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium">TOTAL</p>
                        <p className="text-2xl font-bold text-slate-800">{findingsTotal}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    {breakdown.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_PALETTE[idx % PIE_PALETTE.length] }}></div>
                          <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles size={120} className="text-white" />
            </div>
            <div className="flex items-center space-x-2 text-indigo-300 mb-4">
              <Zap size={18} fill="currentColor" />
              <span className="text-sm font-bold uppercase tracking-wider">CyberHound Intelligence Insights</span>
            </div>
            {insights.length === 0 ? (
              <p className="relative z-10 text-sm text-indigo-200">No insights available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/10 hover:bg-white/15 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold">{insight.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        SEVERITY_STYLES[insight.severity?.toLowerCase()] ?? 'bg-slate-500 text-white'
                      }`}>{insight.severity}</span>
                    </div>
                    <p className="text-indigo-100 text-sm leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
