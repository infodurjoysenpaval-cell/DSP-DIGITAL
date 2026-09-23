import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronDown,
  Check,
  Tag as TagIcon,
  X,
  Image as ImageIcon,
  Save,
  Filter,
  UploadCloud,
  Loader2,
  Package,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '../../types';
import {
  getLiveProducts,
  addLiveProduct,
  updateLiveProduct,
  deleteLiveProduct,
} from '../../utils/adminStore';
import { compressImageFile } from '../../utils/imageCompressor';

interface AdminProductsProps {
  onViewProductOnSite?: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ onViewProductOnSite }) => {
  const [products, setProducts] = useState<Product[]>(() => getLiveProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'publish' | 'draft' | 'lowStock'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Ai Tools',
    salePrice: 500,
    regularPrice: 800,
    stock: 100,
    openingStock: 100,
    images: [] as string[],
    imageUrlInput: '',
    shortDescription: '',
    description: '',
    isPublished: true,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reloadProducts = () => {
    setProducts(getLiveProducts());
  };

  // Filter products by tab & search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (activeTab === 'publish' && p.isPublished === false) return false;
      if (activeTab === 'draft' && p.isPublished !== false) return false;
      if (activeTab === 'lowStock') {
        const stock = p.stock ?? 100;
        if (stock > 10) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const catName = typeof p.category === 'string' ? p.category : p.category?.name || '';
        const matchesCat = catName.toLowerCase().includes(q);
        return matchesName || matchesCat;
      }

      return true;
    });
  }, [products, activeTab, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / perPage) || 1;
  const displayedProducts = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, currentPage, perPage]);

  // Counts for tabs
  const allCount = products.length;
  const publishCount = products.filter((p) => p.isPublished !== false).length;
  const draftCount = products.filter((p) => p.isPublished === false).length;
  const lowStockCount = products.filter((p) => (p.stock ?? 100) <= 10).length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(displayedProducts.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleImageUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileList.length === 0) return;

    setIsUploading(true);
    try {
      const compressedResults: string[] = [];
      for (const file of fileList) {
        try {
          const compressed = await compressImageFile(file, 1000, 0.82);
          if (compressed) {
            compressedResults.push(compressed);
          }
        } catch (err) {
          console.error('Failed to compress image:', err);
        }
      }

      if (compressedResults.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...compressedResults],
        }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormError(null);
    setFormData({
      name: '',
      category: 'Ai Tools',
      salePrice: 500,
      regularPrice: 800,
      stock: 100,
      openingStock: 100,
      images: [],
      imageUrlInput: '',
      shortDescription: 'Official digital license with 100% guarantee.',
      description: 'Instant delivery digital license key and activation guide.',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormError(null);
    const existingImages = Array.isArray(p.images)
      ? p.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
      : typeof p.images === 'string' && (p.images as string).trim().length > 0
      ? [p.images]
      : [];

    const catName = typeof p.category === 'string'
      ? p.category
      : p.category?.name || 'Ai Tools';

    setFormData({
      name: p.name,
      category: catName,
      salePrice: p.salePrice ?? 0,
      regularPrice: p.regularPrice ?? 0,
      stock: p.stock ?? 100,
      openingStock: p.openingStock ?? 100,
      images: [...existingImages],
      imageUrlInput: '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      isPublished: p.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (prod: Product) => {
    setProductToDelete(prod);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const name = productToDelete.name;
    deleteLiveProduct(productToDelete._id);
    setProductToDelete(null);
    reloadProducts();
    setToastMessage({
      text: `"${name}" সফলভাবে ডিলিট করা হয়েছে!`,
      type: 'success',
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('দয়া করে প্রোডাক্টের নাম লিখুন (Product name is required)');
      return;
    }

    const finalImages = formData.images.filter(
      (img) => typeof img === 'string' && img.trim().length > 0
    );

    const safeImages = finalImages.length > 0 ? finalImages : ['/logo.png'];

    if (editingProduct) {
      updateLiveProduct(editingProduct._id, {
        name: formData.name.trim(),
        category: formData.category,
        salePrice: Number(formData.salePrice),
        regularPrice: Number(formData.regularPrice),
        stock: Number(formData.stock),
        openingStock: Number(formData.openingStock),
        images: safeImages,
        shortDescription: formData.shortDescription,
        description: formData.description,
        isPublished: formData.isPublished,
      });
      setToastMessage({
        text: `"${formData.name.trim()}" সফলভাবে আপডেট করা হয়েছে!`,
        type: 'success',
      });
    } else {
      addLiveProduct({
        name: formData.name.trim(),
        category: formData.category,
        salePrice: Number(formData.salePrice),
        regularPrice: Number(formData.regularPrice),
        stock: Number(formData.stock),
        openingStock: Number(formData.openingStock),
        images: safeImages,
        shortDescription: formData.shortDescription,
        description: formData.description,
        isPublished: formData.isPublished,
      });
      setToastMessage({
        text: `"${formData.name.trim()}" প্রোডাক্টটি সফলভাবে যুক্ত ও আপলোড করা হয়েছে!`,
        type: 'success',
      });
    }

    setIsModalOpen(false);
    reloadProducts();
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1600px] mx-auto">
      {/* Top Filter Bar Matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-2.5">
          {/* Actions Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors">
              <span>Actions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Per Page */}
          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:border-[#0052FF]"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          {/* + Add Product Button (Purple matching Screenshot 2) */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs Matching Screenshot 2 */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'all'
                ? 'text-[#0052FF] bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'publish'
                ? 'text-[#0052FF] bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Publish ({publishCount})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'draft'
                ? 'text-[#0052FF] bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Draft ({draftCount})
          </button>
          <button
            onClick={() => setActiveTab('lowStock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'lowStock'
                ? 'text-[#0052FF] bg-blue-50 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
        </div>

        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 shrink-0">
          <span>Columns</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Mobile Products List (Clean, non-messy cards for mobile devices) */}
      <div className="block md:hidden space-y-3">
        {displayedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No products found matching the criteria.
          </div>
        ) : (
          displayedProducts.map((prod) => {
            const catName = typeof prod.category === 'string' ? prod.category : prod.category?.name || 'Software License';
            const imgUrl = prod.images?.[0] || prod.featuredImage || '/placeholder.png';
            const stockVal = prod.stock ?? 100;

            return (
              <div
                key={prod._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{prod.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                      {catName}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-extrabold text-slate-900">
                        ৳{prod.salePrice ?? 0}
                      </span>
                      {prod.regularPrice && (
                        <span className="line-through text-slate-400 text-[11px]">
                          ৳{prod.regularPrice}
                        </span>
                      )}
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Stock: {stockVal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0052FF] bg-blue-50 px-2 py-0.5 rounded-md">
                    <TagIcon className="w-3 h-3" />
                    <span>Digital License</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {onViewProductOnSite && (
                      <button
                        onClick={() => onViewProductOnSite(prod)}
                        title="View on site"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      title="Edit product"
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0052FF] font-bold text-xs hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod)}
                      title="Delete"
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Products Table Matching Screenshot 2 (Desktop / Tablet view) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      displayedProducts.length > 0 &&
                      selectedIds.length === displayedProducts.length
                    }
                    className="rounded text-[#0052FF] focus:ring-[#0052FF]"
                  />
                </th>
                <th className="p-3.5 w-12 text-center">SL</th>
                <th className="p-3.5 w-18">IMAGE</th>
                <th className="p-3.5 min-w-[220px]">NAME</th>
                <th className="p-3.5 min-w-[140px]">CATEGORY</th>
                <th className="p-3.5 min-w-[120px]">STOCK</th>
                <th className="p-3.5 min-w-[100px]">OPENING STOCK</th>
                <th className="p-3.5 min-w-[120px]">TAGS</th>
                <th className="p-3.5 text-right min-w-[120px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((prod, idx) => {
                  const sl = (currentPage - 1) * perPage + idx + 1;
                  const catName =
                    typeof prod.category === 'string'
                      ? prod.category
                      : prod.category?.name || 'General';
                  const stockVal = prod.stock ?? 79;
                  const openingStock = prod.openingStock ?? 80;

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(prod._id)}
                          onChange={() => handleSelectOne(prod._id)}
                          className="rounded text-[#0052FF] focus:ring-[#0052FF]"
                        />
                      </td>

                      <td className="p-3.5 text-center text-slate-400 font-semibold">{sl}</td>

                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 hover:text-[#0052FF] transition-colors leading-tight line-clamp-1">
                            {prod.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Published
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052FF] border border-blue-200">
                              Priority: 0
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-slate-900">
                            ৳{prod.salePrice ?? 0}
                            {prod.regularPrice && (
                              <span className="line-through text-slate-400 font-normal ml-2">
                                ৳{prod.regularPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 font-semibold">{catName}</td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In stock: {stockVal}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 font-semibold">{openingStock}</td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <TagIcon className="w-3 h-3" />
                          <span>Digital License</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onViewProductOnSite && (
                            <button
                              onClick={() => onViewProductOnSite(prod)}
                              title="View on website"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#0052FF] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * perPage + 1} to{' '}
            {Math.min(currentPage * perPage, filteredProducts.length)} of{' '}
            {filteredProducts.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-extrabold text-slate-900 font-main-heading">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError(null);
                  }}
                  placeholder="e.g. Windows 11 Pro Genuine Retail License Key"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
                {formError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                >
                  <option value="Ai Tools">Ai Tools</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Verified Accounts">Verified Accounts</option>
                  <option value="All Gift Cards">All Gift Cards</option>
                  <option value="VPN & Online Security">VPN & Online Security</option>
                  <option value="Windows Utility Key">Windows Utility Key</option>
                  <option value="Premium Software">Premium Software</option>
                  <option value="Education & Learning Tools">Education & Learning Tools</option>
                  <option value="Digital Marketing & Social Media Services">Digital Marketing & Social Media Services</option>
                  <option value="Operating System">Operating System</option>
                  <option value="Office & Productivity">Office & Productivity</option>
                  <option value="Antivirus & Security">Antivirus & Security</option>
                  <option value="Software License">Software License</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Product Images Drag & Drop, Upload & Delete Management */}
              <div className="space-y-2.5 p-3 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold text-xs">
                    Product Images (প্রোডাক্টের ছবি)
                  </label>
                  {formData.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, images: [] })}
                      className="text-red-500 hover:text-red-700 font-bold text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>সব ছবি মুছুন (Remove All)</span>
                    </button>
                  )}
                </div>

                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleImageUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 select-none ${
                    isDragging
                      ? 'border-[#0052FF] bg-blue-50 scale-[1.01]'
                      : 'border-slate-300 hover:border-[#0052FF] bg-white hover:bg-blue-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleImageUpload(e.target.files);
                      }
                      e.target.value = '';
                    }}
                  />

                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0052FF] flex items-center justify-center shadow-2xs">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isUploading
                        ? 'ছবি অপটিমাইজ ও আপলোড হচ্ছে...'
                        : 'ছবি এখানে ড্র্যাগ অ্যান্ড ড্রপ করুন (Drag & Drop image here)'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      বা ডিভাইস থেকে ছবি আপলোড করতে ক্লিক করুন (Click to upload from device) · JPG, PNG, WEBP
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={formData.imageUrlInput}
                      onChange={(e) => setFormData({ ...formData, imageUrlInput: e.target.value })}
                      placeholder="বা ছবির সরাসরি লিংক পেস্ট করুন (Paste image URL: https://...)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.imageUrlInput.trim()) {
                        setFormData({
                          ...formData,
                          images: [...formData.images, formData.imageUrlInput.trim()],
                          imageUrlInput: '',
                        });
                      }
                    }}
                    disabled={!formData.imageUrlInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs disabled:opacity-50 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Previews and Image Deletion Grid */}
                {formData.images.length > 0 ? (
                  <div className="space-y-1.5 pt-1.5">
                    <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                      <span>সংযুক্ত ছবি ({formData.images.length}) · প্রথম ছবিটি ওয়েবসাইটে প্রদর্শিত হবে</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center p-1.5 shadow-2xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />

                          {/* Primary Cover Badge */}
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 bg-[#0052FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                              Main
                            </span>
                          )}

                          {/* Red Delete/Remove Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({
                                ...formData,
                                images: formData.images.filter((_, i) => i !== idx),
                              });
                            }}
                            title="ছবি রিমুভ করুন (Remove this image)"
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-transform hover:scale-110 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Set as Cover button if secondary image */}
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newImgs = [...formData.images];
                                const [selected] = newImgs.splice(idx, 1);
                                newImgs.unshift(selected);
                                setFormData({ ...formData, images: newImgs });
                              }}
                              className="absolute bottom-1.5 inset-x-1.5 py-1 rounded bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              মেইন ছবি করুন
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>কোনো ছবি যুক্ত নেই। ছবি আপলোড করতে উপরে ড্র্যাগ করুন বা ক্লিক করুন।</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sale Price (৳) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.regularPrice}
                    onChange={(e) => setFormData({ ...formData, regularPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Opening Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.openingStock}
                    onChange={(e) => setFormData({ ...formData, openingStock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Official digital license, instant delivery in Bangladesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product features, key activation steps, warranty notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF]"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod_published"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-[#0052FF] focus:ring-[#0052FF]"
                />
                <label htmlFor="prod_published" className="text-slate-700 font-semibold cursor-pointer">
                  Publish this product immediately on the website
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Replaces blocked window.confirm) */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-main-heading">
                প্রোডাক্ট ডিলিট নিশ্চিত করুন
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Confirm Product Deletion
              </p>
            </div>

            {/* Product Snapshot Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {productToDelete.images?.[0] ? (
                  <img
                    src={productToDelete.images[0]}
                    alt={productToDelete.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                ) : (
                  <Package className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                  {productToDelete.name}
                </p>
                <p className="text-[11px] font-semibold text-rose-600 mt-0.5">
                  ৳{productToDelete.salePrice}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed px-2">
              আপনি কি সত্যিই এই প্রোডাক্টটি ওয়েবসাইট থেকে মুছে ফেলতে চান? প্রোডাক্টটি ওয়েবসাইট এবং ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হবে।
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-xs transition-colors cursor-pointer"
              >
                বাতিল করুন (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ডিলিট করুন (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl text-xs font-bold border border-slate-800 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
