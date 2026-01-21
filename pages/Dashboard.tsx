
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Activity, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { COLORS } from '../constants';
import { getSecurityInsights } from '../services/geminiService';

const scanHistoryData = [
  { name: 'Mon', scans: 12, threats: 2 },
  { name: 'Tue', scans: 19, threats: 4 },
  { name: 'Wed', scans: 15, threats: 1 },
  { name: 'Thu', scans: 22, threats: 7 },
  { name: 'Fri', scans: 30, threats: 3 },
  { name: 'Sat', scans: 10, threats: 0 },
  { name: 'Sun', scans: 14, threats: 1 },
];

const piiTypeData = [
  { name: 'Emails', value: 45 },
  { name: 'SSNs', value: 15 },
  { name: 'Credit Cards', value: 25 },
  { name: 'Phone Nos', value: 15 },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; change: string; icon: any; color: string }> = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        <div className="flex items-center mt-2">
          <TrendingUp size={16} className="text-emerald-500 mr-1" />
          <span className="text-emerald-500 text-xs font-semibold">{change}</span>
          <span className="text-slate-400 text-xs ml-1 font-medium">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const res = await getSecurityInsights("45 emails, 15 SSNs, 25 credit cards, critical data leakage in S3");
      setInsights(res);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, []);

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
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
            Generate Insights
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Scans Created" value="1,248" change="+12%" icon={Search} color="bg-indigo-600" />
        <StatCard title="Total Scans Executed" value="8,492" change="+18%" icon={Activity} color="bg-sky-500" />
        <StatCard title="PII Threats Detected" value="412" change="+4%" icon={AlertTriangle} color="bg-amber-500" />
        <StatCard title="PII Threats Resolved" value="389" change="+24%" icon={CheckCircle} color="bg-emerald-500" />
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
              <AreaChart data={scanHistoryData}>
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
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={piiTypeData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  <Cell fill={COLORS.primary} />
                  <Cell fill={COLORS.secondary} />
                  <Cell fill={COLORS.warning} />
                  <Cell fill={COLORS.danger} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">TOTAL</p>
                <p className="text-2xl font-bold text-slate-800">412</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {piiTypeData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: Object.values(COLORS)[idx % 4] }}></div>
                  <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-indigo-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles size={120} className="text-white" />
        </div>
        <div className="flex items-center space-x-2 text-indigo-300 mb-4">
          <Zap size={18} fill="currentColor" />
          <span className="text-sm font-bold uppercase tracking-wider">CyberHound Intelligence Insights</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {loadingInsights ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white/10 animate-pulse h-32 rounded-xl"></div>
            ))
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/10 hover:bg-white/15 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-bold">{insight.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    insight.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}>{insight.priority}</span>
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed">{insight.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
