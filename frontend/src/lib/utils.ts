import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  Pending:         'badge-warning',
  Confirmed:       'badge-info',
  Processing:      'badge-purple',
  Shipped:         'badge-info',
  Delivered:       'badge-success',
  Cancelled:       'badge-danger',
  ReturnRequested: 'badge-warning',
  Returned:        'badge-muted',
}

export const PAYMENT_STATUS_COLOR: Record<string, string> = {
  Pending:   'badge-warning',
  Completed: 'badge-success',
  Failed:    'badge-danger',
  Refunded:  'badge-purple',
}

export const REFUND_STATUS_COLOR: Record<string, string> = {
  Requested: 'badge-warning',
  Approved:  'badge-info',
  Processed: 'badge-success',
  Rejected:  'badge-danger',
}
