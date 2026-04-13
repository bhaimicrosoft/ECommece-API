# 🛒 ECommerce — Full-Stack eCommerce Platform

A production-grade eCommerce REST API built with **Clean Architecture** in **C# .NET 10**, paired with a modern **Next.js 15 CMS Admin Dashboard**. Includes JWT authentication, hashed refresh token rotation, rate limiting, Serilog structured logging, and comprehensive eCommerce functionality comparable to Shopify / Amazon.

## 🏗️ Architecture

```
ECommerce/
├── src/
│   ├── ECommerce.Domain/          # Entities, Enums, Interfaces (zero dependencies)
│   ├── ECommerce.Application/     # CQRS with MediatR, DTOs, Validators, AutoMapper
│   ├── ECommerce.Infrastructure/  # EF Core, Repositories, JWT Service, DB Seeding
│   └── ECommerce.API/             # ASP.NET Core 10 Web API, Controllers, Middleware
├── frontend/                      # Next.js 15 + React 19 + Tailwind CSS CMS Dashboard
└── tests/
    └── ECommerce.Application.Tests/
```

## ✨ Features

### 🔐 Authentication & Security
- JWT access tokens (30 min) + hashed refresh tokens (7 days, stored as SHA-256 hash)
- Refresh token rotation — re-use of a revoked token invalidates the entire session
- BCrypt password hashing (cost factor 12)
- Role-based authorization (Admin / Customer)
- Rate limiting: 5 req/min on auth endpoints, 100 req/10s global
- Global exception middleware with structured error responses

### 🛍️ Customer Features
- **Products**: Browse, search, filter by category/brand/price, sort, pagination
- **Cart**: Add/update/remove items, live totals
- **Wishlist**: Save products for later
- **Orders**: Place, track, cancel, full lifecycle (Pending → Delivered)
- **Payments**: Credit Card, Debit Card, UPI, NetBanking, COD
- **Refunds**: Request, approve, process flow
- **Reviews**: Rate & review (verified purchase badge, admin approval)
- **Addresses**: Multiple shipping addresses per user
- **Coupons**: Percentage & flat discount codes with expiry and usage limits

### 👨‍💼 CMS Admin Dashboard (Next.js 15)
- **Analytics Dashboard**: Revenue charts, order stats, top products, monthly trends
- **Product CMS**: Full CRUD · variable attributes · variant SKU matrix · drag-and-drop image upload · SEO fields · tag input · featured/status toggles
- **Media Library**: Drag-and-drop upload, grid browser, copy URL, delete
- **Order Management**: Status pipeline, tracking, filtering
- **Customer Management**: User list with roles and status
- **Category & Brand Management**: Hierarchical categories with images
- **Coupon Management**: Create, edit, activate/deactivate
- **Review Moderation**: Approve/reject with admin notes
- **Refund Management**: Approve/reject refund requests
- **Settings**: Store configuration

## 🚀 Getting Started

### Prerequisites
- **.NET 10 SDK** — [download](https://dotnet.microsoft.com/download/dotnet/10.0)
- **Node.js 18+**

### Run the API
```bash
cd src/ECommerce.API
dotnet run
```
The API starts at `http://localhost:5000`. Swagger UI is available in development mode at `/swagger`.

### Run the Admin Dashboard
```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```
Dashboard runs at `http://localhost:3000`.

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
| POST | /api/auth/login | ❌ | Login & get JWT tokens (rate limited: 5/min) |
| POST | /api/auth/refresh | ❌ | Rotate refresh token |

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
| POST | /api/cart/items | 🔑 | Add item |
| PUT | /api/cart/items/{id} | 🔑 | Update quantity |
| DELETE | /api/cart/items/{id} | 🔑 | Remove item |
| DELETE | /api/cart | 🔑 | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | 🔑 | Place order from cart |
| GET | /api/orders | 🔑 | User order history |
| GET | /api/orders/{id} | 🔑 | Order detail |
| POST | /api/orders/{id}/cancel | 🔑 | Cancel order |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/dashboard | 🔒 Admin | Dashboard statistics |
| GET | /api/admin/orders | 🔒 Admin | All orders (filterable + paginated) |
| PUT | /api/admin/orders/{id}/status | 🔒 Admin | Update order status |
| GET | /api/admin/users | 🔒 Admin | All users |

> Full endpoint documentation available via Swagger UI at `/swagger` in development.

## 🔧 Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | ASP.NET Core 10 Web API |
| ORM | Entity Framework Core 10 (SQLite) |
| Pattern | CQRS via MediatR 14 |
| Mapping | AutoMapper 16 |
| Validation | FluentValidation 12 + MediatR pipeline |
| Auth | JWT Bearer + BCrypt.Net + SHA-256 hashed refresh tokens |
| Logging | Serilog (console + rolling file) |
| Rate Limiting | ASP.NET Core built-in (`AddRateLimiter`) |
| Health Checks | `AddHealthChecks()` → `/health` |

### Frontend (CMS Admin Dashboard)
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI Runtime | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 (custom dark design system) |
| State | Zustand 5 (with persistence) |
| Server State | TanStack Query v5 |
| HTTP | Axios |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Uploads | react-dropzone |
| Animations | Framer Motion |
| Notifications | react-hot-toast |

## 🏥 Health & Observability

```bash
GET /health          # liveness probe
GET /swagger         # API docs (dev only)
logs/ecommerce-*.log # rolling daily structured logs
```

## 📝 License
MIT

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

