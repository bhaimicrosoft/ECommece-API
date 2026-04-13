'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Star, CheckCircle, Trash2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReviewsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn:  () => reviewsApi.list().then(r => r.data.data!),
  })

  const approve = useMutation({
    mutationFn: (id: string) => reviewsApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews'] }); toast.success('Review approved.') },
  })

  const del = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews'] }); toast.success('Review deleted.') },
  })

  return (
    <div className="glass rounded-2xl" style={{ overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            {['Product','Reviewer','Rating','Comment','Verified','Status','Date',''].map(h => (
              <th key={h} style={{ textAlign:'left', padding:'14px 16px', color:'var(--text-3)', fontWeight:500, fontSize:11, letterSpacing:'0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(6)].map((_,i) => <tr key={i}><td colSpan={8} style={{ padding:'14px 16px' }}><div className="shimmer rounded" style={{ height:18 }} /></td></tr>)
            : (data?.items ?? []).map(r => (
                <tr key={r.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding:'12px 16px', color:'var(--text-1)', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {r.productName ?? r.productId.substring(0, 8)}
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{r.userName ?? 'User'}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} color="#f59e0b" fill={i < r.rating ? '#f59e0b' : 'transparent'} />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-3)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {r.comment ?? '—'}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    {r.isVerifiedPurchase && <span className="badge badge-success" style={{ fontSize:10 }}>Verified</span>}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span className={`badge ${r.isApproved ? 'badge-success' : 'badge-warning'}`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:11 }}>{formatDate(r.createdAt)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      {!r.isApproved && (
                        <button onClick={() => approve.mutate(r.id)} title="Approve"
                          style={{ width:28, height:28, borderRadius:7, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)',
                            color:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          <CheckCircle size={12} />
                        </button>
                      )}
                      <button onClick={() => del.mutate(r.id)} title="Delete"
                        style={{ width:28, height:28, borderRadius:7, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)',
                          color:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
