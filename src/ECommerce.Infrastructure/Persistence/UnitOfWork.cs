using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Persistence.Repositories;

namespace ECommerce.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    private IRepository<User>? _users;
    private IRepository<Product>? _products;
    private IRepository<Category>? _categories;
    private IRepository<Brand>? _brands;
    private IRepository<Cart>? _carts;
    private IRepository<CartItem>? _cartItems;
    private IRepository<Wishlist>? _wishlists;
    private IRepository<WishlistItem>? _wishlistItems;
    private IRepository<Order>? _orders;
    private IRepository<OrderItem>? _orderItems;
    private IRepository<Address>? _addresses;
    private IRepository<Payment>? _payments;
    private IRepository<Refund>? _refunds;
    private IRepository<Review>? _reviews;
    private IRepository<Coupon>? _coupons;
    private IRepository<UserRefreshToken>? _userRefreshTokens;

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<Product> Products => _products ??= new Repository<Product>(_context);
    public IRepository<Category> Categories => _categories ??= new Repository<Category>(_context);
    public IRepository<Brand> Brands => _brands ??= new Repository<Brand>(_context);
    public IRepository<Cart> Carts => _carts ??= new Repository<Cart>(_context);
    public IRepository<CartItem> CartItems => _cartItems ??= new Repository<CartItem>(_context);
    public IRepository<Wishlist> Wishlists => _wishlists ??= new Repository<Wishlist>(_context);
    public IRepository<WishlistItem> WishlistItems => _wishlistItems ??= new Repository<WishlistItem>(_context);
    public IRepository<Order> Orders => _orders ??= new Repository<Order>(_context);
    public IRepository<OrderItem> OrderItems => _orderItems ??= new Repository<OrderItem>(_context);
    public IRepository<Address> Addresses => _addresses ??= new Repository<Address>(_context);
    public IRepository<Payment> Payments => _payments ??= new Repository<Payment>(_context);
    public IRepository<Refund> Refunds => _refunds ??= new Repository<Refund>(_context);
    public IRepository<Review> Reviews => _reviews ??= new Repository<Review>(_context);
    public IRepository<Coupon> Coupons => _coupons ??= new Repository<Coupon>(_context);
    public IRepository<UserRefreshToken> UserRefreshTokens => _userRefreshTokens ??= new Repository<UserRefreshToken>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    public void Dispose() => _context.Dispose();
}

