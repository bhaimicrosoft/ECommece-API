'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pencil, Trash2, Star, Search, Filter, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function ProductsPage() {
  const qc = useQueryClient()
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, page],
    queryFn:  () => productsApi.list({ search: search || undefined, pageNumber: page, pageSize: 15 }).then(r => r.data.data!),
  })

  const del = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted.') },
    onError:    () => toast.error('Failed to delete product.'),
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Toolbar */}
      <div className="glass rounded-xl" style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products, SKU, tags…"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:8, padding:'8px 12px 8px 34px',
              color:'var(--text-1)', fontSize:13, outline:'none', width:'100%', fontFamily:'inherit' }} />
        </div>
        <button style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 14px', borderRadius:8,
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
          color:'var(--text-2)', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          <Filter size={13} /> Filter
        </button>
        <span style={{ fontSize:12, color:'var(--text-3)' }}>
          {data?.totalCount ?? 0} products
        </span>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['Product','SKU','Category','Price','Stock','Status','Rating','Added',''].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'14px 16px', color:'var(--text-3)', fontWeight:500, fontSize:11, letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}><td colSpan={9} style={{ padding:'14px 16px' }}>
                      <div className="shimmer rounded" style={{ height:18 }} />
                    </td></tr>
                  ))
                : (data?.items ?? []).map((p: Product) => (
                    <tr key={p.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      {/* Product */}
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', flexShrink:0,
                            background:'var(--bg-surface-2)', border:'1px solid rgba(255,255,255,0.07)' }}>
                            {p.imageUrl
                              ? <Image src={p.imageUrl} alt={p.name} width={44} height={44} style={{ objectFit:'cover', width:'100%', height:'100%' }} />
                              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={18} color="var(--text-3)" /></div>}
                          </div>
                          <div>
                            <p style={{ fontWeight:600, color:'var(--text-1)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                            {p.isFeatured && <span className="badge badge-purple" style={{ fontSize:10, padding:'1px 7px' }}>Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--text-3)', fontFamily:'monospace', fontSize:12 }}>{p.sku}</td>
                      <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{p.categoryName}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div>
                          <p style={{ color:'var(--text-1)', fontWeight:600 }}>{formatCurrency(p.discountPrice ?? p.price)}</p>
                          {p.discountPrice && <p style={{ color:'var(--text-3)', textDecoration:'line-through', fontSize:11 }}>{formatCurrency(p.price)}</p>}
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span className={`badge ${p.stockQuantity <= 0 ? 'badge-danger' : p.stockQuantity <= p.lowStockThreshold ? 'badge-warning' : 'badge-success'}`}>
                          {p.stockQuantity <= 0 ? 'Out of stock' : p.stockQuantity <= p.lowStockThreshold ? `Low: ${p.stockQuantity}` : p.stockQuantity}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-muted'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <span style={{ color:'var(--text-2)' }}>{p.averageRating.toFixed(1)}</span>
                          <span style={{ color:'var(--text-3)', fontSize:11 }}>({p.reviewCount})</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:11 }}>{formatDate(p.createdAt)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <Link href={`/products/${p.id}/edit`}>
                            <button title="Edit" style={{ width:30, height:30, borderRadius:7, background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.2)',
                              color:'#a78bfa', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                              <Pencil size={12} />
                            </button>
                          </Link>
                          <button onClick={() => { if (confirm('Delete this product?')) del.mutate(p.id) }}
                            title="Delete" style={{ width:30, height:30, borderRadius:7, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)',
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

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>
              Page {data.pageNumber} of {data.totalPages} · {data.totalCount} products
            </p>
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
