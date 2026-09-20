import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Download,
  AlertCircle,
  CreditCard,
  MessageSquare,
  ZoomIn,
} from 'lucide-react';
import { AffiliateApplication } from '../../types';
import {
  getAffiliateApplications,
  updateAffiliateStatus,
  deleteAffiliateApplication,
} from '../../utils/affiliateStorage';

export const AdminAffiliates: React.FC = () => {
  const [applications, setApplications] = useState<AffiliateApplication[]>(() =>
    getAffiliateApplications()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedAppForDoc, setSelectedAppForDoc] = useState<AffiliateApplication | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const reload = () => {
    setApplications(getAffiliateApplications());
  };

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener('dsp_affiliate_updated', handleUpdate);
    return () => window.removeEventListener('dsp_affiliate_updated', handleUpdate);
  }, []);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.fullName.toLowerCase().includes(q) ||
        app.contactNumber.includes(q) ||
        (app.whatsappNumber && app.whatsappNumber.includes(q)) ||
        app.email.toLowerCase().includes(q) ||
        (app.nidNumber && app.nidNumber.includes(q)) ||
        (app.accountNumber && app.accountNumber.includes(q))
      );
    });
  }, [applications, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [applications]);

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    updateAffiliateStatus(id, newStatus);
    reload();
    if (selectedAppForDoc && selectedAppForDoc.id === id) {
      setSelectedAppForDoc((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSaveNote = (id: string) => {
    updateAffiliateStatus(id, selectedAppForDoc?.status || 'pending', adminNoteInput);
    setEditingNoteId(null);
    reload();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0052FF]" />
            <span>Affiliate Partners & Verification</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ইউজারদের জমা দেওয়া NID, ট্রেড লাইসেন্স ও অন্যান্য ডকুমেন্ট পর্যালোচনা ও অনুমোদন করুন
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Phone, NID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">মোট আবেদন</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Total Applicants</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700">যাচাই বাকি (Pending)</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</div>
          <span className="text-[11px] text-amber-600">ডকুমেন্ট রিভিউ প্রয়োজন</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700">অনুমোদিত পার্টনার</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{stats.approved}</div>
          <span className="text-[11px] text-emerald-600">Active Affiliates</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-rose-700">বাতিলকৃত</span>
          <div className="text-2xl font-black text-rose-900 mt-1">{stats.rejected}</div>
          <span className="text-[11px] text-rose-600">Rejected Applications</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `All (${applications.length})` },
          { id: 'pending', label: `Pending Review (${stats.pending})` },
          { id: 'approved', label: `Approved (${stats.approved})` },
          { id: 'rejected', label: `Rejected (${stats.rejected})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-[#0052FF] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">কোনো অ্যাফিলিয়েট আবেদন পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">
              ইউজাররা তাদের ড্যাশবোর্ড থেকে আবেদন করলে এখানে সমস্ত তথ্য ও ডকুমেন্টসহ প্রদর্শিত হবে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Applicant & Contact</th>
                  <th className="px-4 py-3.5">Channel / Page</th>
                  <th className="px-4 py-3.5">Payout Method</th>
                  <th className="px-4 py-3.5">Submitted Document</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Applicant & Contact */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm">{app.fullName}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {app.contactNumber}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {app.email}
                        </span>
                        {app.nidNumber && (
                          <span className="text-[10px] text-slate-400">NID: {app.nidNumber}</span>
                        )}
                      </div>
                    </td>

                    {/* Channel / Page */}
                    <td className="px-4 py-4 max-w-[200px]">
                      {app.channelLink ? (
                        <a
                          href={app.channelLink.startsWith('http') ? app.channelLink : `https://${app.channelLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#0052FF] hover:underline font-medium truncate max-w-[180px]"
                        >
                          <span className="truncate">{app.channelLink}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </td>

                    {/* Payout Method */}
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800 text-[11px]">
                        <CreditCard className="w-3 h-3 text-[#0052FF]" />
                        <span>{app.payoutMethod}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono mt-1">
                        {app.accountNumber}
                      </div>
                    </td>

                    {/* Submitted Document */}
                    <td className="px-4 py-4">
                      {app.documentUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedAppForDoc(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052FF] font-bold text-xs border border-blue-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ডকুমেন্ট দেখুন</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">কোনো ফাইল দেয়নি</span>
                      )}
                      {app.documentName && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px] mt-1">
                          {app.documentName}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {app.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {app.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(app.submittedAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.whatsappNumber && (
                          <a
                            href={`https://wa.me/88${app.whatsappNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="WhatsApp Chat"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}

                        {app.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                            title="অনুমোদন করুন (Approve)"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="বাতিল করুন (Reject)"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document View & Verification Modal */}
      {selectedAppForDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedAppForDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-main-heading">
                  আবেদনকারীর ডকুমেন্টস ও পরিচয়পত্র
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAppForDoc.fullName} — {selectedAppForDoc.contactNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppForDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">পূর্ণ নাম:</span>
                <span className="font-bold text-slate-800">{selectedAppForDoc.fullName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">ইমেইল:</span>
                <span className="font-medium text-slate-800 truncate block">{selectedAppForDoc.email}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">মোবাইল / WhatsApp:</span>
                <span className="font-medium text-slate-800">{selectedAppForDoc.contactNumber}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">NID / আইডি নম্বর:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedAppForDoc.nidNumber || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">পেমেন্ট মেথড:</span>
                <span className="font-bold text-[#0052FF]">
                  {selectedAppForDoc.payoutMethod} ({selectedAppForDoc.accountNumber})
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">আবেদনের তারিখ:</span>
                <span className="text-slate-600">
                  {new Date(selectedAppForDoc.submittedAt).toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Document Image / File View */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0052FF]" />
                  <span>সংযুক্ত ডকুমেন্ট ফাইল ({selectedAppForDoc.documentName || 'Document'})</span>
                </span>
                {selectedAppForDoc.documentUrl && (
                  <a
                    href={selectedAppForDoc.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#0052FF] hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ফুল স্ক্রিনে দেখুন</span>
                  </a>
                )}
              </div>

              {selectedAppForDoc.documentUrl ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center min-h-[260px] max-h-[420px]">
                  <img
                    src={selectedAppForDoc.documentUrl}
                    alt="Applicant Verification Document"
                    className="w-full h-full object-contain max-h-[400px]"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">
                  কোনো ডকুমেন্ট ফাইল পাওয়া যায়নি
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Admin Review Notes (অ্যাডমিন মন্তব্য)
              </label>
              <input
                type="text"
                placeholder="যেমন: ভেরিফাইড ফেসবুক পেজ, ১০% কমিশন অনুমোদিত..."
                defaultValue={selectedAppForDoc.notes || ''}
                onBlur={(e) => updateAffiliateStatus(selectedAppForDoc.id, selectedAppForDoc.status, e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
              />
            </div>

            {/* Footer Decision Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">বর্তমান স্ট্যাটাস:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedAppForDoc.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedAppForDoc.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {selectedAppForDoc.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedAppForDoc.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppForDoc.id, 'rejected')}
                    className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                  >
                    Reject Application
                  </button>
                )}
                {selectedAppForDoc.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppForDoc.id, 'approved')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Approve & Activate Affiliate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
