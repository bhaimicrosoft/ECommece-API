using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Infrastructure.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync();

        if (await context.Users.AnyAsync()) return;

        // Seed Admin User
        var admin = new User
        {
            Email = "admin@ecommerce.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "System",
            LastName = "Admin",
            Role = UserRole.Admin,
            IsActive = true
        };
        context.Users.Add(admin);

        // Seed Customer
        var customer = new User
        {
            Email = "customer@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
            FirstName = "John",
            LastName = "Doe",
            Phone = "+1234567890",
            Role = UserRole.Customer,
            IsActive = true
        };
        context.Users.Add(customer);

        // Seed Brands
        var brands = new[]
        {
            new Brand { Name = "Apple", Slug = "apple", Description = "Think Different", LogoUrl = "https://placehold.co/200x200?text=Apple" },
            new Brand { Name = "Samsung", Slug = "samsung", Description = "Do What You Can't", LogoUrl = "https://placehold.co/200x200?text=Samsung" },
            new Brand { Name = "Sony", Slug = "sony", Description = "Be Moved", LogoUrl = "https://placehold.co/200x200?text=Sony" },
            new Brand { Name = "Nike", Slug = "nike", Description = "Just Do It", LogoUrl = "https://placehold.co/200x200?text=Nike" },
            new Brand { Name = "Adidas", Slug = "adidas", Description = "Impossible is Nothing", LogoUrl = "https://placehold.co/200x200?text=Adidas" }
        };
        context.Brands.AddRange(brands);

        // Seed Categories
        var electronics = new Category { Name = "Electronics", Slug = "electronics", SortOrder = 1, ImageUrl = "https://placehold.co/400x300?text=Electronics" };
        var clothing = new Category { Name = "Clothing", Slug = "clothing", SortOrder = 2, ImageUrl = "https://placehold.co/400x300?text=Clothing" };
        var homeGarden = new Category { Name = "Home & Garden", Slug = "home-garden", SortOrder = 3, ImageUrl = "https://placehold.co/400x300?text=Home" };

        context.Categories.AddRange(electronics, clothing, homeGarden);
        await context.SaveChangesAsync();

        var phones = new Category { Name = "Smartphones", Slug = "smartphones", SortOrder = 1, ParentCategoryId = electronics.Id };
        var laptops = new Category { Name = "Laptops", Slug = "laptops", SortOrder = 2, ParentCategoryId = electronics.Id };
        var menClothing = new Category { Name = "Men's Clothing", Slug = "mens-clothing", SortOrder = 1, ParentCategoryId = clothing.Id };
        var womenClothing = new Category { Name = "Women's Clothing", Slug = "womens-clothing", SortOrder = 2, ParentCategoryId = clothing.Id };

        context.Categories.AddRange(phones, laptops, menClothing, womenClothing);
        await context.SaveChangesAsync();

        // Seed Products
        var products = new[]
        {
            new Product { Name = "iPhone 15 Pro", Slug = "iphone-15-pro", Description = "The most advanced iPhone ever with A17 Pro chip.", ShortDescription = "Latest iPhone with titanium design", Price = 999.99m, DiscountPrice = 949.99m, SKU = "APL-IP15P-001", StockQuantity = 50, IsFeatured = true, ImageUrl = "https://placehold.co/600x600?text=iPhone+15+Pro", Tags = "phone,apple,iphone,5g", Weight = 0.19, CategoryId = phones.Id, BrandId = brands[0].Id },
            new Product { Name = "Samsung Galaxy S24 Ultra", Slug = "samsung-galaxy-s24-ultra", Description = "Samsung's flagship with S Pen and AI features.", ShortDescription = "AI-powered Samsung flagship", Price = 1199.99m, DiscountPrice = 1099.99m, SKU = "SAM-S24U-001", StockQuantity = 40, IsFeatured = true, ImageUrl = "https://placehold.co/600x600?text=Galaxy+S24", Tags = "phone,samsung,galaxy,5g,ai", Weight = 0.23, CategoryId = phones.Id, BrandId = brands[1].Id },
            new Product { Name = "MacBook Pro 16\"", Slug = "macbook-pro-16", Description = "Supercharged by M3 Pro or M3 Max chip for incredible performance.", ShortDescription = "Pro laptop for professionals", Price = 2499.99m, SKU = "APL-MBP16-001", StockQuantity = 25, IsFeatured = true, ImageUrl = "https://placehold.co/600x600?text=MacBook+Pro", Tags = "laptop,apple,macbook,m3", Weight = 2.14, CategoryId = laptops.Id, BrandId = brands[0].Id },
            new Product { Name = "Sony WH-1000XM5", Slug = "sony-wh-1000xm5", Description = "Industry-leading noise canceling headphones.", ShortDescription = "Premium noise-cancelling headphones", Price = 349.99m, DiscountPrice = 299.99m, SKU = "SNY-WH5-001", StockQuantity = 100, ImageUrl = "https://placehold.co/600x600?text=Sony+XM5", Tags = "headphones,sony,noise-cancelling,wireless", Weight = 0.25, CategoryId = electronics.Id, BrandId = brands[2].Id },
            new Product { Name = "Nike Air Max 270", Slug = "nike-air-max-270", Description = "The Nike Air Max 270 delivers visible cushioning under every step.", ShortDescription = "Comfortable lifestyle shoes", Price = 150.00m, DiscountPrice = 119.99m, SKU = "NKE-AM270-001", StockQuantity = 200, ImageUrl = "https://placehold.co/600x600?text=Air+Max+270", Tags = "shoes,nike,air-max,running", Weight = 0.35, CategoryId = menClothing.Id, BrandId = brands[3].Id },
            new Product { Name = "Adidas Ultraboost 23", Slug = "adidas-ultraboost-23", Description = "Experience incredible energy return with every stride.", ShortDescription = "Premium running shoes", Price = 190.00m, DiscountPrice = 159.99m, SKU = "ADD-UB23-001", StockQuantity = 150, ImageUrl = "https://placehold.co/600x600?text=Ultraboost", Tags = "shoes,adidas,running,boost", Weight = 0.32, CategoryId = menClothing.Id, BrandId = brands[4].Id },
            new Product { Name = "Samsung 65\" OLED TV", Slug = "samsung-65-oled-tv", Description = "Stunning 4K OLED display with Dolby Vision and HDR10+.", ShortDescription = "Premium 65-inch OLED TV", Price = 1799.99m, DiscountPrice = 1499.99m, SKU = "SAM-TV65-001", StockQuantity = 15, IsFeatured = true, ImageUrl = "https://placehold.co/600x600?text=OLED+TV", Tags = "tv,samsung,oled,4k,smart-tv", Weight = 18.5, CategoryId = electronics.Id, BrandId = brands[1].Id },
            new Product { Name = "Nike Dri-FIT T-Shirt", Slug = "nike-dri-fit-tshirt", Description = "Stay dry and comfortable during workouts with Dri-FIT technology.", ShortDescription = "Performance workout tee", Price = 35.00m, DiscountPrice = 27.99m, SKU = "NKE-DFT-001", StockQuantity = 500, ImageUrl = "https://placehold.co/600x600?text=Dri-FIT", Tags = "shirt,nike,dri-fit,workout", Weight = 0.15, CategoryId = menClothing.Id, BrandId = brands[3].Id }
        };
        context.Products.AddRange(products);

        // Create cart and wishlist for customer
        context.Carts.Add(new Cart { UserId = customer.Id });
        context.Wishlists.Add(new Wishlist { UserId = customer.Id });

        // Seed an address for customer
        context.Addresses.Add(new Address
        {
            UserId = customer.Id,
            Label = "Home",
            FullName = "John Doe",
            Phone = "+1234567890",
            Street = "123 Main Street",
            City = "New York",
            State = "NY",
            ZipCode = "10001",
            Country = "United States",
            IsDefault = true
        });

        // Seed Coupons
        context.Coupons.AddRange(
            new Coupon { Code = "WELCOME10", Description = "10% off for new customers", DiscountType = DiscountType.Percentage, DiscountValue = 10, MinOrderAmount = 50, MaxDiscountAmount = 100, MaxUses = 1000, ExpiryDate = DateTime.UtcNow.AddYears(1) },
            new Coupon { Code = "FLAT50", Description = "Flat $50 off on orders above $500", DiscountType = DiscountType.Flat, DiscountValue = 50, MinOrderAmount = 500, MaxUses = 500, ExpiryDate = DateTime.UtcNow.AddMonths(6) }
        );

        await context.SaveChangesAsync();
    }
}

