import React, { useEffect, useState } from 'react';
import api from '../api/client';

const statusColors: Record<string, string> = {
  Requested: 'bg-yellow-100 text-yellow-800', Approved: 'bg-blue-100 text-blue-800',
  Processed: 'bg-green-100 text-green-800', Rejected: 'bg-red-100 text-red-800',
};

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = () => {
    setLoading(true);
    api.get('/refunds/all').then(({ data }) => {
      if (data.success) setRefunds(data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRefunds(); }, []);

  const processRefund = async (id: string, status: string) => {
    await api.put(`/refunds/${id}`, { status, adminNotes: `${status} by admin` });
    fetchRefunds();
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Refunds</h1>
        <p className="text-slate-500 mt-1">Manage refund requests</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refunds.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{r.orderNumber}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{fmt(r.amount)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100'}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {r.status === 'Requested' && (
                      <div className="flex gap-2">
                        <button onClick={() => processRefund(r.id, 'Processed')} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition">Approve</button>
                        <button onClick={() => processRefund(r.id, 'Rejected')} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">Loading...</div>}
          {!loading && refunds.length === 0 && <div className="p-8 text-center text-slate-400">No refund requests</div>}
        </div>
      </div>
    </div>
  );
}

