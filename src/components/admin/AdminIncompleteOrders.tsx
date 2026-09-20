import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  Search,
  Phone,
  Mail,
  MessageSquare,
  ShoppingBag,
  Trash2,
  Clock,
  ExternalLink,
  DollarSign,
  User,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { IncompleteOrder, OrderDetails } from '../../types';
import {
  getIncompleteOrders,
  deleteIncompleteOrder,
  resolveIncompleteOrder,
} from '../../utils/incompleteOrdersStore';
import { saveOrderToHistory } from '../../utils/authStorage';

export const AdminIncompleteOrders: React.FC = () => {
  const [incompleteOrders, setIncompleteOrders] = useState<IncompleteOrder[]>(() =>
    getIncompleteOrders()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'payment_pending' | 'checkout_entered' | 'cart_abandoned'>('all');
  const [selectedOrder, setSelectedOrder] = useState<IncompleteOrder | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const reload = () => {
    setIncompleteOrders(getIncompleteOrders());
  };

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener('dsp_incomplete_orders_updated', handleUpdate);
    return () => window.removeEventListener('dsp_incomplete_orders_updated', handleUpdate);
  }, []);

  const filteredOrders = useMemo(() => {
    return incompleteOrders.filter((order) => {
      if (stageFilter !== 'all' && order.stage !== stageFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const customerMatch =
        order.customerName.toLowerCase().includes(q) ||
        order.phone.includes(q) ||
        (order.email && order.email.toLowerCase().includes(q));
      const productMatch = order.items.some((item) =>
        item.product.title.toLowerCase().includes(q)
      );
      return customerMatch || productMatch;
    });
  }, [incompleteOrders, stageFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = incompleteOrders.length;
    const totalValue = incompleteOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paymentPending = incompleteOrders.filter((o) => o.stage === 'payment_pending').length;
    const checkoutEntered = incompleteOrders.filter((o) => o.stage === 'checkout_entered').length;
    return { total, totalValue, paymentPending, checkoutEntered };
  }, [incompleteOrders]);

  const handleDelete = (id: string) => {
    deleteIncompleteOrder(id);
    reload();
    if (selectedOrder?.id === id) setSelectedOrder(null);
  };

  const handleConvertToOrder = (order: IncompleteOrder) => {
    const generatedOrderId = `DSP-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullOrder: OrderDetails = {
      orderId: generatedOrderId,
      userId: order.userId,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email || 'customer@dspmart.com',
      notes: order.notes || 'Converted from incomplete order recovery',
      items: order.items,
      paymentMethod: order.paymentMethod || 'Manual Confirmation',
      totalAmount: order.totalAmount,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    saveOrderToHistory(fullOrder);
    resolveIncompleteOrder(order.phone);
    if (order.email) resolveIncompleteOrder(order.email);
    reload();
    setSelectedOrder(null);

    setActionSuccessMsg(`অর্ডার সফলভাবে মূল অর্ডারে কনভার্ট করা হয়েছে! Order ID: ${generatedOrderId}`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const generateWhatsAppReminderUrl = (order: IncompleteOrder) => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const productNames = order.items.map((i) => i.product.title).join(', ');
    const msg = `আসসালামু আলাইকুম ${order.customerName},\n\nআমরা DSP Digital Mart থেকে লক্ষ্য করেছি আপনি "${productNames}" অর্ডার করার প্রক্রিয়া শুরু করেছিলেন (মোট: ৳${order.totalAmount})।\n\nপেমেন্ট সম্পন্ন করতে বা কোনো সহায়তার প্রয়োজন হলে আমাদের জানাতে পারেন। আপনার জন্য স্পেশাল অফার বা সাপোর্ট দিতে আমরা প্রস্তুত!`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-[#0052FF]" />
            <span>Incomplete Orders & Abandoned Carts</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            যেসব কাস্টমার ফর্ম পূরণ করেও পেমেন্ট ছাড়া বের হয়ে গেছেন তাদের তথ্য ও রিকভারি সুযোগ
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Phone, Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
          />
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">মোট অসম্পূর্ণ ড্রাফট</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Total Incomplete Checkouts</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-[#0052FF]">রিকভারযোগ্য সম্ভাব্য বিক্রয়</span>
          <div className="text-2xl font-black text-[#0052FF] mt-1">৳{stats.totalValue.toLocaleString()}</div>
          <span className="text-[11px] text-blue-600/80">Potential Revenue Recovery</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700">পেমেন্ট ধাপে আটকে আছে</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats.paymentPending}</div>
          <span className="text-[11px] text-amber-600">Payment Pending Stage</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-purple-700">তথ্য দিয়ে বের হওয়া</span>
          <div className="text-2xl font-black text-purple-900 mt-1">{stats.checkoutEntered}</div>
          <span className="text-[11px] text-purple-600">Form Filled Stage</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `All Incomplete (${incompleteOrders.length})` },
          { id: 'payment_pending', label: `Payment Pending (${stats.paymentPending})` },
          { id: 'checkout_entered', label: `Form Filled (${stats.checkoutEntered})` },
          { id: 'cart_abandoned', label: 'Cart Abandoned' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStageFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              stageFilter === tab.id
                ? 'bg-[#0052FF] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table of Incomplete Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">কোনো ইনকমপ্লিট অর্ডার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">
              কোনো কাস্টমার চেকআউটে তথ্য দেওয়ার পর ক্রয় সম্পন্ন না করে পেইজ বন্ধ করলে এখানে রিকভারি লিস্ট জমা হবে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Customer Details</th>
                  <th className="px-4 py-3.5">Abandoned Items</th>
                  <th className="px-4 py-3.5">Cart Value</th>
                  <th className="px-4 py-3.5">Stage & Exit Time</th>
                  <th className="px-4 py-3.5 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-[11px]">
                        {order.phone ? (
                          <a
                            href={`tel:${order.phone}`}
                            className="flex items-center gap-1.5 font-semibold text-[#0052FF] hover:underline"
                          >
                            <Phone className="w-3 h-3 text-[#0052FF]" />
                            <span>{order.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No phone provided</span>
                        )}
                        {order.email && (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[150px]">{order.email}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-4 max-w-[280px]">
                      <div className="space-y-1.5">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate max-w-[190px]">
                                {item.product.title}
                              </p>
                              <span className="text-[10px] text-slate-500">
                                Qty: {item.quantity} {item.selectedVariation?.name ? `(${item.selectedVariation.name})` : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-[10px] font-bold text-slate-500">
                            +{order.items.length - 2} more items
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Value */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-black text-slate-900">
                        ৳{order.totalAmount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {order.paymentMethod || 'bKash'}
                      </span>
                    </td>

                    {/* Stage & Time */}
                    <td className="px-4 py-4">
                      {order.stage === 'payment_pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          পেমেন্ট ধাপে বের হয়েছে
                        </span>
                      )}
                      {order.stage === 'checkout_entered' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                          ফর্ম পূরণ করে বের হয়েছে
                        </span>
                      )}
                      {order.stage === 'cart_abandoned' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          কার্ট ড্রপ
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(order.lastUpdated).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.phone && (
                          <a
                            href={generateWhatsAppReminderUrl(order)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors shadow-2xs"
                            title="Send WhatsApp recovery message"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleConvertToOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052FF] font-bold text-[11px] border border-blue-200 transition-colors"
                          title="Convert directly to confirmed order"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Convert</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
