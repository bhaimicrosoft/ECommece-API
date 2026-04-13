using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public string? ImageUrl { get; set; }
    public string? Images { get; set; } // JSON array of image URLs
    public string? Tags { get; set; } // Comma-separated tags
    public double Weight { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }

    // Foreign keys
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;

    // Navigation
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
}

