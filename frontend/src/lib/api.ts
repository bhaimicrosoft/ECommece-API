import axios from 'axios'
import type {
  ApiResponse, AuthResponse, DashboardStats, Product, CreateProductDto,
  Category, Brand, Order, OrderStatus, Coupon, Review, Refund,
  User, PaginatedResult,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export const api = axios.create({ baseURL: BASE })

// Attach access token to every request
api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

// Refresh token on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const at  = localStorage.getItem('accessToken')  ?? ''
      const rt  = localStorage.getItem('refreshToken') ?? ''
      try {
        const { data } = await axios.post<ApiResponse<AuthResponse>>(
          `${BASE}/api/auth/refresh`, { accessToken: at, refreshToken: rt }
        )
        if (data.data) {
          localStorage.setItem('accessToken',  data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api(original)
        }
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login:   (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password }),
  register:(email: string, password: string, firstName: string, lastName: string, phone?: string) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/register', { email, password, firstName, lastName, phone }),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard'),
}

// ─── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PaginatedResult<Product>>>('/api/products', { params }),
  get:    (id: string) => api.get<ApiResponse<Product>>(`/api/products/${id}`),
  create: (dto: CreateProductDto) => api.post<ApiResponse<Product>>('/api/products', dto),
  update: (id: string, dto: Partial<CreateProductDto>) =>
    api.put<ApiResponse<Product>>(`/api/products/${id}`, dto),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/api/products/${id}`),
}

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get<ApiResponse<Category[]>>('/api/categories'),
  create: (dto: { name: string; description?: string; imageUrl?: string; sortOrder: number; parentCategoryId?: string }) =>
    api.post<ApiResponse<Category>>('/api/categories', dto),
  update: (id: string, dto: object) => api.put<ApiResponse<Category>>(`/api/categories/${id}`, dto),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/api/categories/${id}`),
}

// ─── Brands ──────────────────────────────────────────────────────────────────
export const brandsApi = {
  list: () => api.get<ApiResponse<Brand[]>>('/api/products/brands'),
  create: (dto: { name: string; logoUrl?: string; description?: string }) =>
    api.post<ApiResponse<Brand>>('/api/products/brands', dto),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  adminList: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PaginatedResult<Order>>>('/api/admin/orders', { params }),
  get:          (id: string) => api.get<ApiResponse<Order>>(`/api/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus, trackingNumber?: string) =>
    api.put<ApiResponse<Order>>(`/api/admin/orders/${id}/status`, { status, trackingNumber }),
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PaginatedResult<User>>>('/api/admin/users', { params }),
}

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const couponsApi = {
  list: () => api.get<ApiResponse<Coupon[]>>('/api/coupons'),
  create: (dto: object) => api.post<ApiResponse<Coupon>>('/api/coupons', dto),
  update: (id: string, dto: object) => api.put<ApiResponse<Coupon>>(`/api/coupons/${id}`, dto),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/api/coupons/${id}`),
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewsApi = {
  list: (productId?: string) =>
    api.get<ApiResponse<PaginatedResult<Review>>>('/api/reviews', { params: { productId } }),
  approve: (id: string) => api.put<ApiResponse<Review>>(`/api/reviews/${id}/approve`, {}),
  delete:  (id: string) => api.delete<ApiResponse<null>>(`/api/reviews/${id}`),
}

// ─── Refunds ─────────────────────────────────────────────────────────────────
export const refundsApi = {
  list: () => api.get<ApiResponse<PaginatedResult<Refund>>>('/api/refunds'),
  process: (id: string, dto: object) => api.put<ApiResponse<Refund>>(`/api/refunds/${id}`, dto),
}
