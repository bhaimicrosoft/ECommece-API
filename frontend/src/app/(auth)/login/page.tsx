'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ShoppingBag, BarChart3, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

const FEATURES = [
  { icon: BarChart3, label: 'Real-time analytics',  color: '#a78bfa' },
  { icon: Package,   label: 'Product CMS',           color: '#38bdf8' },
  { icon: ShoppingBag, label: 'Order management',   color: '#10b981' },
  { icon: Zap,       label: 'Lightning fast',         color: '#f59e0b' },
]

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      if (res.data.success && res.data.data) {
        const { user, accessToken, refreshToken } = res.data.data
        if (user.role !== 'Admin') {
          toast.error('Admin access required.')
          return
        }
        setAuth(user, accessToken, refreshToken)
        toast.success(`Welcome back, ${user.firstName}!`)
        router.push('/dashboard')
      } else {
        toast.error(res.data.message || 'Login failed.')
      }
    } catch {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative orbs */}
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:600, height:600,
        background:'radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500,
        background:'radial-gradient(circle, rgba(6,182,212,.12) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">

        {/* ── Left: Branding ── */}
        <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ duration:.6 }}
          className="hidden lg:flex flex-col gap-8">

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width:48, height:48, borderRadius:14,
                background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
                display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px rgba(124,58,237,.4)' }}>
                <ShoppingBag size={24} color="#fff" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>ECommerce</p>
                <h1 className="text-lg font-bold" style={{ color:'var(--text-1)' }}>Admin CMS</h1>
              </div>
            </div>

            <h2 style={{ fontSize:42, fontWeight:800, lineHeight:1.15, color:'var(--text-1)' }}>
              Your store,<br />
              <span className="grad-text">perfectly managed.</span>
            </h2>
            <p className="mt-4 text-base" style={{ color:'var(--text-2)', lineHeight:1.7 }}>
              A world-class CMS dashboard with real-time analytics, full product control, order management, media library, and much more.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, color }, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 + i*.08 }}
                className="glass rounded-xl p-4 flex items-center gap-3">
                <div style={{ width:36, height:36, borderRadius:10,
                  background:`${color}18`, border:`1px solid ${color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={18} color={color} />
                </div>
                <span className="text-sm font-medium" style={{ color:'var(--text-2)' }}>{label}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {[['10k+', 'Products'], ['50k+', 'Orders'], ['99.9%', 'Uptime']].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold grad-text">{val}</p>
                <p className="text-xs" style={{ color:'var(--text-3)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Right: Login form ── */}
        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:.6 }}>
          <div className="glass rounded-2xl p-8" style={{ boxShadow:'0 0 60px rgba(124,58,237,.12)' }}>

            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-3 mb-6">
                <div style={{ width:40, height:40, borderRadius:12,
                  background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ShoppingBag size={20} color="#fff" />
                </div>
                <span className="font-bold text-lg">ECommerce CMS</span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color:'var(--text-1)' }}>Sign in</h3>
              <p className="mt-1 text-sm" style={{ color:'var(--text-3)' }}>
                Admin access only. Enter your credentials below.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

              <div>
                <label className="text-sm font-medium block mb-2" style={{ color:'var(--text-2)' }}>Email address</label>
                <input {...register('email')} type="email" placeholder="admin@ecommerce.com"
                  className="input-base" autoComplete="email" />
                {errors.email && <p className="mt-1 text-xs" style={{ color:'#ef4444' }}>{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium block mb-2" style={{ color:'var(--text-2)' }}>Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••" className="input-base" style={{ paddingRight:44 }}
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs" style={{ color:'#ef4444' }}>{errors.password.message}</p>}
              </div>

              <div className="mt-1 p-3 rounded-xl" style={{ background:'rgba(124,58,237,.07)', border:'1px solid rgba(124,58,237,.15)' }}>
                <p className="text-xs font-medium mb-1" style={{ color:'#a78bfa' }}>Demo credentials</p>
                <p className="text-xs" style={{ color:'var(--text-3)' }}>admin@ecommerce.com / Admin@123</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                style={{
                  width:'100%', padding:'12px 24px', borderRadius:10, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(124,58,237,.4)' : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                  color:'#fff', fontWeight:600, fontSize:15, fontFamily:'inherit',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(124,58,237,.35)',
                  transition:'all .2s',
                }}>
                {loading ? 'Signing in…' : 'Sign in to Dashboard'}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-xs" style={{ color:'var(--text-3)' }}>
              Secured with JWT + BCrypt · .NET 10 API
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
