# 🛒 ECommerce - Full-Stack eCommerce Platform

A production-grade eCommerce REST API built with **Clean Architecture** in C# .NET 8, featuring a modern **React Admin Dashboard**. Includes JWT authentication, role-based authorization, and comprehensive eCommerce functionality comparable to Amazon/Flipkart.

## 🏗️ Architecture

```
ECommerce/
├── src/
│   ├── ECommerce.Domain/          # Entities, Enums, Interfaces (zero dependencies)
│   ├── ECommerce.Application/     # CQRS with MediatR, DTOs, Validators, AutoMapper
│   ├── ECommerce.Infrastructure/  # EF Core, Repositories, JWT Service, DB Seeding
│   ├── ECommerce.API/             # ASP.NET Core Web API, Controllers, Middleware
│   └── ECommerce.AdminDashboard/  # React + TypeScript + Tailwind CSS Admin UI
└── ECommerce.sln
```

## ✨ Features

### 🔐 Authentication & Authorization
- JWT access tokens (30 min) + refresh tokens (7 days)
- BCrypt password hashing
- Role-based authorization (Admin / Customer)
- Secure token refresh flow

### 🛍️ Customer Features
- **Products**: Browse, search, filter by category/brand/price, sort, pagination
- **Cart**: Add/update/remove items, view cart totals
- **Wishlist**: Save products for later
- **Orders**: Place orders, view order history, cancel orders
- **Payments**: Mock payment processing (Credit Card, UPI, COD, etc.)
- **Refunds**: Request refunds, track refund status
- **Reviews**: Rate & review products (verified purchase badge)
- **Addresses**: Manage multiple shipping addresses
- **Coupons**: Apply discount codes at checkout

### 👨‍💼 Admin Features
- **Dashboard**: Revenue stats, order counts, charts, top products
- **Product Management**: Full CRUD with stock tracking
- **Order Management**: Update order status, track shipments
- **User Management**: View all registered users
- **Coupon Management**: Create and manage discount coupons
- **Refund Management**: Approve/reject refund requests
- **Category & Brand Management**: Hierarchical categories

## 🚀 Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+

### Run the API
```bash
cd src/ECommerce.API
dotnet run
```
The API starts at `http://localhost:5000` with Swagger UI available in development mode.

### Run the Admin Dashboard
```bash
cd src/ECommerce.AdminDashboard
npm install
npm run dev
```
Dashboard runs at `http://localhost:3000`

### Seeded Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Customer | customer@test.com | Customer@123 |

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register new customer |
| POST | /api/auth/login | ❌ | Login & get JWT tokens |
| POST | /api/auth/refresh | ❌ | Refresh access token |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | ❌ | List products (paginated, filterable) |
| GET | /api/products/{id} | ❌ | Get product details |
| POST | /api/products | 🔒 Admin | Create product |
| PUT | /api/products/{id} | 🔒 Admin | Update product |
| DELETE | /api/products/{id} | 🔒 Admin | Delete product |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/cart | 🔑 | Get user's cart |
| POST | /api/cart/items | 🔑 | Add item to cart |
| PUT | /api/cart/items/{id} | 🔑 | Update cart item quantity |
| DELETE | /api/cart/items/{id} | 🔑 | Remove item from cart |
| DELETE | /api/cart | 🔑 | Clear entire cart |

### Wishlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/wishlist | 🔑 | Get user's wishlist |
| POST | /api/wishlist/items | 🔑 | Add to wishlist |
| DELETE | /api/wishlist/items/{productId} | 🔑 | Remove from wishlist |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | 🔑 | Place order (from cart) |
| GET | /api/orders | 🔑 | Get user's orders |
| GET | /api/orders/{id} | 🔑 | Get order details |
| POST | /api/orders/{id}/cancel | 🔑 | Cancel order |

### Addresses, Reviews, Coupons, Refunds
Full CRUD endpoints available — see Swagger UI for complete documentation.

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/dashboard | 🔒 Admin | Dashboard statistics |
| GET | /api/admin/orders | 🔒 Admin | All orders (filterable) |
| PUT | /api/admin/orders/{id}/status | 🔒 Admin | Update order status |
| GET | /api/admin/users | 🔒 Admin | All users |

## 🔧 Tech Stack

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core 8 (SQLite)
- MediatR (CQRS pattern)
- AutoMapper
- FluentValidation
- JWT Bearer Authentication
- BCrypt.Net password hashing

### Frontend (Admin Dashboard)
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios
- Recharts (charts)
- Lucide React (icons)

## 📝 License
MIT

