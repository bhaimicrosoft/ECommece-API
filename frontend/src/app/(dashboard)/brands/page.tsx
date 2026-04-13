'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { brandsApi } from '@/lib/api'
import { Tag, Plus, Pencil, Trash2, CheckCircle, XCircle, X, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Brand } from '@/types'

const schema = z.object({
  name:        z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  logoUrl:     z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

function BrandModal({ brand, onClose }: { brand?: Brand; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!brand

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: brand?.name ?? '', description: brand?.description ?? '', logoUrl: brand?.logoUrl ?? '' },
  })

  const save = useMutation({
    mutationFn: (dto: FormData) => brandsApi.create({ name: dto.name, description: dto.description, logoUrl: dto.logoUrl || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(isEdit ? 'Brand updated!' : 'Brand created!')
      onClose()
    },
    onError: () => toast.error('Failed to save brand.'),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-2xl" style={{ width: 480, padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={18} color="#f59e0b" />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)' }}>{isEdit ? 'Edit Brand' : 'New Brand'}</h2>
        </div>

        <form onSubmit={handleSubmit(d => save.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Brand Name *</label>
            <input {...register('name')} className="input-base" placeholder="e.g. Apple, Nike, Sony" />
            {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name.message}</p>}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Logo URL</label>
            <input {...register('logoUrl')} className="input-base" placeholder="https://example.com/logo.png" />
            {errors.logoUrl && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.logoUrl.message}</p>}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Description</label>
            <textarea {...register('description')} className="input-base" rows={3} placeholder="Short brand description…" />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="submit" disabled={save.isPending} style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', opacity: save.isPending ? 0.7 : 1 }}>
              {save.isPending ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Brand')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BrandsPage() {
  const [modal, setModal] = useState<{ open: boolean; brand?: Brand }>({ open: false })
  const qc = useQueryClient()

  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.list().then(r => r.data.data ?? []),
  })

  return (
    <>
      {modal.open && <BrandModal brand={modal.brand} onClose={() => setModal({ open: false })} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Manage product brands and manufacturers</p>
          </div>
          <button onClick={() => setModal({ open: true })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            <Plus size={15} /> New Brand
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Total Brands', value: brands?.length ?? 0, color: '#7c3aed' },
            { label: 'Active Brands', value: brands?.filter(b => b.isActive).length ?? 0, color: '#10b981' },
            { label: 'Inactive Brands', value: brands?.filter(b => !b.isActive).length ?? 0, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass rounded-2xl" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                {['Brand', 'Description', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} style={{ padding: 18 }}><div className="skeleton" style={{ height: 20, borderRadius: 6 }} /></td></tr>
                ))
                : brands?.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 60, textAlign: 'center' }}>
                        <Tag size={40} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No brands yet</p>
                        <button onClick={() => setModal({ open: true })} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)', color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                          Add your first brand
                        </button>
                      </td>
                    </tr>
                  )
                  : brands?.map(brand => (
                    <tr key={brand.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {brand.logoUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={brand.logoUrl} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                              : <Globe size={18} color="#f59e0b" />}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{brand.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>/{brand.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {brand.description ?? '—'}
                        </p>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {brand.isActive
                          ? <span className="badge badge-success"><CheckCircle size={10} /> Active</span>
                          : <span className="badge badge-error"><XCircle size={10} /> Inactive</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setModal({ open: true, brand })} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.2)', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pencil size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
