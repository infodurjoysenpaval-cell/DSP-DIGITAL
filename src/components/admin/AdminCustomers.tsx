import React, { useState } from 'react';
import {
  Search,
  Plus,
  Settings,
  Mail,
  MoreVertical,
  User,
  Trash2,
  Check,
  X,
  Edit2,
  Shield,
  Phone,
} from 'lucide-react';
import { getRegisteredUsers, registerUser, StoredUserAccount } from '../../utils/authStorage';

export const AdminCustomers: React.FC = () => {
  const [users, setUsers] = useState<StoredUserAccount[]>(() => getRegisteredUsers());
  const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar: '',
  });
  const [msg, setMsg] = useState('');

  const reloadUsers = () => {
    setUsers(getRegisteredUsers());
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerUser(
      formData.name,
      formData.email,
      formData.phone,
      formData.password,
      undefined,
      formData.avatar.trim() || undefined
    );

    if (res.success) {
      setMsg(res.message);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '', avatar: '' });
      reloadUsers();
      setTimeout(() => setMsg(''), 3000);
    } else {
      alert(res.message);
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove user "${name}"?`)) {
      try {
        const raw = localStorage.getItem('dsp_registered_users');
        if (raw) {
          const allUsers = JSON.parse(raw);
          const remaining = allUsers.filter((u: any) => u.id !== id);
          localStorage.setItem('dsp_registered_users', JSON.stringify(remaining));
          reloadUsers();
        }
      } catch (e) {}
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header Matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading">
            Customer Users
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer profiles, wallet balances, and store access
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => alert('Customer access settings are configured.')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={() => alert('Bulk SMS composer for customers opened.')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk SMS</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white text-xs font-bold shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs & Search Bar Matching Screenshot 5 */}
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
            All Data ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'trash'
                ? 'text-[#0052FF] bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trash (0)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
          />
        </div>
      </div>

      {/* Customers Table Matching Screenshot 5 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      selectedIds.length === filteredUsers.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-[#0052FF] focus:ring-[#0052FF]"
                  />
                </th>
                <th className="p-3.5 w-14">IMAGE</th>
                <th className="p-3.5">USERNAME</th>
                <th className="p-3.5">EMAIL / PHONE</th>
                <th className="p-3.5 text-center">HAS ACCESS</th>
                <th className="p-3.5 text-center">STATUS</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No customer users registered yet.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => handleSelectOne(user.id)}
                        className="rounded text-[#0052FF] focus:ring-[#0052FF]"
                      />
                    </td>

                    <td className="p-3.5">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0052FF] border border-blue-200 flex items-center justify-center font-bold text-xs overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400">ID: {user.id}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-800">{user.email}</div>
                      <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Yes
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      {/* Pink "Active" pill matching screenshot 5 */}
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE8EC] text-[#E91E63] border border-[#FFCCD6]">
                        Active
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
                Add New Customer User
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Number (11 digits) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
