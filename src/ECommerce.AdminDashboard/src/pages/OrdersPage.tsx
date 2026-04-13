import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/client';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-indigo-100 text-indigo-800', Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800',
  ReturnRequested: 'bg-orange-100 text-orange-800', Returned: 'bg-gray-100 text-gray-800',
};

const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any>({ items: [], totalCount: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders', { params: { search, status: statusFilter || undefined, pageNumber: page, pageSize: 15 } })
      .then(({ data }) => { if (data.success) setOrders(data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

  const updateStatus = async (orderId: string, status: string) => {
    await api.put(`/admin/orders/${orderId}/status`, { status, trackingNumber: status === 'Shipped' ? `TRK-${Date.now()}` : null });
    fetchOrders();
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
        <p className="text-slate-500 mt-1">{orders.totalCount} total orders</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Items</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.items.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-blue-600 text-sm">{o.orderNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{o.items?.length || 0} items</td>
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{fmt(o.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100'}`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">Loading...</div>}
          {!loading && orders.items.length === 0 && <div className="p-8 text-center text-slate-400">No orders found</div>}
        </div>

        {orders.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">Page {page} of {orders.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(orders.totalPages, p + 1))} disabled={page === orders.totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

