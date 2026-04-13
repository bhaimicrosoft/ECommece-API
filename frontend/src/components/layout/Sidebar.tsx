'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, FolderTree, Tag, Image as ImageIcon,
  ShoppingCart, Users, Ticket, Star, RefreshCw, Archive,
  Settings, ShoppingBag, ChevronRight, LogOut, TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { group: 'OVERVIEW', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/analytics', icon: TrendingUp,       label: 'Analytics' },
  ]},
  { group: 'CATALOG', items: [
    { href: '/products',   icon: Package,    label: 'Products' },
    { href: '/categories', icon: FolderTree, label: 'Categories' },
    { href: '/brands',     icon: Tag,        label: 'Brands' },
    { href: '/media',      icon: ImageIcon,  label: 'Media Library' },
  ]},
  { group: 'COMMERCE', items: [
    { href: '/orders',    icon: ShoppingCart, label: 'Orders' },
    { href: '/customers', icon: Users,        label: 'Customers' },
    { href: '/coupons',   icon: Ticket,       label: 'Coupons' },
    { href: '/reviews',   icon: Star,         label: 'Reviews' },
  ]},
  { group: 'OPERATIONS', items: [
    { href: '/refunds',   icon: RefreshCw, label: 'Refunds' },
    { href: '/inventory', icon: Archive,    label: 'Inventory' },
  ]},
  { group: 'SYSTEM', items: [
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
]

export function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, clearAuth } = useAuthStore()

  const logout = () => {
    clearAuth()
    toast.success('Signed out successfully.')
    router.push('/login')
  }

  return (
    <aside style={{
      width: 256, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: 'rgba(11,11,16,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,.4)', flexShrink: 0,
          }}>
            <ShoppingBag size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f1f3', letterSpacing: '-0.3px' }}>ECommerce</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: -1, letterSpacing: '0.08em' }}>CMS DASHBOARD</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        {NAV.map(({ group, items }) => (
          <div key={group} style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.12em', padding: '10px 8px 6px' }}>
              {group}
            </p>
            {items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 9, cursor: 'pointer',
                    background: active ? 'rgba(124,58,237,.15)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(124,58,237,.3)' : 'transparent'}`,
                    color: active ? '#a78bfa' : 'var(--text-2)',
                    boxShadow: active ? '0 0 12px rgba(124,58,237,.1)' : 'none',
                    transition: 'all .15s',
                    position: 'relative',
                  }}>
                    {active && (
                      <div style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, borderRadius: 3, background: 'linear-gradient(180deg,#7c3aed,#06b6d4)',
                      }} />
                    )}
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400, flex: 1 }}>{label}</span>
                    {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.role}
            </p>
          </div>
          <button onClick={logout} title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, borderRadius: 6,
              display: 'flex', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
