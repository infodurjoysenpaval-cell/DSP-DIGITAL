import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { getAdminOrders } from '../../utils/adminStore';
import { getLiveProducts } from '../../utils/adminStore';
import { getRegisteredUsers } from '../../utils/authStorage';

export const AdminOverview: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'Last 7 Days' | 'This Month' | 'All Time'>('Today');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'Monthly' | 'Last Week' | 'Yearly'>('Last Week');
  const [showMore, setShowMore] = useState(false);

  const orders = useMemo(() => getAdminOrders(), []);
  const products = useMemo(() => getLiveProducts(), []);
  const customers = useMemo(() => getRegisteredUsers(), []);

  // Compute metric numbers
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === 'delivered'), [orders]);
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending' || !o.status), [orders]);
  const confirmedOrders = useMemo(() => orders.filter((o) => o.status === 'processing'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter((o) => o.status === 'cancelled'), [orders]);

  const formatTk = (amount: number) => `৳${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header & Filter Controls Matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-main-heading">
            Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sales, order fulfillment, and revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setDateFilterOpen(!dateFilterOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter in Date</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <span>{dateFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dateFilterOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                {(['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'All Time'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setDateFilter(period);
                      setDateFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors ${
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

      {/* 8 Curved Gradient Metric Cards Matching Screenshot 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {/* 1. Today Orders (Cyan/Sky Blue) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#29B6F6] to-[#0288D1] shadow-[0_8px_20px_rgba(2,136,209,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Today Orders: {orders.length > 0 ? orders.length : 0}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            {formatTk(totalRevenue)}
          </div>
          {/* Subtle background curved decoration */}
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
            {formatTk(confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
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
            {formatTk(pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 5. Cancelled Orders (Red/Coral) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#FF5252] to-[#FF1744] shadow-[0_8px_20px_rgba(255,82,82,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Cancelled: {cancelledOrders.length}
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
            <span className="text-lg sm:text-2xl sm:text-3xl font-black tracking-tight">৳0.00</span>
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/20 text-white">
              0%
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 6. Hold Orders (Amber/Orange) */}
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

        {/* 7. Delivered Orders (Violet/Purple) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#7C4DFF] to-[#651FFF] shadow-[0_8px_20px_rgba(101,31,255,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Delivered: {deliveredOrders.length}
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            {formatTk(deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>

        {/* 8. Read Orders (Teal/Ocean) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white bg-gradient-to-br from-[#00B4D8] to-[#0077B6] shadow-[0_8px_20px_rgba(0,180,216,0.22)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2.5 sm:mb-4">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            Read Orders: 0
          </div>
          <div className="text-lg sm:text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 tracking-tight truncate">
            ৳0.00
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 pointer-events-none"></div>
        </div>
      </div>

      {/* See More Button */}
      <div className="flex justify-center pt-1">
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1.5 px-6 py-2 rounded-full border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-600 text-xs font-bold transition-all"
        >
          <span>{showMore ? 'See Less' : 'See More'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Metrics Drawer */}
      {showMore && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
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
              {formatTk(orders.length > 0 ? totalRevenue / orders.length : 1250)}
            </div>
          </div>
          <div className="p-3">
            <span className="text-xs text-slate-500 font-medium">Conversion Rate</span>
            <div className="text-xl font-bold text-blue-600 mt-1">84.6%</div>
          </div>
        </div>
      )}

      {/* Charts Section Matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Profit and Sales Revenue Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
                Profit and Sales revenue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tracking daily gross sales vs net profit</p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 text-xs font-semibold">
              {(['Monthly', 'Last Week', 'Yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
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

          {/* Graphical Analytics Bar Chart Visualization */}
          <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0 px-2">
            <div className="h-64 min-w-[380px] sm:min-w-0 flex items-end gap-3 sm:gap-6 pt-8 px-2 border-b border-slate-100 pb-3">
              {[
                { day: 'Mon', sales: 45, profit: 30, amount: '৳4,500' },
                { day: 'Tue', sales: 70, profit: 50, amount: '৳7,000' },
                { day: 'Wed', sales: 60, profit: 42, amount: '৳6,000' },
                { day: 'Thu', sales: 85, profit: 62, amount: '৳8,500' },
                { day: 'Fri', sales: 95, profit: 75, amount: '৳9,500' },
                { day: 'Sat', sales: 80, profit: 58, amount: '৳8,000' },
                { day: 'Sun', sales: 110, profit: 88, amount: '৳11,000' },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10">
                    Sales: {item.amount}
                  </div>

                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Sales bar */}
                    <div
                      style={{ height: `${item.sales}%` }}
                      className="w-full max-w-[18px] bg-gradient-to-t from-[#0052FF] to-[#00DFBA] rounded-t-md transition-all group-hover:brightness-110"
                    ></div>
                    {/* Profit bar */}
                    <div
                      style={{ height: `${item.profit}%` }}
                      className="w-full max-w-[18px] bg-gradient-to-t from-[#2ECC71] to-[#60E89E] rounded-t-md transition-all group-hover:brightness-110"
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{item.day}</span>
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

        {/* Sales by Category Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
              Sales by Category
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across product types</p>

            <div className="mt-6 space-y-4">
              {[
                { name: 'Operating Systems & Windows', percent: 42, color: 'bg-blue-500' },
                { name: 'Antivirus & Security', percent: 28, color: 'bg-emerald-500' },
                { name: 'Design & Office Tools', percent: 18, color: 'bg-blue-500' },
                { name: 'VPN & Subscriptions', percent: 12, color: 'bg-amber-500' },
              ].map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="font-bold text-slate-900">{cat.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${cat.percent}%` }}
                      className={`h-full rounded-full ${cat.color}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Fastest growing</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Windows Keys (+34%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
