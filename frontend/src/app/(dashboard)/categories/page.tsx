'use client'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api'
import { FolderTree, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/types'

function CategoryRow({ cat, depth = 0 }: { cat: Category; depth?: number }) {
  return (
    <>
      <tr className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        <td style={{ padding:'12px 16px', paddingLeft: 16 + depth * 24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {depth > 0 && <ChevronRight size={12} color="var(--text-3)" />}
            <FolderTree size={14} color={depth === 0 ? '#a78bfa' : 'var(--text-3)'} />
            <span style={{ fontSize:13, fontWeight: depth === 0 ? 600 : 400, color: depth === 0 ? 'var(--text-1)' : 'var(--text-2)' }}>{cat.name}</span>
          </div>
        </td>
        <td style={{ padding:'12px 16px', color:'var(--text-3)', fontFamily:'monospace', fontSize:12 }}>{cat.slug}</td>
        <td style={{ padding:'12px 16px' }}>
          <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-muted'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span>
        </td>
        <td style={{ padding:'12px 16px', color:'var(--text-3)' }}>{cat.sortOrder}</td>
        <td style={{ padding:'12px 16px' }}>
          <span style={{ fontSize:12, color:'var(--text-3)' }}>{cat.subCategories?.length ?? 0} sub-categories</span>
        </td>
      </tr>
      {(cat.subCategories ?? []).map(sub => <CategoryRow key={sub.id} cat={sub} depth={depth + 1} />)}
    </>
  )
}

export default function CategoriesPage() {
  const { data: cats, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesApi.list().then(r => r.data.data ?? []),
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="glass rounded-2xl" style={{ overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {['Category','Slug','Status','Order','Sub-categories'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'14px 16px', color:'var(--text-3)', fontWeight:500, fontSize:11, letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={5} style={{ padding:'14px 16px' }}><div className="shimmer rounded" style={{ height:18 }} /></td></tr>)
              : (cats ?? []).filter(c => !c.parentCategoryId).map(c => <CategoryRow key={c.id} cat={c} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
