'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { productsApi, categoriesApi, brandsApi } from '@/lib/api'
import { slugify } from '@/lib/utils'
import { Upload, X, Plus, Trash2, Globe, Package, DollarSign, Archive, Tag, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProductAttribute, ProductVariant } from '@/types'

// ── Zod schema ────────────────────────────────────────────
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

// ── Tag input component ───────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput('') }
  }
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:10, borderRadius:8,
      background:'var(--bg-surface-2)', border:'1px solid var(--border)', minHeight:44 }}>
      {tags.map(t => (
        <span key={t} className="tag-chip">
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} style={{ background:'none', border:'none', cursor:'pointer', color:'#a78bfa', lineHeight:1, padding:0 }}>×</button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        placeholder="Type and press Enter…"
        style={{ border:'none', outline:'none', background:'transparent', color:'var(--text-1)', fontSize:13, minWidth:120, fontFamily:'inherit' }} />
    </div>
  )
}

// ── Image uploader ────────────────────────────────────────
function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const onDrop = useCallback((files: File[]) => {
    const newImgs: string[] = []
    let count = 0
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        newImgs.push(reader.result as string)
        count++
        if (count === files.length) onChange([...images, ...newImgs])
      }
      reader.readAsDataURL(file)
    })
  }, [onChange, images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true,
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? 'rgba(124,58,237,.6)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius:12, padding:'28px 20px', textAlign:'center', cursor:'pointer',
        background: isDragActive ? 'rgba(124,58,237,.07)' : 'rgba(255,255,255,0.02)',
        transition:'all .2s',
      }}>
        <input {...getInputProps()} />
        <Upload size={28} color={isDragActive ? '#a78bfa' : 'var(--text-3)'} style={{ margin:'0 auto 10px' }} />
        <p style={{ color: isDragActive ? '#a78bfa' : 'var(--text-2)', fontSize:13, fontWeight:500 }}>
          {isDragActive ? 'Drop images here…' : 'Drag & drop images or click to browse'}
        </p>
        <p style={{ color:'var(--text-3)', fontSize:11, marginTop:4 }}>PNG, JPG, WebP — max 5MB each</p>
      </div>

      {images.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(80px, 1fr))', gap:8 }}>
          {images.map((src, i) => (
            <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden',
              border: i===0 ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.08)', aspectRatio:'1' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              {i === 0 && (
                <span style={{ position:'absolute', top:4, left:4, fontSize:9, fontWeight:700,
                  background:'#7c3aed', color:'#fff', padding:'2px 6px', borderRadius:4 }}>MAIN</span>
              )}
              <button onClick={() => onChange(images.filter((_, j) => j !== i))}
                style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%',
                  background:'rgba(239,68,68,.85)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={10} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Attribute row (extracted to follow rules of hooks) ───
function AttributeRow({ attr, index, onUpdate, onRemove, onAddValue, onRemoveValue }: {
  attr: ProductAttribute
  index: number
  onUpdate: (i: number, key: 'name' | 'values', val: string | string[]) => void
  onRemove: (i: number) => void
  onAddValue: (i: number, val: string) => void
  onRemoveValue: (ai: number, vi: number) => void
}) {
  const [attrInput, setAttrInput] = useState('')
  return (
    <div className="glass rounded-xl" style={{ padding:16 }}>
      <div style={{ display:'flex', gap:10, marginBottom:10 }}>
        <input value={attr.name} onChange={e => onUpdate(index, 'name', e.target.value)}
          placeholder="Attribute name (e.g. Color, Size)"
          className="input-base" style={{ flex:1 }} />
        <button type="button" onClick={() => onRemove(index)}
          style={{ width:36, height:38, borderRadius:8, background:'rgba(239,68,68,.12)',
            border:'1px solid rgba(239,68,68,.2)', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Trash2 size={14} />
        </button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:8 }}>
        {attr.values.map((v, vi) => (
          <span key={vi} className="tag-chip">
            {v}
            <button type="button" onClick={() => onRemoveValue(index, vi)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a78bfa', lineHeight:1, padding:0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <input value={attrInput} onChange={e => setAttrInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddValue(index, attrInput); setAttrInput('') } }}
          placeholder="Add value and press Enter…" className="input-base" style={{ flex:1 }} />
        <button type="button" onClick={() => { onAddValue(index, attrInput); setAttrInput('') }}
          style={{ padding:'0 14px', borderRadius:8, background:'rgba(124,58,237,.15)',
            border:'1px solid rgba(124,58,237,.3)', color:'#a78bfa', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
          Add
        </button>
      </div>
    </div>
  )
}

// ── Variant builder ───────────────────────────────────────
function VariantBuilder({ attributes, onChange }: { attributes: ProductAttribute[]; onChange: (a: ProductAttribute[]) => void }) {
  const [variants, setVariants] = useState<ProductVariant[]>([])

  const addAttribute = () => onChange([...attributes, { name: '', values: [] }])

  const updateAttr = (i: number, key: 'name' | 'values', val: string | string[]) => {
    const next = attributes.map((a, j) => j === i ? { ...a, [key]: val } : a)
    onChange(next)
    generateVariants(next)
  }

  const addValue = (i: number, val: string) => {
    if (!val.trim()) return
    const next = attributes.map((a, j) => j === i ? { ...a, values: [...a.values, val.trim()] } : a)
    onChange(next)
    generateVariants(next)
  }

  const removeValue = (ai: number, vi: number) => {
    const next = attributes.map((a, j) => j === ai ? { ...a, values: a.values.filter((_, k) => k !== vi) } : a)
    onChange(next)
    generateVariants(next)
  }

  const generateVariants = (attrs: ProductAttribute[]) => {
    const valid = attrs.filter(a => a.name && a.values.length)
    if (!valid.length) { setVariants([]); return }
    const combos = valid.reduce<Record<string, string>[]>((acc, attr) =>
      acc.flatMap(c => attr.values.map(v => ({ ...c, [attr.name]: v }))), [{}])
    setVariants(prev => combos.map(combo => {
      const key = Object.values(combo).join('-')
      const ex  = prev.find(p => Object.values(p.combination).join('-') === key)
      return ex ?? { combination: combo, sku: key.toLowerCase(), price: 0, stock: 0 }
    }))
  }

  const updateVariant = (i: number, key: keyof ProductVariant, val: string | number) => {
    setVariants(v => v.map((x, j) => j === i ? { ...x, [key]: val } : x))
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {attributes.map((attr, i) => (
        <AttributeRow
          key={i}
          attr={attr}
          index={i}
          onUpdate={updateAttr}
          onRemove={j => onChange(attributes.filter((_, k) => k !== j))}
          onAddValue={addValue}
          onRemoveValue={removeValue}
        />
      ))}

      <button onClick={addAttribute} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        padding:'10px', borderRadius:10, border:'1px dashed rgba(255,255,255,0.12)',
        background:'transparent', color:'var(--text-2)', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
        <Plus size={14} /> Add Attribute
      </button>

      {/* Variant matrix */}
      {variants.length > 0 && (
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--text-2)', marginBottom:10 }}>
            Generated Variants ({variants.length})
          </p>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ textAlign:'left', padding:'8px 10px', color:'var(--text-3)', fontWeight:500 }}>Combination</th>
                  <th style={{ textAlign:'left', padding:'8px 10px', color:'var(--text-3)', fontWeight:500 }}>SKU</th>
                  <th style={{ textAlign:'left', padding:'8px 10px', color:'var(--text-3)', fontWeight:500 }}>Price (₹)</th>
                  <th style={{ textAlign:'left', padding:'8px 10px', color:'var(--text-3)', fontWeight:500 }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'8px 10px', color:'var(--text-1)' }}>
                      {Object.entries(v.combination).map(([k, val]) => (
                        <span key={k} className="tag-chip" style={{ marginRight:4, fontSize:11 }}>{k}: {val}</span>
                      ))}
                    </td>
                    <td style={{ padding:'8px 10px' }}>
                      <input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                        style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 8px',
                          color:'var(--text-1)', fontSize:12, width:120, outline:'none', fontFamily:'monospace' }} />
                    </td>
                    <td style={{ padding:'8px 10px' }}>
                      <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', parseFloat(e.target.value))}
                        style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 8px',
                          color:'var(--text-1)', fontSize:12, width:90, outline:'none', fontFamily:'inherit' }} />
                    </td>
                    <td style={{ padding:'8px 10px' }}>
                      <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value))}
                        style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 8px',
                          color:'var(--text-1)', fontSize:12, width:80, outline:'none', fontFamily:'inherit' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section card ──────────────────────────────────────────
function Section({ icon: Icon, title, color, children }: { icon: React.ElementType; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl" style={{ padding:'24px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:`${color}15`, border:`1px solid ${color}25`,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={16} color={color} />
        </div>
        <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-1)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:12, fontWeight:500, color:'var(--text-2)' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize:11, color:'#ef4444' }}>{error}</p>}
    </div>
  )
}

// ── Main form page ────────────────────────────────────────
export default function NewProductPage() {
  const router = useRouter()
  const qc     = useQueryClient()
  const [tags,       setTags]       = useState<string[]>([])
  const [images,     setImages]     = useState<string[]>([])
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [status,     setStatus]     = useState<'Active' | 'Draft' | 'Archived'>('Active')

  const { data: cats }   = useQuery({ queryKey:['categories'], queryFn: () => categoriesApi.list().then(r => r.data.data ?? []) })
  const { data: brands } = useQuery({ queryKey:['brands'],     queryFn: () => brandsApi.list().then(r => r.data.data ?? []) })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isFeatured: false, isActive: true, lowStockThreshold: 10, stockQuantity: 0, weight: 0 },
  })

  const nameVal = watch('name')

  const create = useMutation({
    mutationFn: (dto: object) => productsApi.create(dto as Parameters<typeof productsApi.create>[0]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully!')
      router.push('/products')
    },
    onError: () => toast.error('Failed to create product. Check all required fields.'),
  })

  const onSubmit = (data: FormData) => {
    create.mutate({
      ...data,
      imageUrl:  images[0] ?? null,
      images:    images.length > 1 ? JSON.stringify(images.slice(1)) : null,
      tags:      tags.join(',') || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>

        {/* ── Left column ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Basic Info */}
          <Section icon={Package} title="Basic Information" color="#7c3aed">
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
                <Field label="Product Name *" error={errors.name?.message}>
                  <input {...register('name')} className="input-base" placeholder="e.g. iPhone 15 Pro Max"
                    onChange={e => { register('name').onChange(e); setValue('name', e.target.value) }} />
                </Field>
                <Field label="SKU *" error={errors.sku?.message}>
                  <input {...register('sku')} className="input-base" placeholder="APL-IP15PM-001" style={{ fontFamily:'monospace' }} />
                </Field>
              </div>

              <Field label="Slug (auto-generated)">
                <div style={{ padding:'9px 14px', borderRadius:8, background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.05)', fontSize:13, color:'var(--text-3)', fontFamily:'monospace' }}>
                  /{slugify(nameVal || 'product-name')}
                </div>
              </Field>

              <Field label="Short Description">
                <input {...register('shortDescription')} className="input-base" placeholder="One-liner shown in product cards" />
              </Field>

              <Field label="Full Description *" error={errors.description?.message}>
                <textarea {...register('description')} className="input-base" rows={6}
                  placeholder="Full product description — markdown supported…" style={{ minHeight:140 }} />
              </Field>
            </div>
          </Section>

          {/* Pricing */}
          <Section icon={DollarSign} title="Pricing" color="#10b981">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
              <Field label="Regular Price (₹) *" error={errors.price?.message}>
                <input {...register('price')} type="number" step="0.01" className="input-base" placeholder="0.00" />
              </Field>
              <Field label="Discount Price (₹)" error={errors.discountPrice?.message}>
                <input {...register('discountPrice')} type="number" step="0.01" className="input-base" placeholder="0.00" />
              </Field>
              <Field label="Weight (kg)" error={errors.weight?.message}>
                <input {...register('weight')} type="number" step="0.01" className="input-base" placeholder="0.00" />
              </Field>
            </div>
          </Section>

          {/* Inventory */}
          <Section icon={Archive} title="Inventory" color="#3b82f6">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14 }}>
              <Field label="Stock Quantity *" error={errors.stockQuantity?.message}>
                <input {...register('stockQuantity')} type="number" className="input-base" />
              </Field>
              <Field label="Low Stock Threshold" error={errors.lowStockThreshold?.message}>
                <input {...register('lowStockThreshold')} type="number" className="input-base" />
              </Field>
            </div>
          </Section>

          {/* Product Variants */}
          <Section icon={Tag} title="Product Variants" color="#f59e0b">
            <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14 }}>
              Define attributes like Color, Size to auto-generate a variant matrix.
            </p>
            <VariantBuilder attributes={attributes} onChange={setAttributes} />
          </Section>

          {/* SEO */}
          <Section icon={Globe} title="SEO & Meta" color="#06b6d4">
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Field label="Meta Title">
                <input {...register('metaTitle')} className="input-base" placeholder="SEO page title (max 60 chars)" />
              </Field>
              <Field label="Meta Description">
                <textarea {...register('metaDescription')} className="input-base" rows={3}
                  placeholder="Brief description for search engine results (max 160 chars)…" />
              </Field>
            </div>
          </Section>
        </div>

        {/* ── Right column ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:24 }}>

          {/* Status */}
          <div className="glass rounded-2xl" style={{ padding:20 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:12, letterSpacing:'0.06em' }}>STATUS</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {(['Active', 'Draft', 'Archived'] as const).map(s => (
                <button key={s} type="button" onClick={() => { setStatus(s); setValue('isActive', s === 'Active') }}
                  style={{ padding:'8px 4px', borderRadius:8, border:`1px solid ${status===s ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,0.07)'}`,
                    background: status===s ? 'rgba(124,58,237,.15)' : 'transparent',
                    color: status===s ? '#a78bfa' : 'var(--text-3)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                  {s}
                </button>
              ))}
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, cursor:'pointer' }}>
              <input type="checkbox" {...register('isFeatured')} />
              <span style={{ fontSize:13, color:'var(--text-2)' }}>Mark as Featured</span>
            </label>
          </div>

          {/* Images */}
          <div className="glass rounded-2xl" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <ImageIcon size={14} color="var(--text-3)" />
              <p style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', letterSpacing:'0.06em' }}>PRODUCT IMAGES</p>
            </div>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Category + Brand */}
          <div className="glass rounded-2xl" style={{ padding:20 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Field label="Category *" error={errors.categoryId?.message}>
                <select {...register('categoryId')} className="input-base">
                  <option value="">Select category…</option>
                  {(cats ?? []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Brand *" error={errors.brandId?.message}>
                <select {...register('brandId')} className="input-base">
                  <option value="">Select brand…</option>
                  {(brands ?? []).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Tags */}
          <div className="glass rounded-2xl" style={{ padding:20 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, letterSpacing:'0.06em' }}>TAGS</p>
            <TagInput tags={tags} onChange={setTags} />
            <p style={{ fontSize:11, color:'var(--text-3)', marginTop:6 }}>Press Enter or comma to add tags</p>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button type="submit" disabled={create.isPending}
              style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', cursor: create.isPending ? 'wait' : 'pointer',
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color:'#fff', fontWeight:700, fontSize:14,
                fontFamily:'inherit', boxShadow:'0 0 30px rgba(124,58,237,.35)', transition:'opacity .2s',
                opacity: create.isPending ? 0.7 : 1 }}>
              {create.isPending ? 'Publishing…' : '✓ Publish Product'}
            </button>
            <button type="button" onClick={() => router.back()}
              style={{ width:'100%', padding:'11px', borderRadius:10, border:'1px solid rgba(255,255,255,0.09)',
                background:'transparent', color:'var(--text-2)', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
