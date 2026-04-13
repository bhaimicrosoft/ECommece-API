using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs;

// ===== AUTH DTOs =====
public record RegisterDto(string Email, string Password, string FirstName, string LastName, string? Phone);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string AccessToken, string RefreshToken, UserDto User);
public record RefreshTokenDto(string AccessToken, string RefreshToken);

// ===== USER DTOs =====
public record UserDto(Guid Id, string Email, string FirstName, string LastName, string? Phone, string? AvatarUrl, string Role, bool IsActive, DateTime CreatedAt);

// ===== PRODUCT DTOs =====
public record ProductDto(Guid Id, string Name, string Slug, string Description, string? ShortDescription, decimal Price, decimal? DiscountPrice,
    string SKU, int StockQuantity, bool IsActive, bool IsFeatured, string? ImageUrl, string? Images, string? Tags,
    double Weight, double AverageRating, int ReviewCount, Guid CategoryId, string CategoryName, Guid BrandId, string BrandName, DateTime CreatedAt);

public record CreateProductDto(string Name, string Description, string? ShortDescription, decimal Price, decimal? DiscountPrice,
    string SKU, int StockQuantity, int LowStockThreshold, bool IsFeatured, string? ImageUrl, string? Images, string? Tags,
    double Weight, Guid CategoryId, Guid BrandId);

public record UpdateProductDto(string Name, string Description, string? ShortDescription, decimal Price, decimal? DiscountPrice,
    string SKU, int StockQuantity, int LowStockThreshold, bool IsActive, bool IsFeatured, string? ImageUrl, string? Images,
    string? Tags, double Weight, Guid CategoryId, Guid BrandId);

// ===== CATEGORY DTOs =====
public record CategoryDto(Guid Id, string Name, string Slug, string? Description, string? ImageUrl, bool IsActive, int SortOrder,
    Guid? ParentCategoryId, List<CategoryDto>? SubCategories);

public record CreateCategoryDto(string Name, string? Description, string? ImageUrl, int SortOrder, Guid? ParentCategoryId);
public record UpdateCategoryDto(string Name, string? Description, string? ImageUrl, bool IsActive, int SortOrder, Guid? ParentCategoryId);

// ===== BRAND DTOs =====
public record BrandDto(Guid Id, string Name, string Slug, string? LogoUrl, string? Description, bool IsActive);
public record CreateBrandDto(string Name, string? LogoUrl, string? Description);
public record UpdateBrandDto(string Name, string? LogoUrl, string? Description, bool IsActive);

// ===== CART DTOs =====
public record CartDto(Guid Id, Guid UserId, List<CartItemDto> Items, decimal TotalAmount);
public record CartItemDto(Guid Id, Guid ProductId, string ProductName, string? ProductImageUrl, decimal UnitPrice, decimal? DiscountPrice, int Quantity, decimal SubTotal);
public record AddToCartDto(Guid ProductId, int Quantity);
public record UpdateCartItemDto(int Quantity);

// ===== WISHLIST DTOs =====
public record WishlistDto(Guid Id, Guid UserId, List<WishlistItemDto> Items);
public record WishlistItemDto(Guid Id, Guid ProductId, string ProductName, string? ProductImageUrl, decimal Price, decimal? DiscountPrice, bool InStock, DateTime AddedAt);
public record AddToWishlistDto(Guid ProductId);

// ===== ORDER DTOs =====
public record OrderDto(Guid Id, string OrderNumber, OrderStatus Status, decimal SubTotal, decimal ShippingCost, decimal Tax,
    decimal DiscountAmount, decimal TotalAmount, string ShippingStreet, string ShippingCity, string ShippingState,
    string ShippingZipCode, string ShippingCountry, string? TrackingNumber, string? Notes, DateTime? ShippedDate,
    DateTime? DeliveredDate, DateTime? CancelledDate, string? CancellationReason, List<OrderItemDto> Items,
    PaymentDto? Payment, DateTime CreatedAt);

public record OrderItemDto(Guid Id, Guid ProductId, string ProductName, string? ProductImageUrl, string ProductSKU,
    int Quantity, decimal UnitPrice, decimal TotalPrice);

public record PlaceOrderDto(Guid ShippingAddressId, PaymentMethod PaymentMethod, string? CouponCode, string? Notes);
public record UpdateOrderStatusDto(OrderStatus Status, string? TrackingNumber);

// ===== ADDRESS DTOs =====
public record AddressDto(Guid Id, string Label, string FullName, string Phone, string Street, string City,
    string State, string ZipCode, string Country, bool IsDefault);

public record CreateAddressDto(string Label, string FullName, string Phone, string Street, string City,
    string State, string ZipCode, string Country, bool IsDefault);

public record UpdateAddressDto(string Label, string FullName, string Phone, string Street, string City,
    string State, string ZipCode, string Country, bool IsDefault);

// ===== PAYMENT DTOs =====
public record PaymentDto(Guid Id, Guid OrderId, PaymentMethod Method, PaymentStatus Status,
    string? TransactionId, decimal Amount, DateTime? PaidAt);

// ===== REFUND DTOs =====
public record RefundDto(Guid Id, Guid OrderId, string OrderNumber, RefundStatus Status, string Reason,
    decimal Amount, string? AdminNotes, DateTime? ProcessedAt, DateTime CreatedAt);

public record RequestRefundDto(Guid OrderId, string Reason);
public record ProcessRefundDto(RefundStatus Status, string? AdminNotes);

// ===== REVIEW DTOs =====
public record ReviewDto(Guid Id, Guid UserId, string UserName, Guid ProductId, int Rating, string? Title,
    string? Comment, bool IsVerifiedPurchase, bool IsApproved, DateTime CreatedAt);

public record CreateReviewDto(int Rating, string? Title, string? Comment);
public record UpdateReviewDto(int Rating, string? Title, string? Comment);

// ===== COUPON DTOs =====
public record CouponDto(Guid Id, string Code, string? Description, DiscountType DiscountType, decimal DiscountValue,
    decimal? MinOrderAmount, decimal? MaxDiscountAmount, int MaxUses, int CurrentUses, DateTime? StartDate,
    DateTime ExpiryDate, bool IsActive);

public record CreateCouponDto(string Code, string? Description, DiscountType DiscountType, decimal DiscountValue,
    decimal? MinOrderAmount, decimal? MaxDiscountAmount, int MaxUses, DateTime? StartDate, DateTime ExpiryDate);

public record UpdateCouponDto(string? Description, DiscountType DiscountType, decimal DiscountValue,
    decimal? MinOrderAmount, decimal? MaxDiscountAmount, int MaxUses, DateTime? StartDate, DateTime ExpiryDate, bool IsActive);

public record ValidateCouponDto(string Code, decimal OrderAmount);
public record CouponValidationResultDto(bool IsValid, string Message, decimal DiscountAmount);

// ===== ADMIN DASHBOARD DTOs =====
public record DashboardStatsDto(decimal TotalRevenue, int TotalOrders, int TotalProducts, int TotalUsers,
    int PendingOrders, int LowStockProducts, decimal TodayRevenue, int TodayOrders,
    List<RecentOrderDto> RecentOrders, List<TopProductDto> TopProducts, List<MonthlySalesDto> MonthlySales);

public record RecentOrderDto(Guid Id, string OrderNumber, string CustomerName, decimal TotalAmount, OrderStatus Status, DateTime CreatedAt);
public record TopProductDto(Guid Id, string Name, string? ImageUrl, int TotalSold, decimal TotalRevenue);
public record MonthlySalesDto(string Month, decimal Revenue, int Orders);

