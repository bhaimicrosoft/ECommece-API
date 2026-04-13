'use client'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Archive, AlertTriangle, TrendingDown, Package, Search, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0)        return <span className="badge badge-error">Out of Stock</span>
  if (qty <= threshold) return <span className="badge badge-warning">Low Stock</span>
  return <span className="badge badge-success">In Stock</span>
}

function InlineEdit({ productId, currentStock, onDone }: { productId: string; currentStock: number; onDone: () => void }) {
  const qc = useQueryClient()
  const [value, setValue] = useState(String(currentStock))

  const save = useMutation({
    mutationFn: () => productsApi.update(productId, { stockQuantity: parseInt(value) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products-inventory'] })
      toast.success('Stock updated!')
      onDone()
    },
    onError: () => toast.error('Failed to update stock.'),
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="number" value={value} onChange={e => setValue(e.target.value)}
        style={{ width: 80, padding: '5px 8px', borderRadius: 7, background: 'var(--bg-surface-2)', border: '1px solid rgba(124,58,237,.4)', color: 'var(--text-1)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        autoFocus onKeyDown={e => { if (e.key === 'Enter') save.mutate(); if (e.key === 'Escape') onDone() }}
      />
      <button type="button" onClick={() => save.mutate()} disabled={save.isPending}
        style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={12} />
      </button>
      <button type="button" onClick={onDone}
        style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={12} />
      </button>
    </div>
  )
}

const PAGE_SIZE = 15

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products-inventory'],
    queryFn: () => productsApi.list({ pageSize: 200 }).then(r => r.data.data?.items ?? []),
  })

  const filtered = useMemo(() => {
    let list = data ?? []
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    if (filter === 'low') list = list.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold)
    if (filter === 'out') list = list.filter(p => p.stockQuantity === 0)
    return list
  }, [data, search, filter])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const outOfStock  = (data ?? []).filter(p => p.stockQuantity === 0).length
  const lowStock    = (data ?? []).filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length
  const totalValue  = (data ?? []).reduce((sum, p) => sum + (p.stockQuantity * (p.discountPrice ?? p.price)), 0)
  const totalUnits  = (data ?? []).reduce((sum, p) => sum + p.stockQuantity, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Products', value: (data?.length ?? 0).toLocaleString(), color: '#7c3aed', icon: Package, sub: 'In catalog' },
          { label: 'Total Units', value: totalUnits.toLocaleString(), color: '#06b6d4', icon: Archive, sub: 'Across all SKUs' },
          { label: 'Low Stock', value: lowStock, color: '#f59e0b', icon: AlertTriangle, sub: 'Below threshold' },
          { label: 'Out of Stock', value: outOfStock, color: '#ef4444', icon: TrendingDown, sub: 'Needs restock' },
        ].map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} className="glass rounded-xl" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: `${color}15`, filter: 'blur(15px)' }} />
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={16} color={color} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>{value}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{label}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Inventory value banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,.12), rgba(6,182,212,.08))', border: '1px solid rgba(124,58,237,.2)', borderRadius: 14, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Total Inventory Value</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.5px', marginTop: 2 }}>{formatCurrency(totalValue)}</p>
        </div>
        <Archive size={40} color="rgba(124,58,237,.3)" />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} color="var(--text-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-base" placeholder="Search by name or SKU…"
            style={{ paddingLeft: 36, width: '100%' }} />
        </div>
        {(['all', 'low', 'out'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: filter === f ? 'rgba(124,58,237,.2)' : 'transparent',
            border: `1px solid ${filter === f ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,0.08)'}`,
            color: filter === f ? '#a78bfa' : 'var(--text-3)' }}>
            {f === 'all' ? 'All Products' : f === 'low' ? '⚠ Low Stock' : '✕ Out of Stock'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Threshold', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={8} style={{ padding: 18 }}><div className="skeleton" style={{ height: 20, borderRadius: 6 }} /></td></tr>
              ))
              : paged.length === 0
                ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 60, textAlign: 'center' }}>
                      <Archive size={40} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No products found</p>
                    </td>
                  </tr>
                )
                : paged.map((product: Product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                          {product.imageUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={14} color="var(--text-3)" style={{ margin: '11px auto', display: 'block' }} />}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{product.sku}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>{product.categoryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{formatCurrency(product.discountPrice ?? product.price)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {editingId === product.id
                        ? <InlineEdit productId={product.id} currentStock={product.stockQuantity} onDone={() => setEditingId(null)} />
                        : (
                          <span style={{ fontSize: 14, fontWeight: 800, color: product.stockQuantity === 0 ? '#ef4444' : product.stockQuantity <= product.lowStockThreshold ? '#f59e0b' : 'var(--text-1)' }}>
                            {product.stockQuantity.toLocaleString()}
                          </span>
                        )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-3)' }}>{product.lowStockThreshold}</td>
                    <td style={{ padding: '12px 16px' }}><StockBadge qty={product.stockQuantity} threshold={product.lowStockThreshold} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      {editingId !== product.id && (
                        <button onClick={() => setEditingId(product.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                          <Edit2 size={11} /> Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ padding: '0 12px', lineHeight: '32px', fontSize: 12, color: 'var(--text-2)' }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
