import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../api/client';

interface DashboardStats {
  totalRevenue: number; totalOrders: number; totalProducts: number; totalUsers: number;
  pendingOrders: number; lowStockProducts: number; todayRevenue: number; todayOrders: number;
  recentOrders: any[]; topProducts: any[]; monthlySales: any[];
}

function StatCard({ icon: Icon, label, value, color, sub }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-indigo-100 text-indigo-800', Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      if (data.success) setStats(data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!stats) return <div className="text-red-500">Failed to load dashboard</div>;

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(stats.totalRevenue)} color="bg-gradient-to-br from-green-500 to-green-600" sub={`Today: ${fmt(stats.todayRevenue)}`} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders.toLocaleString()} color="bg-gradient-to-br from-blue-500 to-blue-600" sub={`Today: ${stats.todayOrders}`} />
        <StatCard icon={Package} label="Products" value={stats.totalProducts} color="bg-gradient-to-br from-purple-500 to-purple-600" sub={`Low stock: ${stats.lowStockProducts}`} />
        <StatCard icon={Users} label="Customers" value={stats.totalUsers.toLocaleString()} color="bg-gradient-to-br from-orange-500 to-orange-600" sub={`Pending orders: ${stats.pendingOrders}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800 text-sm">{fmt(order.totalAmount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>{order.status}</span>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No orders yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Products</h3>
          <div className="space-y-3">
            {stats.topProducts.map((product: any, i: number) => (
              <div key={product.id} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.totalSold} sold</p>
                </div>
                <p className="font-semibold text-green-600 text-sm">{fmt(product.totalRevenue)}</p>
              </div>
            ))}
            {stats.topProducts.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No sales data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

