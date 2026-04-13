import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import api from '../api/client';

export default function ProductsPage() {
  const [products, setProducts] = useState<any>({ items: [], totalCount: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products', { params: { search, pageNumber: page, pageSize: 10 } })
      .then(({ data }) => { if (data.success) setProducts(data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 mt-1">{products.totalCount} total products</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.items.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl || 'https://placehold.co/40x40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800 text-sm">{fmt(p.discountPrice || p.price)}</p>
                    {p.discountPrice && <p className="text-xs text-slate-400 line-through">{fmt(p.price)}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${p.stockQuantity <= 10 ? 'text-red-600' : 'text-slate-700'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.categoryName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-yellow-500">★</span> {p.averageRating.toFixed(1)} ({p.reviewCount})
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">Loading...</div>}
          {!loading && products.items.length === 0 && <div className="p-8 text-center text-slate-400">No products found</div>}
        </div>

        {products.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">Page {page} of {products.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-slate-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(products.totalPages, p + 1))} disabled={page === products.totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

