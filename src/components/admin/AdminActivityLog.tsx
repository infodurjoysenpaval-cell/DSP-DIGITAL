import React, { useState } from 'react';
import { Activity, Clock, ShieldCheck, Search, Filter } from 'lucide-react';
import { getActivityLogs, ActivityLogEntry } from '../../utils/financeStore';

export const AdminActivityLog: React.FC = () => {
  const [logs] = useState<ActivityLogEntry[]>(() => getActivityLogs());
  const [query, setQuery] = useState('');

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(query.toLowerCase()) ||
      l.module.toLowerCase().includes(query.toLowerCase()) ||
      l.user.toLowerCase().includes(query.toLowerCase()) ||
      l.details.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto antialiased">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Activity Log & Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time security logs, login audits, order dispatches, and catalog updates
          </p>
        </div>

        <div className="relative max-w-xs">
          <input
            type="text"
            placeholder="Search audit trail..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">ACTION</th>
              <th className="py-4 px-4">MODULE</th>
              <th className="py-4 px-4">PERFORMED BY</th>
              <th className="py-4 px-4">DETAILS</th>
              <th className="py-4 px-4">IP ADDRESS</th>
              <th className="py-4 pr-6 pl-4 text-right">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60">
                <td className="py-4 px-6 font-bold text-slate-900">{log.action}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                    {log.module}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-600">{log.user}</td>
                <td className="py-4 px-4 text-slate-500 max-w-sm">{log.details}</td>
                <td className="py-4 px-4 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                <td className="py-4 pr-6 pl-4 text-right text-slate-400 text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
