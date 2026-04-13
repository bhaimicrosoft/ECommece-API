'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { productsApi, categoriesApi, brandsApi } from '@/lib/api'
import { slugify } from '@/lib/utils'
import { Package, DollarSign, Archive, Globe, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  name:              z.string().min(2, 'Name is required'),
  sku:               z.string().min(1, 'SKU is required'),
  description:       z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription:  z.string().optional(),
  price:             z.coerce.number().positive('Price must be positive'),
  discountPrice:     z.coerce.number().optional().nullable(),
  stockQuantity:     z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  weight:            z.coerce.number().min(0),
  categoryId:        z.string().min(1, 'Category is required'),
  brandId:           z.string().min(1, 'Brand is required'),
  isFeatured:        z.boolean().default(false),
  isActive:          z.boolean().default(true),
  metaTitle:         z.string().optional(),
  metaDescription:   z.string().optional(),
})
type FormData = z.infer<typeof schema>

function Section({ icon: Icon, title, color, children }: { icon: React.ElementType; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: '#ef4444' }}>{error}</p>}
    </div>
  )
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productsApi.get(params.id).then(r => r.data.data),
    enabled: !!params.id,
  })

  const { data: cats }   = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list().then(r => r.data.data ?? []) })
  const { data: brands } = useQuery({ queryKey: ['brands'],     queryFn: () => brandsApi.list().then(r => r.data.data ?? []) })

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (product) {
      reset({
        name:              product.name,
        sku:               product.sku,
        description:       product.description,
        shortDescription:  product.shortDescription ?? '',
        price:             product.price,
        discountPrice:     product.discountPrice ?? undefined,
        stockQuantity:     product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        weight:            product.weight,
        categoryId:        product.categoryId,
        brandId:           product.brandId,
        isFeatured:        product.isFeatured,
        isActive:          product.isActive,
        metaTitle:         product.metaTitle ?? '',
        metaDescription:   product.metaDescription ?? '',
      } as FormData)
    }
  }, [product, reset])

  const nameVal = watch('name')

  const update = useMutation({
    mutationFn: (dto: Partial<FormData>) => productsApi.update(params.id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product', params.id] })
      toast.success('Product updated successfully!')
      router.push('/products')
    },
    onError: () => toast.error('Failed to update product.'),
  })

  const onSubmit = (data: FormData) => update.mutate(data)

  if (loadingProduct) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Loader2 size={32} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Loading product…</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <Section icon={Package} title="Basic Information" color="#7c3aed">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                <Field label="Product Name *" error={errors.name?.message}>
                  <input {...register('name')} className="input-base" />
                </Field>
                <Field label="SKU *" error={errors.sku?.message}>
                  <input {...register('sku')} className="input-base" style={{ fontFamily: 'monospace' }} />
                </Field>
              </div>
              <Field label="Slug">
                <div style={{ padding: '9px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                  /{slugify(nameVal || '')}
                </div>
              </Field>
              <Field label="Short Description">
                <input {...register('shortDescription')} className="input-base" />
              </Field>
              <Field label="Full Description *" error={errors.description?.message}>
                <textarea {...register('description')} className="input-base" rows={6} style={{ minHeight: 140 }} />
              </Field>
            </div>
          </Section>

          <Section icon={DollarSign} title="Pricing" color="#10b981">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <Field label="Regular Price (₹) *" error={errors.price?.message}>
                <input {...register('price')} type="number" step="0.01" className="input-base" />
              </Field>
              <Field label="Discount Price (₹)">
                <input {...register('discountPrice')} type="number" step="0.01" className="input-base" />
              </Field>
              <Field label="Weight (kg)">
                <input {...register('weight')} type="number" step="0.01" className="input-base" />
              </Field>
            </div>
          </Section>

          <Section icon={Archive} title="Inventory" color="#3b82f6">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
              <Field label="Stock Quantity *" error={errors.stockQuantity?.message}>
                <input {...register('stockQuantity')} type="number" className="input-base" />
              </Field>
              <Field label="Low Stock Threshold">
                <input {...register('lowStockThreshold')} type="number" className="input-base" />
              </Field>
            </div>
          </Section>

          <Section icon={Globe} title="SEO & Meta" color="#06b6d4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Meta Title">
                <input {...register('metaTitle')} className="input-base" placeholder="SEO page title (max 60 chars)" />
              </Field>
              <Field label="Meta Description">
                <textarea {...register('metaDescription')} className="input-base" rows={3} />
              </Field>
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

          {/* Status toggles */}
          <div className="glass rounded-2xl" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'isActive', label: 'Active', desc: 'Visible in store' },
                { name: 'isFeatured', label: 'Featured', desc: 'Show on homepage' },
              ].map(({ name, label, desc }) => (
                <label key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</p>
                  </div>
                  <input type="checkbox" {...register(name as keyof FormData)} style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />
                </label>
              ))}
            </div>
          </div>

          {/* Category & Brand */}
          <div className="glass rounded-2xl" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Organisation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Category *" error={errors.categoryId?.message}>
                <select {...register('categoryId')} className="input-base">
                  <option value="">Select category</option>
                  {cats?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Brand *" error={errors.brandId?.message}>
                <select {...register('brandId')} className="input-base">
                  <option value="">Select brand</option>
                  {brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Actions */}
          <button type="submit" disabled={update.isPending} style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', border: 'none', color: '#fff', cursor: update.isPending ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', opacity: update.isPending ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {update.isPending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/products')} style={{ padding: '12px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
            Cancel
          </button>
        </div>

      </div>
    </form>
  )
}
