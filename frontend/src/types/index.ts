// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  role: 'Admin' | 'Customer'
  isActive: boolean
  createdAt: string
}

// ─── Products ────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string | null
  price: number
  discountPrice: number | null
  sku: string
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  isFeatured: boolean
  imageUrl: string | null
  images: string | null
  tags: string | null
  weight: number
  averageRating: number
  reviewCount: number
  categoryId: string
  categoryName: string
  brandId: string
  brandName: string
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
}

export interface CreateProductDto {
  name: string
  description: string
  shortDescription: string | null
  price: number
  discountPrice: number | null
  sku: string
  stockQuantity: number
  lowStockThreshold: number
  isFeatured: boolean
  isActive: boolean
  imageUrl: string | null
  images: string | null
  tags: string | null
  weight: number
  categoryId: string
  brandId: string
  metaTitle?: string | null
  metaDescription?: string | null
}

// ─── Categories ──────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  parentCategoryId: string | null
  subCategories: Category[] | null
}

// ─── Brands ──────────────────────────────────────────────────────────────────
export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
  isActive: boolean
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'Pending' | 'Confirmed' | 'Processing'
  | 'Shipped'  | 'Delivered' | 'Cancelled'
  | 'ReturnRequested' | 'Returned'

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subTotal: number
  shippingCost: number
  tax: number
  discountAmount: number
  totalAmount: number
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingZipCode: string
  shippingCountry: string
  trackingNumber: string | null
  notes: string | null
  shippedDate: string | null
  deliveredDate: string | null
  cancelledDate: string | null
  cancellationReason: string | null
  items: OrderItem[]
  payment: Payment | null
  createdAt: string
  user?: { firstName: string; lastName: string }
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImageUrl: string | null
  productSku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded'
export type PaymentMethod = 'CreditCard' | 'DebitCard' | 'UPI' | 'NetBanking' | 'COD'

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string | null
  amount: number
  paidAt: string | null
}

// ─── Coupons ─────────────────────────────────────────────────────────────────
export type DiscountType = 'Percentage' | 'Flat'

export interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number | null
  maxUses: number
  currentUses: number
  isActive: boolean
  expiryDate: string
  createdAt: string
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface Review {
  id: string
  userId: string
  productId: string
  productName?: string
  userName?: string
  rating: number
  title: string | null
  comment: string | null
  isApproved: boolean
  isVerifiedPurchase: boolean
  createdAt: string
}

// ─── Refunds ─────────────────────────────────────────────────────────────────
export type RefundStatus = 'Requested' | 'Approved' | 'Processed' | 'Rejected'

export interface Refund {
  id: string
  orderId: string
  orderNumber: string
  status: RefundStatus
  reason: string
  amount: number
  adminNotes: string | null
  processedAt: string | null
  createdAt: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  pendingOrders: number
  lowStockProducts: number
  todayRevenue: number
  todayOrders: number
  recentOrders: RecentOrder[]
  topProducts: TopProduct[]
  monthlySales: MonthlySales[]
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
}

export interface TopProduct {
  productId: string
  productName: string
  productImageUrl: string | null
  totalSold: number
  totalRevenue: number
}

export interface MonthlySales {
  month: string
  revenue: number
  orders: number
}

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errors: string[] | null
}

export interface PaginatedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// ─── Product variants (frontend-only model) ──────────────────────────────────
export interface ProductAttribute {
  name: string
  values: string[]
}

export interface ProductVariant {
  combination: Record<string, string>
  sku: string
  price: number
  stock: number
}
