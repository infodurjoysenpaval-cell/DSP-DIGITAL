import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, CheckCircle2, ShieldCheck, Ban } from 'lucide-react';
import { getIpBlocks, addIpBlock, removeIpBlock, IpBlockEntry } from '../../utils/financeStore';

export const AdminIpBlock: React.FC = () => {
  const [entries, setEntries] = useState<IpBlockEntry[]>(() => getIpBlocks());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'blocked' | 'whitelisted'>('blocked');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim()) return;

    const added = addIpBlock(ipAddress.trim(), reason.trim() || 'Manual IP Filter', status);
    setEntries([added, ...entries]);
    setIpAddress('');
    setReason('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    removeIpBlock(id);
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto antialiased">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>IP Blacklist & Whitelist Control</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Protect checkout and prevent malicious bots and fraud attempts
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add IP Rule</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">IP ADDRESS</th>
              <th className="py-4 px-4">STATUS</th>
              <th className="py-4 px-4">REASON / NOTE</th>
              <th className="py-4 px-4">ADDED BY</th>
              <th className="py-4 px-4">DATE</th>
              <th className="py-4 pr-6 pl-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {entries.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60">
                <td className="py-4 px-6 font-mono font-bold text-slate-900">{item.ipAddress}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      item.status === 'blocked'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-600">{item.reason}</td>
                <td className="py-4 px-4 text-slate-500">{item.blockedBy}</td>
                <td className="py-4 px-4 text-slate-400 text-[11px]">
                  {new Date(item.blockedAt).toLocaleDateString()}
                </td>
                <td className="py-4 pr-6 pl-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add IP Security Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  IP Address (IPv4 or IPv6) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.100"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rule Action</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="blocked">Block / Deny Checkout (Blacklist)</option>
                  <option value="whitelisted">Allow / Trusted Access (Whitelist)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Fraudulent TrxID submission attempt"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save IP Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
