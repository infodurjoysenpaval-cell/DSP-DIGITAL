import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShieldCheck,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  Lock,
} from 'lucide-react';
import {
  getVendorAdmins,
  addVendorAdmin,
  saveVendorAdmins,
  VendorAdmin,
  VendorRole,
} from '../../utils/adminStore';

export const AdminVendors: React.FC = () => {
  const [admins, setAdmins] = useState<VendorAdmin[]>(() => getVendorAdmins());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'ProductAdder' as VendorRole,
    access: 'Allowed' as 'Allowed' | 'Restricted',
    avatar: '',
  });
  const [msg, setMsg] = useState('');

  const filteredAdmins = admins.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q);
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAdmins.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAccessChange = (id: string, newAccess: 'Allowed' | 'Restricted') => {
    const updated = admins.map((a) => (a.id === id ? { ...a, access: newAccess } : a));
    setAdmins(updated);
    saveVendorAdmins(updated);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) return;

    const created = addVendorAdmin({
      name: formData.name,
      username: formData.username,
      password: formData.password.trim() || '123456',
      role: formData.role,
      lastLogin: 'Never',
      registeredAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      access: formData.access,
      avatar: formData.avatar.trim() || undefined,
    });

    setAdmins(getVendorAdmins());
    setIsAddModalOpen(false);
    setFormData({ name: '', username: '', password: '', role: 'ProductAdder', access: 'Allowed', avatar: '' });
    setMsg('New user added successfully.');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (admins.length <= 1) {
      alert('Cannot delete the primary owner account.');
      return;
    }
    if (window.confirm(`Delete admin access for "${name}"?`)) {
      const remaining = admins.filter((a) => a.id !== id);
      setAdmins(remaining);
      saveVendorAdmins(remaining);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header Matching Screenshot 6 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading">
            Vendor Admins
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage store managers, vendor operators, and administrative privileges
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white text-xs font-bold shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs & Search Bar Matching Screenshot 6 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'text-[#0052FF] bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All {admins.length}
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'trash'
                ? 'text-[#0052FF] bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trash 0
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
          />
        </div>
      </div>

      {/* Table Matching Screenshot 6 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredAdmins.length > 0 &&
                      selectedIds.length === filteredAdmins.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-[#0052FF] focus:ring-[#0052FF]"
                  />
                </th>
                <th className="p-3.5 w-14">IMAGE</th>
                <th className="p-3.5">NAME</th>
                <th className="p-3.5">USERNAME</th>
                <th className="p-3.5">ROLE</th>
                <th className="p-3.5">LAST LOGIN</th>
                <th className="p-3.5">REGISTERED AT</th>
                <th className="p-3.5 text-center">ACCESS</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAdmins.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(adm.id)}
                      onChange={() => handleSelectOne(adm.id)}
                      className="rounded text-[#0052FF] focus:ring-[#0052FF]"
                    />
                  </td>

                  <td className="p-3.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-bold">
                      {adm.avatar ? (
                        <img src={adm.avatar} alt={adm.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 font-bold text-slate-900">{adm.name}</td>

                  <td className="p-3.5 font-mono text-slate-600">{adm.username}</td>

                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      adm.role === 'ProductAdder'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : adm.role === 'Owner'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : adm.role === 'Manager'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-[#0052FF] border-blue-200'
                    }`}>
                      {adm.role === 'ProductAdder' ? 'Product Manager (Only Products)' : adm.role}
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-600">{adm.lastLogin}</td>

                  <td className="p-3.5 text-slate-500">{adm.registeredAt}</td>

                  {/* Access Dropdown Matching Screenshot 6 ("Allowed" in green border) */}
                  <td className="p-3.5 text-center">
                    <select
                      value={adm.access}
                      onChange={(e) =>
                        handleAccessChange(adm.id, e.target.value as 'Allowed' | 'Restricted')
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        adm.access === 'Allowed'
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50/50'
                          : 'border-rose-300 text-rose-700 bg-rose-50/50'
                      } focus:outline-none`}
                    >
                      <option value="Allowed">Allowed</option>
                      <option value="Restricted">Restricted</option>
                    </select>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
                Add New Vendor Admin
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Display Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Operations Admin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email / Username *</label>
                <input
                  type="email"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="admin2@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Login Password * (লগইন পাসওয়ার্ড)
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="123456 or custom password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">ফাঁকা রাখলে ডিফল্ট পাসওয়ার্ড হবে 123456</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / পদবি *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as VendorRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF] font-medium"
                >
                  <option value="ProductAdder">Product Manager (Only Add Products / শুধু প্রোডাক্ট অ্যাড)</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>
                {formData.role === 'ProductAdder' && (
                  <div className="mt-1.5 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 leading-snug">
                    <p className="font-bold flex items-center gap-1">
                      <span>🔒</span> সীমাবদ্ধ ভূমিকা (Restricted Role):
                    </p>
                    <p className="text-purple-700 mt-0.5">
                      এই ইউজার অ্যাডমিন প্যানেলে লগইন করে শুধুমাত্র নতুন প্রোডাক্ট অ্যাড ও ম্যানেজ করতে পারবে। এছাড়া ড্যাশবোর্ড, সেটিংস, অর্ডার বা অন্য কোনো পেইজে তার এক্সেস থাকবে না।
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Access</label>
                <select
                  value={formData.access}
                  onChange={(e) => setFormData({ ...formData, access: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                >
                  <option value="Allowed">Allowed</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Custom Profile Photo / Avatar (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">Photo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="Image URL or upload below"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0052FF]"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData((prev) => ({
                            ...prev,
                            avatar: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-[#0052FF] hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white font-bold"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
