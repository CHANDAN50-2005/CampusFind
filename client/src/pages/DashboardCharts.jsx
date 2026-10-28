import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel } from '../components/UI.jsx';

const chartColors = ['#60a5fa', '#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#94a3b8'];

function monthLabel(value) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short' });
}

export function DashboardCharts({ monthly, categories }) {
  return <div className="mb-6 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
    <Panel title="Reports over time" description="Monthly lost and found reports from MongoDB aggregation.">
      <div className="h-72 p-4">
        {monthly.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><CartesianGrid stroke="#1e293b" vertical={false} /><XAxis dataKey="month" tickFormatter={monthLabel} stroke="#64748b" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} /><Bar dataKey="lost" name="Lost" fill="#60a5fa" radius={[5, 5, 0, 0]} /><Bar dataKey="found" name="Found" fill="#22d3ee" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-slate-500">No report trend data yet</div>}
      </div>
    </Panel>
    <Panel title="By category" description="Current report distribution.">
      <div className="h-72 p-4">
        {categories.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="count" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={3}>{categories.map((entry, index) => <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} /></PieChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-slate-500">No category data yet</div>}
      </div>
      {categories.length > 0 && <div className="flex flex-wrap gap-x-4 gap-y-2 px-5 pb-5">{categories.map((entry, index) => <span key={entry.category} className="inline-flex items-center gap-2 text-xs capitalize text-slate-400"><span className="size-2 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{entry.category} · {entry.count}</span>)}</div>}
    </Panel>
  </div>;
}
