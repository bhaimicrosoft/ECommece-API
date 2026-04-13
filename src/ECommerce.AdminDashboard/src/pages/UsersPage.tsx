import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function UsersPage() {
  const [users, setUsers] = useState<any>({ items: [], totalCount: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/users', { params: { pageNumber: page, pageSize: 20 } })
      .then(({ data }) => { if (data.success) setUsers(data.data); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-500 mt-1">{users.totalCount} registered users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.items.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {u.firstName[0]}
                      </div>
                      <p className="font-medium text-slate-800 text-sm">{u.firstName} {u.lastName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">Loading...</div>}
        </div>
      </div>
    </div>
  );
}

