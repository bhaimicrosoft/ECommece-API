'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { formatCurrency, formatDateTime, ORDER_STATUS_COLOR } from '@/lib/utils'
import { Search, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import type { OrderStatus } from '@/types'

const STATUSES: (OrderStatus | '')[] = ['','Pending','Confirmed','Processing','Shipped','Delivered','Cancelled','ReturnRequested','Returned']

export default function OrdersPage() {
  const qc = useQueryClient()
  const [search,     setSearch]     = useState('')
  const [statusFilter, setFilter]   = useState<OrderStatus | ''>('')
  const [page,       setPage]       = useState(1)
  const [updating,   setUpdating]   = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter, page],
    queryFn:  () => ordersApi.adminList({ search: search || undefined, status: statusFilter || undefined, pageNumber: page, pageSize: 20 }).then(r => r.data.data!),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order status updated.'); setUpdating(null) },
    onError:   () => toast.error('Failed to update status.'),
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Toolbar */}
      <div className="glass rounded-xl" style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search order number, customer…"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8,
              padding:'8px 12px 8px 34px', color:'var(--text-1)', fontSize:13, outline:'none', width:'100%', fontFamily:'inherit' }} />
        </div>
        <select value={statusFilter} onChange={e => { setFilter(e.target.value as OrderStatus | ''); setPage(1) }}
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8,
            padding:'8px 12px', color:'var(--text-1)', fontSize:13, outline:'none', fontFamily:'inherit' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <span style={{ fontSize:12, color:'var(--text-3)' }}>{data?.totalCount ?? 0} orders</span>
      </div>

      <div className="glass rounded-2xl" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['Order','Customer','Items','Amount','Payment','Status','Date','Action'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'14px 16px', color:'var(--text-3)', fontWeight:500, fontSize:11, letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(10)].map((_,i) => (
                    <tr key={i}><td colSpan={8} style={{ padding:'14px 16px' }}><div className="shimmer rounded" style={{ height:18 }} /></td></tr>
                  ))
                : (data?.items ?? []).map(o => (
                    <tr key={o.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'12px 16px', color:'#a78bfa', fontWeight:600 }}>#{o.orderNumber}</td>
                      <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{o.user?.firstName} {o.user?.lastName}</td>
                      <td style={{ padding:'12px 16px', color:'var(--text-3)' }}>{o.items?.length ?? 0} items</td>
                      <td style={{ padding:'12px 16px', color:'var(--text-1)', fontWeight:600 }}>{formatCurrency(o.totalAmount)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        {o.payment && <span className="badge badge-muted" style={{ fontSize:11 }}>{o.payment.method}</span>}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span className={`badge ${ORDER_STATUS_COLOR[o.status] ?? 'badge-muted'}`}>{o.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:11, whiteSpace:'nowrap' }}>{formatDateTime(o.createdAt)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        {updating === o.id
                          ? (
                            <select autoFocus onChange={e => { updateStatus.mutate({ id: o.id, status: e.target.value as OrderStatus }) }}
                              style={{ background:'var(--bg-surface-2)', border:'1px solid rgba(124,58,237,.4)', borderRadius:7,
                                padding:'5px 8px', color:'var(--text-1)', fontSize:12, outline:'none', fontFamily:'inherit' }}>
                              <option value="">Select…</option>
                              {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          ) : (
                            <button onClick={() => setUpdating(o.id)}
                              style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7,
                                background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)',
                                color:'#a78bfa', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                              Update <ChevronDown size={10} />
                            </button>
                          )
                        }
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>Page {data.pageNumber} of {data.totalPages}</p>
            <div style={{ display:'flex', gap:8 }}>
              <button disabled={!data.hasPreviousPage} onClick={() => setPage(p => p-1)}
                style={{ padding:'6px 14px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                  color: data.hasPreviousPage ? 'var(--text-2)' : 'var(--text-3)', cursor: data.hasPreviousPage ? 'pointer' : 'not-allowed', fontSize:13, fontFamily:'inherit' }}>
                Previous
              </button>
              <button disabled={!data.hasNextPage} onClick={() => setPage(p => p+1)}
                style={{ padding:'6px 14px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                  color: data.hasNextPage ? 'var(--text-2)' : 'var(--text-3)', cursor: data.hasNextPage ? 'pointer' : 'not-allowed', fontSize:13, fontFamily:'inherit' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
