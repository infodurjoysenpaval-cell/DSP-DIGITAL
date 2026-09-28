import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Package,
  CheckSquare,
  Clock,
  XCircle,
  Hand,
  Truck,
  Mail,
  Calendar,
  ChevronDown,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { getAdminOrders } from '../../utils/adminStore';
import { getLiveProducts } from '../../utils/adminStore';
import { getRegisteredUsers, getUserOrders } from '../../utils/authStorage';
import { OrderDetails, Product } from '../../types';

export const AdminOverview: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'Last 7 Days' | 'This Month' | 'All Time'>('All Time');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'Monthly' | 'Last Week' | 'Yearly'>('Last Week');
  const [showMore, setShowMore] = useState(false);
  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    const adminOrders = getAdminOrders();
    const userOrders = getUserOrders();
    // Merge without duplicates
    const map = new Map<string, OrderDetails>();
    adminOrders.forEach((o) => map.set(o.orderId, o));
    userOrders.forEach((o) => map.set(o.orderId, o));
    return Array.from(map.values());
  });

  const products: Product[] = useMemo(() => getLiveProducts(), []);
  const customers = useMemo(() => getRegisteredUsers(), []);

  // Sync real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      const adminOrders = getAdminOrders();
      const userOrders = getUserOrders();
      const map = new Map<string, OrderDetails>();
      adminOrders.forEach((o) => map.set(o.orderId, o));
      userOrders.forEach((o) => map.set(o.orderId, o));
      setOrders(Array.from(map.values()));
    };

    window.addEventListener('dsp_orders_updated', handleUpdate);
    window.addEventListener('dsp_order_created', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Initial fetch from server
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders((prev) => {
            const map = new Map<string, OrderDetails>();
            prev.forEach((o) => map.set(o.orderId, o));
            data.forEach((o) => map.set(o.orderId, o));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('dsp_orders_updated', handleUpdate);
      window.removeEventListener('dsp_order_created', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filter orders by dateFilter
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'All Time') return orders;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return orders.filter((o) => {
      if (!o.createdAt) return true;
      const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
      if (dateFilter === 'Today') {
        return orderDateStr === todayStr;
      }
      if (dateFilter === 'Yesterday') {
        return orderDateStr === yesterdayStr;
      }
      if (dateFilter === 'Last 7 Days') {
        const diff = (now.getTime() - new Date(o.createdAt).getTime()) / 86400000;
        return diff <= 7;
      }
      if (dateFilter === 'This Month') {
        const d = new Date(o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, dateFilter]);

  // Compute metric numbers dynamically from real filtered orders
  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [filteredOrders]
  );
  const deliveredOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'delivered'),
    [filteredOrders]
  );
  const pendingOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'pending' || !o.status),
    [filteredOrders]
  );
  const confirmedOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'processing'),
    [filteredOrders]
  );
  const cancelledOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'cancelled'),
    [filteredOrders]
  );

  const formatTk = (amount: number) =>
    `৳${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // REAL DATA CALCULATION: Profit and Sales revenue
  const chartData = useMemo(() => {
    if (chartPeriod === 'Last Week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      // Map JS day index (0=Sun, 1=Mon, ..., 6=Sat) to Mon..Sun
      const daySales = [0, 0, 0, 0, 0, 0, 0];

      filteredOrders.forEach((o) => {
        if (!o.createdAt) return;
        const d = new Date(o.createdAt);
        const dayIdx = d.getDay(); // 0 is Sun
        const targetIdx = dayIdx === 0 ? 6 : dayIdx - 1; // 0=Mon, 6=Sun
        daySales[targetIdx] += o.totalAmount || 0;
      });

      const maxSale = Math.max(...daySales, 1);

      return days.map((day, idx) => {
        const sales = daySales[idx];
        const profit = Math.round(sales * 0.55); // estimated 55% net profit margin
        const salesPercent = sales > 0 ? Math.min(100, Math.max(12, Math.round((sales / maxSale) * 90))) : 0;
        const profitPercent = sales > 0 ? Math.min(100, Math.max(8, Math.round((profit / maxSale) * 90))) : 0;
        return {
          label: day,
          salesAmount: sales,
          profitAmount: profit,
          salesPercent,
          profitPercent,
        };
      });
    }

    if (chartPeriod === 'Monthly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const weekSales = [0, 0, 0, 0];

      filteredOrders.forEach((o) => {
        if (!o.createdAt) return;
        const dateNum = new Date(o.createdAt).getDate();
        const wIdx = Math.min(3, Math.floor((dateNum - 1) / 7));
        weekSales[wIdx] += o.totalAmount || 0;
      });

      const maxSale = Math.max(...weekSales, 1);

      return weeks.map((w, idx) => {
        const sales = weekSales[idx];
        const profit = Math.round(sales * 0.55);
        const salesPercent = sales > 0 ? Math.min(100, Math.max(12, Math.round((sales / maxSale) * 90))) : 0;
        const profitPercent = sales > 0 ? Math.min(100, Math.max(8, Math.round((profit / maxSale) * 90))) : 0;
        return {
          label: w,
          salesAmount: sales,
          profitAmount: profit,
          salesPercent,
          profitPercent,
        };
      });
    }

    // Yearly
    const quarters = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];
    const qSales = [0, 0, 0, 0];

    filteredOrders.forEach((o) => {
      if (!o.createdAt) return;
      const month = new Date(o.createdAt).getMonth();
      const qIdx = Math.min(3, Math.floor(month / 3));
      qSales[qIdx] += o.totalAmount || 0;
    });

    const maxSale = Math.max(...qSales, 1);

    return quarters.map((q, idx) => {
      const sales = qSales[idx];
      const profit = Math.round(sales * 0.55);
      const salesPercent = sales > 0 ? Math.min(100, Math.max(12, Math.round((sales / maxSale) * 90))) : 0;
      const profitPercent = sales > 0 ? Math.min(100, Math.max(8, Math.round((profit / maxSale) * 90))) : 0;
      return {
        label: q,
        salesAmount: sales,
        profitAmount: profit,
        salesPercent,
        profitPercent,
      };
    });
  }, [filteredOrders, chartPeriod]);

  // REAL DATA CALCULATION: Sales by Category from real ordered items
  const categoryStats = useMemo(() => {
    const categoryTotals: Record<string, number> = {
      'Operating Systems & Windows': 0,
      'Antivirus & Security': 0,
      'Design & Office Tools': 0,
      'VPN & Subscriptions': 0,
    };

    let totalItemSales = 0;

    filteredOrders.forEach((order) => {
      if (Array.isArray(order.items) && order.items.length > 0) {
        order.items.forEach((item) => {
          const itemPrice =
            item.selectedVariation?.salePrice ??
            item.product?.salePrice ??
            item.product?.regularPrice ??
            0;
          const itemTotal = itemPrice * (item.quantity || 1);
          totalItemSales += itemTotal;
          const nameLower = (item.product?.name || '').toLowerCase();

          if (nameLower.includes('windows') || nameLower.includes('os') || nameLower.includes('server')) {
            categoryTotals['Operating Systems & Windows'] += itemTotal;
          } else if (nameLower.includes('antivirus') || nameLower.includes('kaspersky') || nameLower.includes('eset') || nameLower.includes('mcafee')) {
            categoryTotals['Antivirus & Security'] += itemTotal;
          } else if (nameLower.includes('canva') || nameLower.includes('office') || nameLower.includes('claude') || nameLower.includes('chatgpt') || nameLower.includes('grammarly') || nameLower.includes('adobe')) {
            categoryTotals['Design & Office Tools'] += itemTotal;
          } else {
            categoryTotals['VPN & Subscriptions'] += itemTotal;
          }
        });
      }
    });

    // If there are real sales, compute exact percentages
    if (totalItemSales > 0) {
      const entries = [
        { name: 'Operating Systems & Windows', sales: categoryTotals['Operating Systems & Windows'], color: 'bg-blue-500' },
        { name: 'Antivirus & Security', sales: categoryTotals['Antivirus & Security'], color: 'bg-emerald-500' },
        { name: 'Design & Office Tools', sales: categoryTotals['Design & Office Tools'], color: 'bg-indigo-500' },
        { name: 'VPN & Subscriptions', sales: categoryTotals['VPN & Subscriptions'], color: 'bg-amber-500' },
      ];

      return entries.map((e) => ({
        ...e,
        percent: Math.round((e.sales / totalItemSales) * 100),
      }));
    }

    // Default real 0 state if no orders yet
    return [
      { name: 'Operating Systems & Windows', sales: 0, percent: 0, color: 'bg-blue-500' },
      { name: 'Antivirus & Security', sales: 0, percent: 0, color: 'bg-emerald-500' },
      { name: 'Design & Office Tools', sales: 0, percent: 0, color: 'bg-indigo-500' },
      { name: 'VPN & Subscriptions', sales: 0, percent: 0, color: 'bg-amber-500' },
    ];
  }, [filteredOrders]);

  // Top fastest growing category
  const topCategory = useMemo(() => {
    const sorted = [...categoryStats].sort((a, b) => b.sales - a.sales);
    if (sorted[0] && sorted[0].sales > 0) {
      return `${sorted[0].name} (${sorted[0].percent}%)`;
    }
    return 'Digital Licenses (Ready)';
  }, [categoryStats]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto antialiased">
      {/* Top Header & Filter Controls Matching Screenshot */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-main-heading">
            Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live store analytics from database
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setDateFilterOpen(!dateFilterOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter in Date</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <span>{dateFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dateFilterOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
                {(['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'All Time'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setDateFilter(period);
                      setDateFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors cursor-pointer ${
                      dateFilter === period ? 'font-bold text-[#0052FF] bg-blue-50' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8 Curved Gradient Metric Cards Matching Screenshot Exactly */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {/* 1. Today Orders (Cyan/Sky Blue) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#29B6F6] to-[#0288D1] shadow-[0_8px_20px_rgba(2,136,209,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Today Orders: {filteredOrders.length}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            {formatTk(totalRevenue)}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 2. Today Courier Orders (Pink/Rose) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#FF758C] to-[#FF7EB3] shadow-[0_8px_20px_rgba(255,117,140,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Today Courier: 0
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            ৳0.00
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 3. Confirmed Orders (Vibrant Emerald Green) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#2ECC71] to-[#27AE60] shadow-[0_8px_20px_rgba(46,204,113,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Confirmed: {confirmedOrders.length}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            {formatTk(confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 4. Pending Orders (Royal Blue/Indigo) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#536DFE] to-[#3D5AFE] shadow-[0_8px_20px_rgba(61,90,254,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Pending: {pendingOrders.length}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            {formatTk(pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 5. Cancelled Orders (Vibrant Red) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#FF5252] to-[#D32F2F] shadow-[0_8px_20px_rgba(211,47,47,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Cancelled: {cancelledOrders.length}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate flex items-center gap-1.5">
            <span>{formatTk(cancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}</span>
            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
              {filteredOrders.length > 0 ? Math.round((cancelledOrders.length / filteredOrders.length) * 100) : 0}%
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 6. Hold Orders (Warm Amber/Orange) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#FFA726] to-[#FB8C00] shadow-[0_8px_20px_rgba(251,140,0,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <Hand className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Hold Orders: 0
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            ৳0.00
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 7. Delivered Orders (Purple/Violet) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#7C4DFF] to-[#651FFF] shadow-[0_8px_20px_rgba(101,31,255,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Delivered: {deliveredOrders.length}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            {formatTk(deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 8. Read Orders (Teal/Ocean) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#00BCD4] to-[#0097A7] shadow-[0_8px_20px_rgba(0,151,167,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Read Orders: {filteredOrders.length}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            {formatTk(totalRevenue)}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>
      </div>

      {/* See More Button */}
      <div className="flex justify-center pt-1">
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1.5 px-6 py-2 rounded-full border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-600 text-xs font-bold transition-all cursor-pointer"
        >
          <span>{showMore ? 'See Less' : 'See More'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Metrics Drawer */}
      {showMore && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs animate-in fade-in">
          <div className="p-3">
            <span className="text-xs text-slate-500 font-medium">Total Store Products</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{products.length} Products</div>
          </div>
          <div className="p-3">
            <span className="text-xs text-slate-500 font-medium">Total Registered Users</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{customers.length} Customers</div>
          </div>
          <div className="p-3">
            <span className="text-xs text-slate-500 font-medium">Average Order Value</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">
              {formatTk(filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0)}
            </div>
          </div>
          <div className="p-3">
            <span className="text-xs text-slate-500 font-medium">Delivered Ratio</span>
            <div className="text-xl font-bold text-blue-600 mt-1">
              {filteredOrders.length > 0
                ? `${Math.round((deliveredOrders.length / filteredOrders.length) * 100)}%`
                : '100%'}
            </div>
          </div>
        </div>
      )}

      {/* Real Charts Section: Profit and Sales Revenue + Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Profit and Sales Revenue Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
                Profit and Sales revenue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracking real sales from database ({chartPeriod})
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 text-xs font-semibold">
              {(['Monthly', 'Last Week', 'Yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartPeriod === period
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Real Analytics Bar Chart Visualization */}
          <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0 px-2">
            <div className="h-64 min-w-[380px] sm:min-w-0 flex items-end gap-3 sm:gap-6 pt-8 px-2 border-b border-slate-100 pb-3">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-10 font-mono">
                    Sales: ৳{item.salesAmount.toLocaleString()} · Profit: ৳{item.profitAmount.toLocaleString()}
                  </div>

                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Sales bar */}
                    <div
                      style={{ height: `${item.salesPercent}%` }}
                      className={`w-full max-w-[18px] bg-gradient-to-t from-[#0052FF] to-[#00DFBA] rounded-t-md transition-all group-hover:brightness-110 ${
                        item.salesPercent === 0 ? 'h-1 bg-slate-100' : ''
                      }`}
                    ></div>
                    {/* Profit bar */}
                    <div
                      style={{ height: `${item.profitPercent}%` }}
                      className={`w-full max-w-[18px] bg-gradient-to-t from-[#2ECC71] to-[#60E89E] rounded-t-md transition-all group-hover:brightness-110 ${
                        item.profitPercent === 0 ? 'h-1 bg-slate-100' : ''
                      }`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#0052FF]"></span>
              <span className="text-slate-600">Total Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#2ECC71]"></span>
              <span className="text-slate-600">Net Profit</span>
            </div>
          </div>
        </div>

        {/* Real Sales by Category Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
              Sales by Category
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real distribution from order items</p>

            <div className="mt-6 space-y-4">
              {categoryStats.map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="font-bold text-slate-900">{cat.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(cat.percent, 0)}%` }}
                      className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Fastest growing</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1 truncate max-w-[200px]">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{topCategory}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
