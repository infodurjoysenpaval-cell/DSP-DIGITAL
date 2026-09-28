import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  CreditCard,
  Tag,
  Trash2,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  IncomeEntry,
  IncomeCategory,
  getIncomeEntries,
  getIncomeCategories,
  addIncomeEntry,
  deleteIncomeEntry,
  addIncomeCategory,
  deleteIncomeCategory,
} from '../../utils/financeStore';

interface AdminIncomeProps {
  initialSubTab?: 'all' | 'add' | 'categories' | 'add-category';
}

export const AdminIncome: React.FC<AdminIncomeProps> = ({ initialSubTab = 'all' }) => {
  const [subTab, setSubTab] = useState<'all' | 'add' | 'categories' | 'add-category'>(initialSubTab);
  const [incomeList, setIncomeList] = useState<IncomeEntry[]>(() => getIncomeEntries());
  const [categories, setCategories] = useState<IncomeCategory[]>(() => getIncomeCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  // Form State: Add Income
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeCatId, setIncomeCatId] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeMethod, setIncomeMethod] = useState('bKash Merchant');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeRef, setIncomeRef] = useState('');
  const [addMsg, setAddMsg] = useState<string | null>(null);

  // Form State: Add Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catMsg, setCatMsg] = useState<string | null>(null);

  // Totals
  const totalIncome = useMemo(
    () => incomeList.reduce((acc, item) => acc + (item.amount || 0), 0),
    [incomeList]
  );

  const filteredIncome = useMemo(() => {
    return incomeList.filter((item) => {
      if (selectedCatFilter !== 'all' && item.categoryId !== selectedCatFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q) ||
          item.paymentMethod.toLowerCase().includes(q) ||
          item.referenceNo?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incomeList, selectedCatFilter, searchQuery]);

  // Handle Add Income
  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incomeAmount);
    if (!incomeTitle.trim() || isNaN(amt) || amt <= 0) return;

    const matchedCat = categories.find((c) => c.id === incomeCatId) || categories[0];

    const added = addIncomeEntry({
      title: incomeTitle.trim(),
      categoryId: matchedCat?.id || 'cat-general',
      categoryName: matchedCat?.name || 'General Revenue',
      amount: amt,
      paymentMethod: incomeMethod,
      date: incomeDate,
      description: incomeDesc.trim() || undefined,
      referenceNo: incomeRef.trim() || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setIncomeList([added, ...incomeList]);
    setIncomeTitle('');
    setIncomeAmount('');
    setIncomeDesc('');
    setIncomeRef('');
    setAddMsg('Income entry saved successfully!');
    setTimeout(() => {
      setAddMsg(null);
      setSubTab('all');
    }, 1200);
  };

  // Handle Add Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const added = addIncomeCategory(newCatName.trim(), newCatDesc.trim() || undefined);
    setCategories([...categories, added]);
    setNewCatName('');
    setNewCatDesc('');
    setCatMsg('Category added successfully!');
    setTimeout(() => {
      setCatMsg(null);
      setSubTab('categories');
    }, 1200);
  };

  const handleDeleteIncome = (id: string) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      deleteIncomeEntry(id);
      setIncomeList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDeleteCat = (id: string) => {
    if (window.confirm('Delete this income category?')) {
      deleteIncomeCategory(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto antialiased">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Recorded Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            ৳{totalIncome.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{incomeList.length} Total Transactions</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Income Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {categories.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Categorized revenue streams
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Transaction Size
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            ৳
            {incomeList.length > 0
              ? Math.round(totalIncome / incomeList.length).toLocaleString()
              : '0'}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Per recorded entry
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subTab === 'all'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Income ({incomeList.length})
          </button>
          <button
            onClick={() => setSubTab('add')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subTab === 'add'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            + Add Income
          </button>
          <button
            onClick={() => setSubTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subTab === 'categories'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Income Categories ({categories.length})
          </button>
          <button
            onClick={() => setSubTab('add-category')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subTab === 'add-category'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* VIEW 1: ALL INCOME LIST */}
      {subTab === 'all' && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search income records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Income Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">TITLE / DETAILS</th>
                    <th className="py-4 px-4">CATEGORY</th>
                    <th className="py-4 px-4">METHOD</th>
                    <th className="py-4 px-4">DATE</th>
                    <th className="py-4 px-4 text-right">AMOUNT</th>
                    <th className="py-4 pr-6 pl-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {filteredIncome.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No income records found.
                      </td>
                    </tr>
                  ) : (
                    filteredIncome.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{item.title}</div>
                          {item.description && (
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {item.description}
                            </div>
                          )}
                          {item.referenceNo && (
                            <div className="text-[10px] font-mono text-indigo-600 mt-0.5">
                              Ref: {item.referenceNo}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                            {item.categoryName}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-600 font-semibold">{item.paymentMethod}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-500">{item.date}</td>
                        <td className="py-4 px-4 text-right font-extrabold text-sm text-emerald-600">
                          +৳{item.amount.toLocaleString()}
                        </td>
                        <td className="py-4 pr-6 pl-4 text-right">
                          <button
                            onClick={() => handleDeleteIncome(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ADD INCOME FORM */}
      {subTab === 'add' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Record New Income</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add direct software sales, subscriptions, custom marketing, or miscellaneous earnings.
            </p>
          </div>

          {addMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{addMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddIncomeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Income Title / Source *
              </label>
              <input
                type="text"
                placeholder="e.g. Enterprise Software License Resale"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={incomeCatId}
                  onChange={(e) => setIncomeCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount (BDT ৳) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={incomeMethod}
                  onChange={(e) => setIncomeMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
                >
                  <option value="bKash Merchant">bKash Merchant</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reference / TrxID
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-9981"
                  value={incomeRef}
                  onChange={(e) => setIncomeRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={3}
                placeholder="Optional notes or details regarding this income entry..."
                value={incomeDesc}
                onChange={(e) => setIncomeDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Save Income Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: INCOME CATEGORIES LIST */}
      {subTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">CATEGORY NAME</th>
                    <th className="py-4 px-4">DESCRIPTION</th>
                    <th className="py-4 px-4">TRANSACTIONS COUNT</th>
                    <th className="py-4 pr-6 pl-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {categories.map((cat) => {
                    const count = incomeList.filter((i) => i.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">{cat.name}</td>
                        <td className="py-4 px-4 text-slate-500">{cat.description || '—'}</td>
                        <td className="py-4 px-4 font-semibold text-indigo-600">
                          {count} transactions
                        </td>
                        <td className="py-4 pr-6 pl-4 text-right">
                          <button
                            onClick={() => handleDeleteCat(cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ADD CATEGORY FORM */}
      {subTab === 'add-category' && (
        <div className="max-w-md bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Income Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new financial bucket for accounting.
            </p>
          </div>

          {catMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{catMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Graphic Design Services"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Brief description of this revenue category..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
