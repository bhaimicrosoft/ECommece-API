'use client'
import { Bell, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, { title: string; action?: { label: string; href: string } }> = {
  '/dashboard':  { title: 'Dashboard' },
  '/products':   { title: 'Products',   action: { label: 'New Product',  href: '/products/new' } },
  '/categories': { title: 'Categories', action: { label: 'New Category', href: '/categories/new' } },
  '/brands':     { title: 'Brands',     action: { label: 'New Brand',    href: '/brands/new' } },
  '/orders':     { title: 'Orders' },
  '/customers':  { title: 'Customers' },
  '/coupons':    { title: 'Coupons',    action: { label: 'New Coupon',   href: '/coupons/new' } },
  '/reviews':    { title: 'Reviews' },
  '/refunds':    { title: 'Refunds' },
  '/media':      { title: 'Media Library' },
  '/inventory':  { title: 'Inventory' },
  '/settings':   { title: 'Settings' },
  '/analytics':  { title: 'Analytics' },
}

export function Header() {
  const pathname = usePathname()
  const page = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || (key !== '/dashboard' && pathname.startsWith(key))
  )?.[1] ?? { title: 'Dashboard' }

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(9,9,14,0.8)', backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{page.title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            placeholder="Search anything…"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, padding: '7px 14px 7px 34px',
              color: 'var(--text-1)', fontSize: 13, outline: 'none', width: 220,
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Notification bell */}
        <button style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-2)', position: 'relative',
        }}>
          <Bell size={15} />
          <span style={{
            position: 'absolute', top: 7, right: 7, width: 7, height: 7,
            background: '#ef4444', borderRadius: '50%', border: '1.5px solid var(--bg-base)',
          }} />
        </button>

        {/* Primary action */}
        {page.action && (
          <Link href={page.action.href} style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
              boxShadow: '0 0 20px rgba(124,58,237,.3)', transition: 'opacity .15s',
            }}>
              <Plus size={15} />
              {page.action.label}
            </button>
          </Link>
        )}
      </div>
    </header>
  )
}
