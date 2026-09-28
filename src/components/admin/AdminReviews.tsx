import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Star,
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Upload,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  Review,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  duplicateReview,
  bulkDeleteReviews,
  bulkUpdateReviewStatus,
} from '../../utils/reviewStore';
import { getLiveProducts } from '../../utils/adminStore';
import { Product } from '../../types';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(() => getReviews());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Form State for Add / Edit
  const liveProducts: Product[] = useMemo(() => getLiveProducts(), []);
  const [formProductId, setFormProductId] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formReviewText, setFormReviewText] = useState('');
  const [formStatus, setFormStatus] = useState<'approved' | 'pending'>('approved');
  const [formImage, setFormImage] = useState('');
  const [formReply, setFormReply] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Listen for storage events
  useEffect(() => {
    const handleUpdate = () => {
      setReviews(getReviews());
    };
    window.addEventListener('dsp_reviews_updated', handleUpdate);
    return () => window.removeEventListener('dsp_reviews_updated', handleUpdate);
  }, []);

  // Close 3-dot dropdown on outside click
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Tab status filter
      if (activeFilter === 'approved' && rev.status !== 'approved') return false;
      if (activeFilter === 'pending' && rev.status !== 'pending') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProduct = rev.productName.toLowerCase().includes(q);
        const matchesCustomer = rev.customerName.toLowerCase().includes(q);
        const matchesReview = rev.reviewText.toLowerCase().includes(q);
        return matchesProduct || matchesCustomer || matchesReview;
      }
      return true;
    });
  }, [reviews, activeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage]);

  const approvedCount = useMemo(() => reviews.filter((r) => r.status === 'approved').length, [reviews]);
  const pendingCount = useMemo(() => reviews.filter((r) => r.status === 'pending').length, [reviews]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedReviews.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const defaultProduct = liveProducts[0];
    setFormProductId(defaultProduct?._id || '');
    setFormCustomerName('');
    setFormRating(5);
    setFormReviewText('');
    setFormStatus('approved');
    setFormImage(defaultProduct?.images?.[0] || '');
    setFormReply('');
    setIsAddModalOpen(true);
  };

  // Open Edit / Reply Modal
  const handleOpenEditModal = (rev: Review) => {
    setSelectedReview(rev);
    setFormProductId(rev.productId);
    setFormCustomerName(rev.customerName);
    setFormRating(rev.rating);
    setFormReviewText(rev.reviewText);
    setFormStatus(rev.status);
    setFormImage(rev.productImage);
    setFormReply(rev.reply || '');
    setOpenMenuId(null);
    setIsEditModalOpen(true);
  };

  // Open Details Modal
  const handleOpenDetailsModal = (rev: Review) => {
    setSelectedReview(rev);
    setOpenMenuId(null);
    setIsDetailsModalOpen(true);
  };

  // Handle Duplicate
  const handleDuplicate = (rev: Review) => {
    duplicateReview(rev.id);
    setOpenMenuId(null);
  };

  // Handle Delete
  const handleDelete = (rev: Review) => {
    if (window.confirm(`Are you sure you want to delete the review for "${rev.productName}"?`)) {
      deleteReview(rev.id);
      setSelectedIds((prev) => prev.filter((id) => id !== rev.id));
      setOpenMenuId(null);
    }
  };

  // Save new review
  const handleSaveAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReviewText.trim()) return;

    const matchedProduct = liveProducts.find((p) => p._id === formProductId);
    const productName = matchedProduct ? matchedProduct.name : 'Digital Product';
    const productImage = formImage || matchedProduct?.images?.[0] || 'https://cdn.saleecom.com/upload/images/6a5b95a31438b186e57eabff/12206-b210e.webp';

    addReview({
      productId: formProductId || `prod-${Date.now()}`,
      productName,
      productImage,
      customerName: formCustomerName.trim() || 'Verified Customer',
      rating: formRating,
      reviewText: formReviewText.trim(),
      status: formStatus,
      reply: formReply.trim() || undefined,
      replyAt: formReply.trim() ? new Date().toISOString() : undefined,
    });

    setIsAddModalOpen(false);
  };

  // Save edit review
  const handleSaveEditReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    const matchedProduct = liveProducts.find((p) => p._id === formProductId);

    updateReview(selectedReview.id, {
      productName: matchedProduct ? matchedProduct.name : selectedReview.productName,
      productImage: formImage || selectedReview.productImage,
      customerName: formCustomerName.trim() || selectedReview.customerName,
      rating: formRating,
      reviewText: formReviewText.trim(),
      status: formStatus,
      reply: formReply.trim() || undefined,
      replyAt: formReply.trim() ? new Date().toISOString() : undefined,
    });

    setIsEditModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto antialiased">
      {/* Top Header Row: Search Input + Add Review Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Reviews Input with Magnifier */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] shadow-2xs transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Purple '+ Add Review' Button matching image */}
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Tabs Row: All Reviews (count), Approved (count), Pending (count) matching image */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 w-fit border border-slate-200/70">
        <button
          onClick={() => {
            setActiveFilter('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === 'all'
              ? 'bg-[#6366F1] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>All Reviews</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {reviews.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveFilter('approved');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === 'approved'
              ? 'bg-[#6366F1] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>Approved</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveFilter('pending');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === 'pending'
              ? 'bg-[#6366F1] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>Pending</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {pendingCount}
          </span>
        </button>
      </div>

      {/* Bulk Actions Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-indigo-900">
            {selectedIds.length} review{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                bulkUpdateReviewStatus(selectedIds, 'approved');
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
            >
              Approve Selected
            </button>
            <button
              onClick={() => {
                bulkUpdateReviewStatus(selectedIds, 'pending');
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
            >
              Mark as Pending
            </button>
            <button
              onClick={() => {
                if (window.confirm('Delete all selected reviews?')) {
                  bulkDeleteReviews(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Reviews Table Container Matching Screenshot */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 pl-6 pr-3 w-12">
                  <input
                    type="checkbox"
                    checked={
                      paginatedReviews.length > 0 &&
                      paginatedReviews.every((r) => selectedIds.includes(r.id))
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded-md border-slate-300 text-[#6366F1] focus:ring-[#6366F1] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">IMAGE</th>
                <th className="py-4 px-4">PRODUCT NAME</th>
                <th className="py-4 px-4">REVIEW</th>
                <th className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <span>STATUS</span>
                    <Filter className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <span>RATING</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-4 pr-6 pl-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-300">
                      <Star className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-600">No reviews found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click "+ Add Review" to add customer testimonials
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((rev) => {
                  const isSelected = selectedIds.includes(rev.id);
                  return (
                    <tr
                      key={rev.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 pr-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(rev.id)}
                          className="w-4 h-4 rounded-md border-slate-300 text-[#6366F1] focus:ring-[#6366F1] cursor-pointer"
                        />
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={rev.productImage || '/logo.png'}
                            alt={rev.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                        </div>
                      </td>

                      {/* Product Name (Blue Clickable Text) */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleOpenDetailsModal(rev)}
                          className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-semibold text-left line-clamp-2 max-w-xs transition-colors cursor-pointer"
                        >
                          {rev.productName}
                        </button>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>By {rev.customerName}</span>
                          <span>•</span>
                          <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Review Comment Text */}
                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-slate-800 line-clamp-2 font-normal leading-relaxed">
                          {rev.reviewText}
                        </p>
                        {rev.reply && (
                          <div className="mt-1 text-[11px] text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">Replied: {rev.reply}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Badge (APPROVED / PENDING pill matching image) */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                            rev.status === 'approved'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#FEF3C7] text-[#B45309]'
                          }`}
                        >
                          {rev.status === 'approved' ? 'APPROVED' : 'PENDING'}
                        </span>
                      </td>

                      {/* Rating (Gold Stars matching screenshot) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-200 text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Actions 3-Dots Menu */}
                      <td className="py-4 pr-6 pl-4 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === rev.id ? null : rev.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Floating Actions Popover matching the user's screenshot exactly */}
                        {openMenuId === rev.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-6 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 space-y-1.5 animate-in fade-in zoom-in-95 duration-150 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. Edit / Reply (Blue outline/pill) */}
                            <button
                              onClick={() => handleOpenEditModal(rev)}
                              className="w-full px-3.5 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/90 text-blue-700 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                              <span>Edit / Reply</span>
                            </button>

                            {/* 2. Details (Purple outline/pill) */}
                            <button
                              onClick={() => handleOpenDetailsModal(rev)}
                              className="w-full px-3.5 py-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/90 text-purple-700 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-purple-600 stroke-[2.2]" />
                              <span>Details</span>
                            </button>

                            {/* 3. Duplicate (Orange outline/pill) */}
                            <button
                              onClick={() => handleDuplicate(rev)}
                              className="w-full px-3.5 py-2 rounded-xl bg-orange-50/70 hover:bg-orange-100/90 text-orange-700 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer"
                            >
                              <Copy className="w-4 h-4 text-orange-600 stroke-[2.2]" />
                              <span>Duplicate</span>
                            </button>

                            {/* 4. Delete (Red outline/pill) */}
                            <button
                              onClick={() => handleDelete(rev)}
                              className="w-full px-3.5 py-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/90 text-rose-700 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600 stroke-[2.2]" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination matching screenshot */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{paginatedReviews.length}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredReviews.length}</span> reviews
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD REVIEW */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Add Customer Review</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddReview} className="p-6 space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Product *
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => {
                    setFormProductId(e.target.value);
                    const prod = liveProducts.find((p) => p._id === e.target.value);
                    if (prod?.images?.[0]) setFormImage(prod.images[0]);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                >
                  {liveProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir Ahmed"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Star Rating Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{formRating} / 5</span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Review Comment *
                </label>
                <textarea
                  rows={3}
                  placeholder="Write the customer feedback or testimonial here..."
                  value={formReviewText}
                  onChange={(e) => setFormReviewText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Status & Reply */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'approved' | 'pending')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="approved">Approved (Live)</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Reply (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thank you for your feedback!"
                  value={formReply}
                  onChange={(e) => setFormReply(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT / REPLY */}
      {isEditModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Edit Review & Admin Reply</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditReview} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
                <input
                  type="text"
                  value={selectedReview.productName}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= formRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Text</label>
                <textarea
                  rows={3}
                  value={formReviewText}
                  onChange={(e) => setFormReviewText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'approved' | 'pending')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-indigo-900">
                  💬 Official Admin Reply
                </label>
                <textarea
                  rows={2}
                  placeholder="Write official store response..."
                  value={formReply}
                  onChange={(e) => setFormReply(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-indigo-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REVIEW DETAILS */}
      {isDetailsModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span>Review Details</span>
              </h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Product preview card */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={selectedReview.productImage || '/logo.png'}
                  alt={selectedReview.productName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {selectedReview.productName}
                  </h4>
                  <div className="flex items-center gap-1 text-amber-400 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= selectedReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-slate-700 ml-1">
                      {selectedReview.rating} Stars
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px] pb-1 border-b border-slate-100">
                  <span>
                    By <strong className="text-slate-800">{selectedReview.customerName}</strong>
                  </span>
                  <span>{new Date(selectedReview.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed pt-2">
                  "{selectedReview.reviewText}"
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Review Status:</span>
                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                    selectedReview.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedReview.status}
                </span>
              </div>

              {/* Reply if available */}
              {selectedReview.reply && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1 text-indigo-900">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Store Reply:
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    {selectedReview.reply}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
