import React, { useState } from 'react';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { getLiveProducts } from '../../utils/adminStore';
import { getDamageEntries, addDamageEntry, DamageEntry } from '../../utils/financeStore';

export const AdminDamage: React.FC = () => {
  const [entries, setEntries] = useState<DamageEntry[]>(() => getDamageEntries());
  const products = getLiveProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?._id || '');
  const [qty, setQty] = useState('1');
  const [loss, setLoss] = useState('500');
  const [reason, setReason] = useState('Expired test subscription / Invalid supplier key');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p._id === selectedProdId);
    if (!prod) return;

    const newEntry = addDamageEntry({
      productId: prod._id,
      productName: prod.name,
      quantity: parseInt(qty, 10) || 1,
      lossAmount: parseFloat(loss) || 0,
      reason,
      date: new Date().toISOString().split('T')[0],
    });

    setEntries([newEntry, ...entries]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto antialiased">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Damage & Loss Records</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track expired licenses, revoked keys, or supplier return losses
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Loss</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">PRODUCT</th>
              <th className="py-4 px-4">QTY</th>
              <th className="py-4 px-4">LOSS AMOUNT</th>
              <th className="py-4 px-4">REASON</th>
              <th className="py-4 pr-6 pl-4 text-right">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No damage or revoked license records found.
                </td>
              </tr>
            ) : (
              entries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-4 px-6 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-4 px-4 font-bold">{item.quantity}</td>
                  <td className="py-4 px-4 font-bold text-rose-600">-৳{item.lossAmount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-slate-500">{item.reason}</td>
                  <td className="py-4 pr-6 pl-4 text-right text-slate-400">{item.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Record Damage / Loss</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loss Amount (৳)</label>
                  <input
                    type="number"
                    value={loss}
                    onChange={(e) => setLoss(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
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
                  Save Loss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
