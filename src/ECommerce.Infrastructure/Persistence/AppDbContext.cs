using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Refund> Refunds => Set<Refund>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<UserRefreshToken> UserRefreshTokens => Set<UserRefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.PasswordHash).HasMaxLength(512);
            e.Property(u => u.FirstName).HasMaxLength(100);
            e.Property(u => u.LastName).HasMaxLength(100);
        });

        // Product
        modelBuilder.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.HasIndex(p => p.SKU).IsUnique();
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.Property(p => p.DiscountPrice).HasPrecision(18, 2);
            e.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
            e.HasOne(p => p.Brand).WithMany(b => b.Products).HasForeignKey(p => p.BrandId);
        });

        // Category
        modelBuilder.Entity<Category>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
            e.HasOne(c => c.ParentCategory).WithMany(c => c.SubCategories).HasForeignKey(c => c.ParentCategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        // Brand
        modelBuilder.Entity<Brand>(e =>
        {
            e.HasIndex(b => b.Slug).IsUnique();
        });

        // Cart (1:1 with User)
        modelBuilder.Entity<Cart>(e =>
        {
            e.HasOne(c => c.User).WithOne(u => u.Cart).HasForeignKey<Cart>(c => c.UserId);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.Property(ci => ci.UnitPrice).HasPrecision(18, 2);
            e.HasOne(ci => ci.Cart).WithMany(c => c.Items).HasForeignKey(ci => ci.CartId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ci => ci.Product).WithMany(p => p.CartItems).HasForeignKey(ci => ci.ProductId);
        });

        // Wishlist (1:1 with User)
        modelBuilder.Entity<Wishlist>(e =>
        {
            e.HasOne(w => w.User).WithOne(u => u.Wishlist).HasForeignKey<Wishlist>(w => w.UserId);
        });

        modelBuilder.Entity<WishlistItem>(e =>
        {
            e.HasOne(wi => wi.Wishlist).WithMany(w => w.Items).HasForeignKey(wi => wi.WishlistId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(wi => wi.Product).WithMany(p => p.WishlistItems).HasForeignKey(wi => wi.ProductId);
        });

        // Order
        modelBuilder.Entity<Order>(e =>
        {
            e.HasIndex(o => o.OrderNumber).IsUnique();
            e.Property(o => o.SubTotal).HasPrecision(18, 2);
            e.Property(o => o.ShippingCost).HasPrecision(18, 2);
            e.Property(o => o.Tax).HasPrecision(18, 2);
            e.Property(o => o.DiscountAmount).HasPrecision(18, 2);
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
            e.HasOne(o => o.User).WithMany(u => u.Orders).HasForeignKey(o => o.UserId);
            e.HasOne(o => o.Coupon).WithMany().HasForeignKey(o => o.CouponId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
            e.Property(oi => oi.TotalPrice).HasPrecision(18, 2);
            e.HasOne(oi => oi.Order).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        // Address
        modelBuilder.Entity<Address>(e =>
        {
            e.HasOne(a => a.User).WithMany(u => u.Addresses).HasForeignKey(a => a.UserId);
        });

        // Payment (1:1 with Order)
        modelBuilder.Entity<Payment>(e =>
        {
            e.Property(p => p.Amount).HasPrecision(18, 2);
            e.HasOne(p => p.Order).WithOne(o => o.Payment).HasForeignKey<Payment>(p => p.OrderId);
        });

        // Refund (1:1 with Order)
        modelBuilder.Entity<Refund>(e =>
        {
            e.Property(r => r.Amount).HasPrecision(18, 2);
            e.HasOne(r => r.Order).WithOne(o => o.Refund).HasForeignKey<Refund>(r => r.OrderId);
        });

        // Review
        modelBuilder.Entity<Review>(e =>
        {
            e.HasIndex(r => new { r.UserId, r.ProductId }).IsUnique();
            e.HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId);
            e.HasOne(r => r.Product).WithMany(p => p.Reviews).HasForeignKey(r => r.ProductId);
        });

        // Coupon
        modelBuilder.Entity<Coupon>(e =>
        {
            e.HasIndex(c => c.Code).IsUnique();
            e.Property(c => c.DiscountValue).HasPrecision(18, 2);
            e.Property(c => c.MinOrderAmount).HasPrecision(18, 2);
            e.Property(c => c.MaxDiscountAmount).HasPrecision(18, 2);
        });

        // UserRefreshToken
        modelBuilder.Entity<UserRefreshToken>(e =>
        {
            e.HasIndex(rt => rt.TokenHash).IsUnique();
            e.Property(rt => rt.TokenHash).HasMaxLength(64);
            e.HasOne(rt => rt.User).WithMany(u => u.RefreshTokens).HasForeignKey(rt => rt.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}

