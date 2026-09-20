import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Key,
  Eye,
  Edit2,
  Copy,
  Check,
  X,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { OrderDetails } from '../../types';
import { getAdminOrders, updateOrderStatus } from '../../utils/adminStore';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderDetails[]>(() => getAdminOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  const reloadOrders = () => {
    setOrders(getAdminOrders());
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.transactionId && o.transactionId.toLowerCase().includes(q))
      );
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
    reloadOrders();
  };

  const handleSaveLicenseKey = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered', licenseKeyInput);
    reloadOrders();
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, licenseKey: licenseKeyInput, status: 'delivered' });
    }
    alert('License Key assigned and order marked as Delivered!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading">
            Order Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process customer orders, verify transaction IDs, and assign digital license keys
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Phone, TrxID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending' },
          { id: 'processing', label: 'Confirmed' },
          { id: 'delivered', label: 'Delivered' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-[#0052FF] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Orders Card View (Clean on mobile phones) */}
      <div className="block md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No orders found. Once users place orders on the website, they will appear here!
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    #{order.orderId}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <select
                  value={order.status || 'pending'}
                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    order.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : order.status === 'processing'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : order.status === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">{order.customerName}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{order.phone}</span>
                </div>
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 mt-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="line-clamp-1">
                      • {it.product.name} (x{it.quantity})
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total</span>
                  <span className="text-base font-black text-slate-900">৳{order.totalAmount}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#0052FF] uppercase">
                    {order.paymentMethod}
                  </span>
                  {order.transactionId && (
                    <div className="font-mono text-[10px] text-slate-500">
                      Trx: {order.transactionId}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setLicenseKeyInput(order.licenseKey || '');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-[#0052FF] hover:text-white text-slate-700 font-bold transition-all flex items-center justify-center gap-1.5 text-xs"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>License Key & Details</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Orders Table (Desktop view) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">ORDER ID</th>
                <th className="p-3.5">CUSTOMER</th>
                <th className="p-3.5">PRODUCT(S)</th>
                <th className="p-3.5">AMOUNT</th>
                <th className="p-3.5">PAYMENT / TRXID</th>
                <th className="p-3.5 text-center">STATUS</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No orders found. Once users place orders on the website, they will appear here!
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 font-mono">
                      #{order.orderId}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.phone}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="text-slate-800 line-clamp-1">
                            • {it.product.name} (x{it.quantity})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 font-black text-slate-900">
                      ৳{order.totalAmount}
                    </td>

                    <td className="p-3.5">
                      <div className="uppercase font-bold text-xs text-[#0052FF]">
                        {order.paymentMethod}
                      </div>
                      {order.transactionId && (
                        <div className="font-mono text-[11px] text-slate-600 font-semibold">
                          Trx: {order.transactionId}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : order.status === 'processing'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : order.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setLicenseKeyInput(order.licenseKey || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0052FF] hover:text-white text-slate-700 font-bold transition-all inline-flex items-center gap-1.5 text-xs"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Key / Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* License Key & Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
                Order #{selectedOrder.orderId}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-bold text-slate-900">{selectedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-900">{selectedOrder.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold text-[#0052FF] uppercase">
                  {selectedOrder.paymentMethod} {selectedOrder.transactionId ? `(Trx: ${selectedOrder.transactionId})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Payable:</span>
                <span className="font-extrabold text-emerald-700 text-sm">৳{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-800">
                Digital License Key / Activation Code:
              </label>
              <textarea
                rows={3}
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="Paste license key (e.g. W269N-WFGWX-YVC9B-4J6C9-T83GX) or account credentials..."
                className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-[#0052FF]"
              ></textarea>
              <p className="text-[11px] text-slate-500">
                Saving a license key will automatically mark this order as Delivered and reveal the key in the customer's dashboard.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Close
              </button>
              <button
                onClick={() => handleSaveLicenseKey(selectedOrder.orderId)}
                className="px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white font-bold"
              >
                Deliver License Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
