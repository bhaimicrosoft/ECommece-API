import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/coupons').then(({ data }) => {
      if (data.success) setCoupons(data.data);
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Coupons</h1>
        <p className="text-slate-500 mt-1">Manage discount coupons</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Min Order</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">{c.code}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {c.discountType === 'Percentage' ? `${c.discountValue}%` : fmt(c.discountValue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.minOrderAmount ? fmt(c.minOrderAmount) : '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.currentUses} / {c.maxUses}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">Loading...</div>}
          {!loading && coupons.length === 0 && <div className="p-8 text-center text-slate-400">No coupons found</div>}
        </div>
      </div>
    </div>
  );
}

