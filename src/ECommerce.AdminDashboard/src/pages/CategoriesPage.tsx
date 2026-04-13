import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setCategories(data.data);
    }).finally(() => setLoading(false));
  }, []);

  const renderCategory = (cat: any, depth = 0) => (
    <React.Fragment key={cat.id}>
      <tr className="hover:bg-slate-50 transition">
        <td className="px-6 py-4">
          <div style={{ paddingLeft: depth * 24 }} className="flex items-center gap-2">
            {depth > 0 && <span className="text-slate-300">└</span>}
            <span className="font-medium text-slate-800 text-sm">{cat.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-500">{cat.slug}</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {cat.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{cat.sortOrder}</td>
      </tr>
      {cat.subCategories?.map((sub: any) => renderCategory(sub, depth + 1))}
    </React.Fragment>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Categories</h1>
        <p className="text-slate-500 mt-1">Manage product categories</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Sort Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map(cat => renderCategory(cat))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-slate-400">Loading...</div>}
      </div>
    </div>
  );
}

