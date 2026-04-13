using ECommerce.Domain.Entities;

namespace ECommerce.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Product> Products { get; }
    IRepository<Category> Categories { get; }
    IRepository<Brand> Brands { get; }
    IRepository<Cart> Carts { get; }
    IRepository<CartItem> CartItems { get; }
    IRepository<Wishlist> Wishlists { get; }
    IRepository<WishlistItem> WishlistItems { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    IRepository<Address> Addresses { get; }
    IRepository<Payment> Payments { get; }
    IRepository<Refund> Refunds { get; }
    IRepository<Review> Reviews { get; }
    IRepository<Coupon> Coupons { get; }
    IRepository<UserRefreshToken> UserRefreshTokens { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

