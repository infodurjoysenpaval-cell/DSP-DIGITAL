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
  AlertCircle,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Ban,
  TrendingUp,
  Copy,
  DollarSign,
  AlertTriangle,
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
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'restricted' | 'rejected'
  >('all');
  const [selectedAppForDoc, setSelectedAppForDoc] = useState<AffiliateApplication | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
        (app.accountNumber && app.accountNumber.includes(q)) ||
        (app.referralCode && app.referralCode.toLowerCase().includes(q))
      );
    });
  }, [applications, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const restricted = applications.filter((a) => a.status === 'restricted').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    return { total, pending, approved, restricted, rejected };
  }, [applications]);

  const handleStatusChange = (
    id: string,
    newStatus: 'approved' | 'restricted' | 'rejected' | 'pending'
  ) => {
    updateAffiliateStatus(id, newStatus);
    reload();
    if (selectedAppForDoc && selectedAppForDoc.id === id) {
      setSelectedAppForDoc((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const copyRefLink = (code: string) => {
    const link = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
            অ্যাফিলিয়েট অনুমোদন করুন, যেকোনো সময় স্থগিত (Restrict) বা বাতিল করুন, এবং রেফারেল পারফরম্যান্স দেখুন
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Phone, Ref Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
          <span className="text-xs font-semibold text-emerald-700">অনুমোদিত (Approved)</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{stats.approved}</div>
          <span className="text-[11px] text-emerald-600">১৫% ডিসকাউন্ট ও রেফারে ২০৳</span>
        </div>

        <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-orange-700">স্থগিত (Restricted)</span>
          <div className="text-2xl font-black text-orange-900 mt-1">{stats.restricted}</div>
          <span className="text-[11px] text-orange-600">সুবিধা স্থগিত রয়েছে</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-rose-700">বাতিলকৃত (Cancelled)</span>
          <div className="text-2xl font-black text-rose-900 mt-1">{stats.rejected}</div>
          <span className="text-[11px] text-rose-600">Rejected / Cancelled</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `All (${applications.length})` },
          { id: 'pending', label: `Pending Review (${stats.pending})` },
          { id: 'approved', label: `Approved Active (${stats.approved})` },
          { id: 'restricted', label: `Restricted (${stats.restricted})` },
          { id: 'rejected', label: `Cancelled/Rejected (${stats.rejected})` },
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
                  <th className="px-4 py-3.5">Referral Code & Link</th>
                  <th className="px-4 py-3.5">Earnings & Sales</th>
                  <th className="px-4 py-3.5">Payout Details</th>
                  <th className="px-4 py-3.5">Verification Doc</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Applicant & Contact */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{app.fullName}</span>
                        {app.status === 'approved' && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0052FF] text-[10px] font-bold">
                            15% Off Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {app.contactNumber}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {app.email}
                        </span>
                        {app.channelLink && (
                          <a
                            href={app.channelLink.startsWith('http') ? app.channelLink : `https://${app.channelLink}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#0052FF] hover:underline font-medium truncate max-w-[180px] mt-0.5"
                          >
                            <span className="truncate">{app.channelLink}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Referral Code & Link */}
                    <td className="px-4 py-4">
                      {app.referralCode ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                            <span>{app.referralCode}</span>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => copyRefLink(app.referralCode!)}
                              className="inline-flex items-center gap-1 text-[11px] text-[#0052FF] hover:underline font-medium cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedCode === app.referralCode ? 'Copied Link!' : 'Copy Link (?ref=...)'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not generated</span>
                      )}
                    </td>

                    {/* Earnings & Sales */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        ৳{(app.availableBalance ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Total: ৳{(app.totalEarned ?? 0).toLocaleString()} · Sales: {app.salesCount ?? 0}
                      </div>
                    </td>

                    {/* Payout Details */}
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
                      {app.nidNumber && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px] mt-1">
                          NID: {app.nidNumber}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {app.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          অনুমোদিত (Approved)
                        </span>
                      )}
                      {app.status === 'restricted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-bold border border-orange-200">
                          <AlertTriangle className="w-3 h-3" />
                          স্থগিত (Restricted)
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
                          বাতিল (Cancelled)
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

                    {/* Admin Action Buttons */}
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

                        {/* Approve Button (if not already approved) */}
                        {app.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'approved')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                            title="অনুমোদন করুন (Approve)"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Restrict Button (can restrict approved or pending affiliates) */}
                        {app.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'restricted')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs transition-colors cursor-pointer"
                            title="স্থগিত করুন (Restrict Affiliate)"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                            <span>Restrict</span>
                          </button>
                        )}

                        {/* Reject / Cancel Button (can cancel approved or restricted affiliates) */}
                        {app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                            title="বাতিল করুন (Cancel/Reject Affiliate)"
                          >
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancel</span>
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
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
                <span className="text-[11px] text-slate-400 block">ব্যালেন্স ও সেলস:</span>
                <span className="font-bold text-emerald-700">
                  ৳{(selectedAppForDoc.availableBalance ?? 0).toLocaleString()} ({selectedAppForDoc.salesCount ?? 0} Sales)
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
                placeholder="যেমন: ভেরিফাইড ফেসবুক পেজ, ১৫% ডিসকাউন্ট এবং ২০৳ কমিশন সক্রিয়..."
                defaultValue={selectedAppForDoc.notes || ''}
                onBlur={(e) =>
                  updateAffiliateStatus(selectedAppForDoc.id, selectedAppForDoc.status, e.target.value)
                }
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
                      : selectedAppForDoc.status === 'restricted'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : selectedAppForDoc.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {selectedAppForDoc.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Restrict action */}
                {selectedAppForDoc.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppForDoc.id, 'restricted')}
                    className="px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    স্থগিত করুন (Restrict)
                  </button>
                )}

                {/* Reject / Cancel action */}
                {selectedAppForDoc.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppForDoc.id, 'rejected')}
                    className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    বাতিল করুন (Cancel)
                  </button>
                )}

                {/* Approve action */}
                {selectedAppForDoc.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppForDoc.id, 'approved')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    অনুমোদন করুন (Approve)
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
