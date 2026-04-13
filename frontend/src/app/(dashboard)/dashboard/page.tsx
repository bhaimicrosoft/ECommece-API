'use client'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatDateTime, ORDER_STATUS_COLOR } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, Users, AlertTriangle, Clock, DollarSign, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import Image from 'next/image'

const STAT_CARDS = [
  { key: 'totalRevenue',  label: 'Total Revenue',  icon: DollarSign,    color: '#7c3aed', glow: 'rgba(124,58,237,.3)', format: (v:number) => formatCurrency(v) },
  { key: 'totalOrders',   label: 'Total Orders',   icon: ShoppingCart,  color: '#3b82f6', glow: 'rgba(59,130,246,.3)', format: (v:number) => v.toLocaleString() },
  { key: 'totalProducts', label: 'Products',       icon: Package,       color: '#10b981', glow: 'rgba(16,185,129,.3)', format: (v:number) => v.toLocaleString() },
  { key: 'totalUsers',    label: 'Customers',      icon: Users,         color: '#f59e0b', glow: 'rgba(245,158,11,.3)', format: (v:number) => v.toLocaleString() },
]

const PIE_COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#a78bfa','#34d399']

// ── Custom tooltip for area chart ────────────────────────
function RevenueTooltip({ active, payload, label }: { active?:boolean; payload?:{ value:number }[]; label?:string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3" style={{ fontSize: 13 }}>
      <p style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#a78bfa', fontWeight: 600 }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
      {payload[1] && <p style={{ color: '#38bdf8', fontWeight: 600 }}>{payload[1].value} orders</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then(r => r.data.data!),
  })

  if (isLoading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shimmer rounded-2xl" style={{ height: 120 }} />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {STAT_CARDS.map(({ key, label, icon: Icon, color, glow, format }) => {
          const value = data ? (data as unknown as Record<string, number>)[key] ?? 0 : 0
          return (
            <div key={key} className="glass rounded-2xl"
              style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden', transition: 'transform .2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>

              {/* Glow blob */}
              <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120,
                borderRadius:'50%', background:`radial-gradient(circle, ${glow} 0%, transparent 70%)`, pointerEvents:'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 8, letterSpacing:'0.04em' }}>{label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>{format(value)}</p>
                </div>
                <div style={{ width:44, height:44, borderRadius:12,
                  background:`${color}18`, border:`1px solid ${color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={20} color={color} />
                </div>
              </div>

              <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:6 }}>
                <TrendingUp size={12} color="#10b981" />
                <span style={{ fontSize:12, color:'#10b981', fontWeight:500 }}>+12.5%</span>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Today's quick stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { icon: Zap,           label: "Today's Revenue",  value: formatCurrency(data?.todayRevenue ?? 0), color:'#a78bfa' },
          { icon: Clock,         label: "Today's Orders",   value: (data?.todayOrders ?? 0).toString(),    color:'#38bdf8' },
          { icon: AlertTriangle, label: 'Pending Orders',   value: (data?.pendingOrders ?? 0).toString(),  color:'#f59e0b' },
          { icon: Package,       label: 'Low Stock Items',  value: (data?.lowStockProducts ?? 0).toString(), color:'#ef4444' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-xl" style={{ padding: '16px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${color}12`, border:`1px solid ${color}25`,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:2 }}>{label}</p>
              <p style={{ fontSize:20, fontWeight:700, color:'var(--text-1)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* Revenue area chart */}
        <div className="glass rounded-2xl" style={{ padding:'24px' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>Revenue Overview</h3>
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:20 }}>Last 6 months</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.monthlySales ?? []} margin={{ top:5, right:5, left:0, bottom:5 }}>
              <defs>
                <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ord" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-3)' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#rv)" />
              <Area type="monotone" dataKey="orders"  stroke="#06b6d4" strokeWidth={2}   fill="url(#ord)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders bar chart */}
        <div className="glass rounded-2xl" style={{ padding:'24px' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>Monthly Orders</h3>
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:20 }}>Order count trend</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.monthlySales ?? []} barSize={18} margin={{ top:5, right:5, left:-20, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#16161f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, fontSize:12 }} />
              <Bar dataKey="orders" radius={[4,4,0,0]}>
                {(data?.monthlySales ?? []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top products + Recent orders ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>

        {/* Top products */}
        <div className="glass rounded-2xl" style={{ padding:'24px' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:18 }}>Top Products</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {(data?.topProducts ?? []).map((p, i) => (
              <div key={p.productId} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:11, color:'var(--text-3)', width:16, textAlign:'center' }}>#{i+1}</span>
                <div style={{ width:36, height:36, borderRadius:8, overflow:'hidden', flexShrink:0,
                  background:'var(--bg-surface-2)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  {p.productImageUrl && (
                    <Image src={p.productImageUrl} alt={p.productName} width={36} height={36} style={{ objectFit:'cover', width:'100%', height:'100%' }} />
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.productName}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text-3)' }}>{p.totalSold} sold</p>
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:'#a78bfa', flexShrink:0 }}>{formatCurrency(p.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="glass rounded-2xl" style={{ padding:'24px', overflow:'hidden' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:18 }}>Recent Orders</h3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  {['Order','Customer','Amount','Status','Date'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'0 10px 10px', color:'var(--text-3)', fontWeight:500, fontSize:11, letterSpacing:'0.06em', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders ?? []).map(o => (
                  <tr key={o.id} className="trow">
                    <td style={{ padding:'10px', color:'#a78bfa', fontWeight:500 }}>#{o.orderNumber}</td>
                    <td style={{ padding:'10px', color:'var(--text-2)' }}>{o.customerName}</td>
                    <td style={{ padding:'10px', color:'var(--text-1)', fontWeight:600 }}>{formatCurrency(o.totalAmount)}</td>
                    <td style={{ padding:'10px' }}>
                      <span className={`badge ${ORDER_STATUS_COLOR[o.status] ?? 'badge-muted'}`}>{o.status}</span>
                    </td>
                    <td style={{ padding:'10px', color:'var(--text-3)', fontSize:11 }}>{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
