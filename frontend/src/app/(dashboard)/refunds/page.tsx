'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { refundsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { RefreshCw, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, DollarSign, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Refund, RefundStatus } from '@/types'

const STATUS_STYLES: Record<RefundStatus, { bg: string; color: string; border: string; label: string }> = {
  Requested: { bg: 'rgba(245,158,11,.12)', color: '#f59e0b', border: 'rgba(245,158,11,.25)', label: 'Requested' },
  Approved:  { bg: 'rgba(16,185,129,.12)', color: '#10b981', border: 'rgba(16,185,129,.25)', label: 'Approved' },
  Processed: { bg: 'rgba(124,58,237,.12)', color: '#a78bfa', border: 'rgba(124,58,237,.25)', label: 'Processed' },
  Rejected:  { bg: 'rgba(239,68,68,.12)',  color: '#ef4444', border: 'rgba(239,68,68,.25)',  label: 'Rejected' },
}

function StatusBadge({ status }: { status: RefundStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status === 'Requested' && <Clock size={9} />}
      {status === 'Approved'  && <CheckCircle size={9} />}
      {status === 'Processed' && <CheckCircle size={9} />}
      {status === 'Rejected'  && <XCircle size={9} />}
      {s.label}
    </span>
  )
}

function ProcessModal({ refund, onClose }: { refund: Refund; onClose: () => void }) {
  const qc = useQueryClient()
  const [status, setStatus] = useState<RefundStatus>(refund.status)
  const [adminNotes, setAdminNotes] = useState(refund.adminNotes ?? '')

  const process = useMutation({
    mutationFn: () => refundsApi.process(refund.id, { status, adminNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refunds'] })
      toast.success('Refund updated!')
      onClose()
    },
    onError: () => toast.error('Failed to update refund.'),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-2xl" style={{ width: 520, padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={18} color="#a78bfa" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)' }}>Process Refund</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Order #{refund.orderNumber}</p>
          </div>
        </div>

        {/* Refund summary */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Refund Amount</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa', marginTop: 2 }}>{formatCurrency(refund.amount)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Current Status</p>
              <div style={{ marginTop: 4 }}><StatusBadge status={refund.status} /></div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Customer Reason</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{refund.reason}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>Update Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {(['Requested', 'Approved', 'Processed', 'Rejected'] as RefundStatus[]).map(s => {
                const style = STATUS_STYLES[s]
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)} style={{ padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                    background: status === s ? style.bg : 'transparent',
                    border: `1px solid ${status === s ? style.border : 'rgba(255,255,255,0.08)'}`,
                    color: status === s ? style.color : 'var(--text-3)',
                  }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Admin Notes</label>
            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="input-base" rows={3} placeholder="Internal notes about this refund decision…" />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="button" onClick={() => process.mutate()} disabled={process.isPending} style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', opacity: process.isPending ? 0.7 : 1 }}>
              {process.isPending ? 'Saving…' : 'Update Refund'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 12

export default function RefundsPage() {
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<RefundStatus | 'All'>('All')
  const [selected, setSelected] = useState<Refund | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['refunds', page],
    queryFn: () => refundsApi.list().then(r => r.data.data),
  })

  const refunds = data?.items ?? []
  const filtered = filterStatus === 'All' ? refunds : refunds.filter(r => r.status === filterStatus)
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE))

  const statusCounts = (['Requested', 'Approved', 'Processed', 'Rejected'] as RefundStatus[]).reduce((acc, s) => {
    acc[s] = refunds.filter(r => r.status === s).length
    return acc
  }, {} as Record<RefundStatus, number>)

  const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0)
  const pendingAmount = refunds.filter(r => r.status === 'Requested').reduce((sum, r) => sum + r.amount, 0)

  return (
    <>
      {selected && <ProcessModal refund={selected} onClose={() => setSelected(null)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[
            { label: 'Total Refunds', value: refunds.length, sub: '', color: '#7c3aed', icon: RefreshCw },
            { label: 'Pending', value: statusCounts.Requested ?? 0, sub: 'Awaiting review', color: '#f59e0b', icon: Clock },
            { label: 'Total Amount', value: formatCurrency(totalAmount), sub: 'All time', color: '#ef4444', icon: DollarSign },
            { label: 'Pending Amount', value: formatCurrency(pendingAmount), sub: 'Needs processing', color: '#f59e0b', icon: AlertCircle },
          ].map(({ label, value, sub, color, icon: Icon }) => (
            <div key={label} className="glass rounded-xl" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>{value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{label}</p>
              {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{sub}</p>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['All', 'Requested', 'Approved', 'Processed', 'Rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              background: filterStatus === s ? 'rgba(124,58,237,.2)' : 'transparent',
              border: `1px solid ${filterStatus === s ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,0.08)'}`,
              color: filterStatus === s ? '#a78bfa' : 'var(--text-3)',
            }}>
              {s} {s !== 'All' && statusCounts[s as RefundStatus] !== undefined && `(${statusCounts[s as RefundStatus]})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass rounded-2xl" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                {['Order', 'Reason', 'Amount', 'Status', 'Requested', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: 18 }}><div className="skeleton" style={{ height: 20, borderRadius: 6 }} /></td></tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                        <RefreshCw size={40} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No refunds found</p>
                      </td>
                    </tr>
                  )
                  : filtered.map(refund => (
                    <tr key={refund.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 18px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'monospace' }}>#{refund.orderNumber}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{refund.id.slice(0, 8).toUpperCase()}</p>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {refund.reason}
                        </p>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{formatCurrency(refund.amount)}</p>
                      </td>
                      <td style={{ padding: '14px 18px' }}><StatusBadge status={refund.status} /></td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--text-3)' }}>{formatDate(refund.createdAt)}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <button onClick={() => setSelected(refund)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                          Process
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {filtered.length} refund{filtered.length !== 1 ? 's' : ''} {filterStatus !== 'All' && `· ${filterStatus}`}
            </p>
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
    </>
  )
}
