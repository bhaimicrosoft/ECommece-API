'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Search, User } from 'lucide-react'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, page],
    queryFn:  () => usersApi.list({ pageNumber: page, pageSize: 20 }).then(r => r.data.data!),
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="glass rounded-xl" style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8,
              padding:'8px 12px 8px 34px', color:'var(--text-1)', fontSize:13, outline:'none', width:'100%', fontFamily:'inherit' }} />
        </div>
        <span style={{ fontSize:12, color:'var(--text-3)' }}>{data?.totalCount ?? 0} customers</span>
      </div>

      <div className="glass rounded-2xl" style={{ overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {['Customer','Email','Phone','Role','Status','Joined'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'14px 16px', color:'var(--text-3)', fontWeight:500, fontSize:11, letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(8)].map((_,i) => <tr key={i}><td colSpan={6} style={{ padding:'14px 16px' }}><div className="shimmer rounded" style={{ height:18 }} /></td></tr>)
              : (data?.items ?? []).map(u => (
                  <tr key={u.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13, fontWeight:700, color:'#fff' }}>
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span style={{ fontWeight:500, color:'var(--text-1)' }}>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{u.email}</td>
                    <td style={{ padding:'12px 16px', color:'var(--text-3)' }}>{u.phone ?? '—'}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-purple' : 'badge-info'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:11 }}>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
