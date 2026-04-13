'use client'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Package,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

function StatCard({ label, value, sub, up, icon: Icon, color }: {
  label: string; value: string; sub: string; up: boolean; icon: React.ElementType; color: string
}) {
  return (
    <div className="glass rounded-2xl" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `${color}18`, filter: 'blur(20px)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: up ? '#10b981' : '#ef4444' }}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {sub}
        </div>
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{label}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(20px)' }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.dataKey === 'revenue' || p.dataKey === 'value' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then(r => r.data.data),
  })

  const monthly = stats?.monthlySales ?? []
  const topProds = stats?.topProducts ?? []

  const pieData = topProds.slice(0, 5).map(p => ({
    name: p.productName.length > 18 ? p.productName.slice(0, 18) + '…' : p.productName,
    value: p.totalRevenue,
  }))

  const conversionData = monthly.map(m => ({
    month: m.month,
    orders: m.orders,
    revenue: m.revenue,
    avg: m.orders > 0 ? Math.round(m.revenue / m.orders) : 0,
  }))

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl skeleton" style={{ height: 120 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} sub="+12.5% vs last month" up icon={DollarSign} color="#7c3aed" />
        <StatCard label="Total Orders"  value={(stats?.totalOrders ?? 0).toLocaleString()} sub="+8.2% vs last month" up icon={ShoppingCart} color="#06b6d4" />
        <StatCard label="Total Customers" value={(stats?.totalUsers ?? 0).toLocaleString()} sub="+5.1% vs last month" up icon={Users} color="#10b981" />
        <StatCard label="Avg Order Value" value={formatCurrency(stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders) : 0)} sub="-2.3% vs last month" up={false} icon={TrendingUp} color="#f59e0b" />
      </div>

      {/* Revenue trend + Orders bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Revenue Over Time</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Monthly revenue trend</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['1M', '3M', '6M', '1Y'].map(p => (
                <button key={p} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: p === '6M' ? 'rgba(124,58,237,.2)' : 'transparent',
                  border: p === '6M' ? '1px solid rgba(124,58,237,.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: p === '6M' ? '#a78bfa' : 'var(--text-3)', cursor: 'pointer' }}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by product - pie */}
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Revenue by Product</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Top 5 products</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {pieData.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders trend + Avg order value */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Monthly Orders</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Order volume by month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
                </linearGradient>
              </defs>
              <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Average Order Value</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Per-order revenue trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={conversionData}>
              <defs>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2.5} fill="url(#avgGrad)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products table */}
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Top Performing Products</h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>By total revenue generated</p>
          </div>
          <Package size={18} color="var(--text-3)" />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['#', 'Product', 'Units Sold', 'Revenue', 'Avg Price', 'Share'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topProds.map((p, i) => {
              const share = stats?.totalRevenue ? Math.round((p.totalRevenue / stats.totalRevenue) * 100) : 0
              return (
                <tr key={p.productId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-3)', fontWeight: 700 }}>#{i + 1}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {p.productImageUrl
                          ? <img src={p.productImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                          : <Package size={14} color="#7c3aed" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{p.productName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-2)' }}>{p.totalSold.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>{formatCurrency(p.totalRevenue)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-2)' }}>{formatCurrency(p.totalSold > 0 ? p.totalRevenue / p.totalSold : 0)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ width: `${share}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', minWidth: 30 }}>{share}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, color: '#f59e0b', icon: ShoppingCart, note: 'Awaiting fulfillment' },
          { label: 'Low Stock Products', value: stats?.lowStockProducts ?? 0, color: '#ef4444', icon: Package, note: 'Below threshold' },
          { label: "Today's Orders", value: stats?.todayOrders ?? 0, color: '#06b6d4', icon: TrendingUp, note: "Since midnight" },
        ].map(({ label, value, color, icon: Icon, note }) => (
          <div key={label} className="glass rounded-2xl" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>{value.toLocaleString()}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 4 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{note}</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
