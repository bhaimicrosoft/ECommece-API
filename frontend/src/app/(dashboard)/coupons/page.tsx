'use client'
import { useQuery } from '@tanstack/react-query'
import { couponsApi } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Ticket, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CouponsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn:  () => couponsApi.list().then(r => r.data.data ?? []),
  })

  return (
    <div className="glass rounded-2xl" style={{ overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            {['Code','Type','Discount','Min Order','Uses','Status','Expiry',''].map(h => (
              <th key={h} style={{ textAlign:'left', padding:'14px 16px', color:'var(--text-3)', fontWeight:500, fontSize:11, letterSpacing:'0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={8} style={{ padding:'14px 16px' }}><div className="shimmer rounded" style={{ height:18 }} /></td></tr>)
            : (data ?? []).map(c => (
                <tr key={c.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Ticket size={14} color="#a78bfa" />
                      <span style={{ fontWeight:700, color:'#a78bfa', fontFamily:'monospace' }}>{c.code}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span className="badge badge-info">{c.discountType}</span>
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-1)', fontWeight:600 }}>
                    {c.discountType === 'Percentage' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{formatCurrency(c.minOrderAmount)}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{c.currentUses}/{c.maxUses}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-muted'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:11 }}>{formatDate(c.expiryDate)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button title="Edit" style={{ width:28, height:28, borderRadius:7, background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.2)',
                        color:'#a78bfa', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => toast.error('Delete coupon not implemented.')} title="Delete"
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
