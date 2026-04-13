import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
          <div />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {(user.firstName?.[0] || 'A').toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

