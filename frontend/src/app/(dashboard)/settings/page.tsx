'use client'
import { useState } from 'react'
import { Store, Shield, Bell, Palette, Database, Globe, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id:'general',       icon: Store,   label: 'General' },
  { id:'security',      icon: Shield,  label: 'Security' },
  { id:'notifications', icon: Bell,    label: 'Notifications' },
  { id:'appearance',    icon: Palette, label: 'Appearance' },
  { id:'integrations',  icon: Globe,   label: 'Integrations' },
  { id:'database',      icon: Database,label: 'Database' },
]

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:13, fontWeight:500, color:'var(--text-2)' }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:'var(--text-3)' }}>{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState('general')

  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:20, alignItems:'start' }}>

      {/* Tab nav */}
      <div className="glass rounded-2xl" style={{ padding:8 }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9,
              background: tab === id ? 'rgba(124,58,237,.15)' : 'transparent',
              border: `1px solid ${tab === id ? 'rgba(124,58,237,.3)' : 'transparent'}`,
              color: tab === id ? '#a78bfa' : 'var(--text-2)', cursor:'pointer', fontSize:13,
              fontFamily:'inherit', fontWeight: tab === id ? 600 : 400, marginBottom:2, textAlign:'left' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass rounded-2xl" style={{ padding:28 }}>
        {tab === 'general' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>General Settings</h2>
              <p style={{ fontSize:13, color:'var(--text-3)' }}>Manage your store information and preferences.</p>
            </div>
            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
            <Field label="Store Name"><input className="input-base" defaultValue="ECommerce Store" /></Field>
            <Field label="Store URL" hint="Your public storefront URL."><input className="input-base" defaultValue="https://ecommerce.com" /></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <Field label="Support Email"><input className="input-base" defaultValue="support@ecommerce.com" type="email" /></Field>
              <Field label="Support Phone"><input className="input-base" defaultValue="+91 98765 43210" /></Field>
            </div>
            <Field label="Default Currency">
              <select className="input-base"><option value="INR">₹ INR — Indian Rupee</option><option value="USD">$ USD — US Dollar</option></select>
            </Field>
            <Field label="Store Description"><textarea className="input-base" rows={3} defaultValue="Full-featured eCommerce platform powered by .NET 10 and Next.js 15." /></Field>
          </div>
        )}

        {tab === 'security' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>Security</h2>
              <p style={{ fontSize:13, color:'var(--text-3)' }}>Authentication and security configuration.</p>
            </div>
            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
            <Field label="JWT Access Token Expiry" hint="Minutes before access token expires."><input className="input-base" defaultValue="30" type="number" /></Field>
            <Field label="Refresh Token Expiry (Days)" hint="Days before refresh token expires."><input className="input-base" defaultValue="7" type="number" /></Field>
            <Field label="Rate Limit (Auth endpoints)" hint="Max requests per minute per IP on auth endpoints."><input className="input-base" defaultValue="5" type="number" /></Field>
            <div style={{ padding:16, borderRadius:10, background:'rgba(16,185,129,.07)', border:'1px solid rgba(16,185,129,.2)' }}>
              <p style={{ fontSize:13, color:'#10b981', fontWeight:600, marginBottom:4 }}>✓ Security Features Active</p>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>BCrypt hashing · SHA-256 hashed refresh tokens · Token rotation · Rate limiting</p>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-1)' }}>Notification Preferences</h2>
            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
            {[
              ['New order placed', true],
              ['Low stock alert', true],
              ['Refund requested', true],
              ['New customer registered', false],
              ['Review pending approval', true],
            ].map(([label, def]) => (
              <label key={label as string} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                <span style={{ fontSize:13, color:'var(--text-2)' }}>{label as string}</span>
                <input type="checkbox" defaultChecked={def as boolean} />
              </label>
            ))}
          </div>
        )}

        {tab === 'appearance' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-1)' }}>Appearance</h2>
            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
            <Field label="Accent Color">
              <div style={{ display:'flex', gap:10 }}>
                {['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626'].map(c => (
                  <button key={c} onClick={() => {}} style={{ width:32, height:32, borderRadius:8, background:c, border: c === '#7c3aed' ? '3px solid white' : '3px solid transparent', cursor:'pointer' }} />
                ))}
              </div>
            </Field>
            <Field label="Theme"><select className="input-base"><option>Dark (Default)</option><option>Light</option></select></Field>
            <Field label="Sidebar Style"><select className="input-base"><option>Compact</option><option>Expanded</option></select></Field>
          </div>
        )}

        {tab === 'database' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-1)' }}>Database</h2>
            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
            <div style={{ padding:16, borderRadius:10, background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.2)' }}>
              <p style={{ fontSize:13, color:'#f59e0b', fontWeight:600, marginBottom:4 }}>⚠ SQLite (Development)</p>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>Migrate to PostgreSQL or SQL Server for production workloads.</p>
            </div>
            <Field label="Connection String"><input className="input-base" defaultValue="Data Source=ecommerce.db" /></Field>
            <Field label="Database Provider"><select className="input-base"><option>SQLite</option><option>PostgreSQL</option><option>SQL Server</option></select></Field>
          </div>
        )}

        {tab === 'integrations' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-1)' }}>Integrations</h2>
            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
            {[
              { name:'Stripe', desc:'Payment gateway', status:'Not configured', color:'#635bff' },
              { name:'Razorpay', desc:'Payment gateway (India)', status:'Not configured', color:'#2d6df6' },
              { name:'Sendgrid', desc:'Transactional email', status:'Not configured', color:'#1a82e2' },
              { name:'Cloudinary', desc:'Image CDN & media management', status:'Not configured', color:'#3448c5' },
            ].map(({ name, desc, status, color }) => (
              <div key={name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:16, borderRadius:12,
                background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:`${color}20`, border:`1px solid ${color}40`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color }}>
                    {name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{name}</p>
                    <p style={{ fontSize:11, color:'var(--text-3)' }}>{desc}</p>
                  </div>
                </div>
                <button style={{ padding:'6px 14px', borderRadius:7, background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.09)', color:'var(--text-2)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  Configure
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => toast.success('Settings saved!')}
          style={{ marginTop:24, display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:9, border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#7c3aed,#06b6d4)', color:'#fff', fontWeight:600, fontSize:14,
            fontFamily:'inherit', boxShadow:'0 0 20px rgba(124,58,237,.3)' }}>
          <Save size={14} /> Save Changes
        </button>
      </div>
    </div>
  )
}
