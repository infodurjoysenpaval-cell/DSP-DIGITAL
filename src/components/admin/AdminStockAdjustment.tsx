import React, { useState } from 'react';
import { PieChart, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { getLiveProducts, updateLiveProduct } from '../../utils/adminStore';
import { getStockAdjustments, addStockAdjustment, StockAdjustmentEntry } from '../../utils/financeStore';

export const AdminStockAdjustment: React.FC = () => {
  const [entries, setEntries] = useState<StockAdjustmentEntry[]>(() => getStockAdjustments());
  const products = getLiveProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?._id || '');
  const [adjType, setAdjType] = useState<'addition' | 'subtraction'>('addition');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('Restocked genuine license inventory');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    const prod = products.find((p) => p._id === selectedProdId);
    if (!prod) return;

    const newStock =
      adjType === 'addition'
        ? (prod.stock || 0) + qty
        : Math.max(0, (prod.stock || 0) - qty);

    updateLiveProduct(prod._id, { stock: newStock });

    const newEntry = addStockAdjustment({
      productId: prod._id,
      productName: prod.name,
      type: adjType,
      quantity: qty,
      reason,
      adjustedBy: 'Super Admin',
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
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>Stock Adjustment</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manually update or audit digital license stock levels
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Adjustment</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">PRODUCT</th>
              <th className="py-4 px-4">TYPE</th>
              <th className="py-4 px-4">QTY</th>
              <th className="py-4 px-4">REASON</th>
              <th className="py-4 px-4">ADJUSTED BY</th>
              <th className="py-4 pr-6 pl-4 text-right">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No stock adjustment logs found.
                </td>
              </tr>
            ) : (
              entries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-4 px-6 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                        item.type === 'addition'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold">{item.quantity}</td>
                  <td className="py-4 px-4 text-slate-500">{item.reason}</td>
                  <td className="py-4 px-4">{item.adjustedBy}</td>
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
            <h3 className="text-base font-bold text-slate-900">Adjust Product Stock</h3>
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
                      {p.name} (Current Stock: {p.stock ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="addition">Addition (+)</option>
                    <option value="subtraction">Subtraction (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
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
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
