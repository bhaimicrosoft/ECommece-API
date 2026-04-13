'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Copy, Trash2, Search, Image as ImageIcon, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface MediaItem { id: string; name: string; url: string; size: string; type: string; uploadedAt: string }

// Seed gallery with placeholder images so UI is non-empty on load
const SEED: MediaItem[] = [
  { id:'1', name:'iphone-15-pro.jpg',    url:'https://placehold.co/600x600?text=iPhone+15+Pro',    size:'245 KB', type:'image/jpeg', uploadedAt: new Date().toISOString() },
  { id:'2', name:'galaxy-s24-ultra.jpg', url:'https://placehold.co/600x600?text=Galaxy+S24',       size:'312 KB', type:'image/jpeg', uploadedAt: new Date().toISOString() },
  { id:'3', name:'macbook-pro.jpg',      url:'https://placehold.co/600x600?text=MacBook+Pro',      size:'189 KB', type:'image/jpeg', uploadedAt: new Date().toISOString() },
  { id:'4', name:'sony-xm5.jpg',         url:'https://placehold.co/600x600?text=Sony+XM5',         size:'156 KB', type:'image/jpeg', uploadedAt: new Date().toISOString() },
  { id:'5', name:'air-max.jpg',          url:'https://placehold.co/600x600?text=Air+Max+270',      size:'203 KB', type:'image/jpeg', uploadedAt: new Date().toISOString() },
  { id:'6', name:'ultraboost.jpg',       url:'https://placehold.co/600x600?text=Ultraboost+23',    size:'178 KB', type:'image/jpeg', uploadedAt: new Date().toISOString() },
  { id:'7', name:'banner-hero.jpg',      url:'https://placehold.co/1200x400?text=Hero+Banner',     size:'512 KB', type:'image/jpeg', uploadedAt: new Date().toISOString() },
  { id:'8', name:'category-electronics.jpg', url:'https://placehold.co/400x300?text=Electronics',size:'98 KB',  type:'image/jpeg', uploadedAt: new Date().toISOString() },
]

export default function MediaPage() {
  const [items,    setItems]    = useState<MediaItem[]>(SEED)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [copied,   setCopied]   = useState<string | null>(null)

  const onDrop = useCallback((files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setItems(prev => [{
          id:         Date.now().toString(),
          name:       file.name,
          url:        reader.result as string,
          size:       `${(file.size / 1024).toFixed(0)} KB`,
          type:       file.type,
          uploadedAt: new Date().toISOString(),
        }, ...prev])
        toast.success(`${file.name} uploaded`)
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true, noClick: false,
  })

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    toast.success('URL copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (selected === id) setSelected(null)
    toast.success('Image removed.')
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  const selectedItem = items.find(i => i.id === selected)

  return (
    <div style={{ display:'flex', gap:20, height:'calc(100vh - 140px)' }}>

      {/* ── Main panel ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>

        {/* Upload zone */}
        <div {...getRootProps()} className="glass rounded-2xl"
          style={{ padding:'20px 24px', cursor:'pointer', textAlign:'center',
            borderStyle:'dashed', borderWidth:2,
            borderColor: isDragActive ? 'rgba(124,58,237,.6)' : 'rgba(255,255,255,0.08)',
            background: isDragActive ? 'rgba(124,58,237,.06)' : 'transparent',
            transition:'all .2s',
          }}>
          <input {...getInputProps()} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
            <Upload size={20} color={isDragActive ? '#a78bfa' : 'var(--text-3)'} />
            <div style={{ textAlign:'left' }}>
              <p style={{ fontSize:14, fontWeight:600, color: isDragActive ? '#a78bfa' : 'var(--text-2)' }}>
                {isDragActive ? 'Drop files to upload' : 'Drag & drop images or click to browse'}
              </p>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>PNG, JPG, WebP, GIF, SVG — up to 10MB each</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8,
                padding:'8px 12px 8px 34px', color:'var(--text-1)', fontSize:13, outline:'none', width:'100%', fontFamily:'inherit' }} />
          </div>
          <span style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap' }}>{filtered.length} files</span>
        </div>

        {/* Grid */}
        <div style={{ flex:1, overflowY:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:12 }}>
            {filtered.map(item => (
              <div key={item.id}
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                style={{
                  borderRadius:12, overflow:'hidden', cursor:'pointer',
                  border: `2px solid ${selected === item.id ? '#7c3aed' : 'rgba(255,255,255,0.06)'}`,
                  background:'var(--bg-surface)',
                  boxShadow: selected === item.id ? '0 0 20px rgba(124,58,237,.25)' : 'none',
                  transition:'all .2s',
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }} />
                <div style={{ padding:'8px 10px' }}>
                  <p style={{ fontSize:11, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                  <p style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{item.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sidebar detail panel ── */}
      <div className="glass rounded-2xl" style={{ width:280, flexShrink:0, padding:20, display:'flex', flexDirection:'column', gap:16 }}>
        {selectedItem ? (
          <>
            <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedItem.url} alt={selectedItem.name} style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' }} />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:2 }}>File name</p>
                <p style={{ fontSize:13, color:'var(--text-1)', fontWeight:500, wordBreak:'break-all' }}>{selectedItem.name}</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div>
                  <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:2 }}>Size</p>
                  <p style={{ fontSize:13, color:'var(--text-2)' }}>{selectedItem.size}</p>
                </div>
                <div>
                  <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:2 }}>Type</p>
                  <p style={{ fontSize:13, color:'var(--text-2)' }}>{selectedItem.type.split('/')[1]?.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div>
              <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:6 }}>URL</p>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ flex:1, padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.07)', fontSize:11, color:'var(--text-3)',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {selectedItem.url.substring(0, 40)}…
                </div>
                <button onClick={() => copyUrl(selectedItem.url, selectedItem.id)}
                  style={{ flexShrink:0, width:34, height:34, borderRadius:8,
                    background: copied === selectedItem.id ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,0.05)',
                    border:`1px solid ${copied === selectedItem.id ? 'rgba(16,185,129,.3)' : 'rgba(255,255,255,0.08)'}`,
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    color: copied === selectedItem.id ? '#10b981' : 'var(--text-2)' }}>
                  {copied === selectedItem.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <button onClick={() => deleteItem(selectedItem.id)}
              style={{ width:'100%', padding:'10px', borderRadius:9, border:'1px solid rgba(239,68,68,.25)',
                background:'rgba(239,68,68,.1)', color:'#ef4444', cursor:'pointer', fontSize:13, fontWeight:500,
                fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              <Trash2 size={13} /> Remove File
            </button>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, opacity:0.5 }}>
            <ImageIcon size={40} color="var(--text-3)" />
            <p style={{ fontSize:13, color:'var(--text-3)', textAlign:'center' }}>Click an image to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}
