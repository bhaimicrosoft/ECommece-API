using AutoMapper;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User
        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, opt => opt.MapFrom(s => s.Role.ToString()));

        // Product
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.BrandName, opt => opt.MapFrom(s => s.Brand.Name));
        CreateMap<CreateProductDto, Product>()
            .ForMember(d => d.Slug, opt => opt.Ignore());
        CreateMap<UpdateProductDto, Product>()
            .ForMember(d => d.Slug, opt => opt.Ignore());

        // Category
        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.SubCategories, opt => opt.MapFrom(s => s.SubCategories));
        CreateMap<CreateCategoryDto, Category>()
            .ForMember(d => d.Slug, opt => opt.Ignore());

        // Brand
        CreateMap<Brand, BrandDto>();
        CreateMap<CreateBrandDto, Brand>()
            .ForMember(d => d.Slug, opt => opt.Ignore());

        // Cart
        CreateMap<Cart, CartDto>()
            .ForMember(d => d.TotalAmount, opt => opt.MapFrom(s =>
                s.Items.Sum(i => (i.Product.DiscountPrice ?? i.Product.Price) * i.Quantity)));
        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductName, opt => opt.MapFrom(s => s.Product.Name))
            .ForMember(d => d.ProductImageUrl, opt => opt.MapFrom(s => s.Product.ImageUrl))
            .ForMember(d => d.UnitPrice, opt => opt.MapFrom(s => s.Product.Price))
            .ForMember(d => d.DiscountPrice, opt => opt.MapFrom(s => s.Product.DiscountPrice))
            .ForMember(d => d.SubTotal, opt => opt.MapFrom(s => (s.Product.DiscountPrice ?? s.Product.Price) * s.Quantity));

        // Wishlist
        CreateMap<Wishlist, WishlistDto>();
        CreateMap<WishlistItem, WishlistItemDto>()
            .ForMember(d => d.ProductName, opt => opt.MapFrom(s => s.Product.Name))
            .ForMember(d => d.ProductImageUrl, opt => opt.MapFrom(s => s.Product.ImageUrl))
            .ForMember(d => d.Price, opt => opt.MapFrom(s => s.Product.Price))
            .ForMember(d => d.DiscountPrice, opt => opt.MapFrom(s => s.Product.DiscountPrice))
            .ForMember(d => d.InStock, opt => opt.MapFrom(s => s.Product.StockQuantity > 0))
            .ForMember(d => d.AddedAt, opt => opt.MapFrom(s => s.CreatedAt));

        // Order
        CreateMap<Order, OrderDto>();
        CreateMap<OrderItem, OrderItemDto>();

        // Address
        CreateMap<Address, AddressDto>();
        CreateMap<CreateAddressDto, Address>();
        CreateMap<UpdateAddressDto, Address>();

        // Payment
        CreateMap<Payment, PaymentDto>();

        // Refund
        CreateMap<Refund, RefundDto>()
            .ForMember(d => d.OrderNumber, opt => opt.MapFrom(s => s.Order.OrderNumber));

        // Review
        CreateMap<Review, ReviewDto>()
            .ForMember(d => d.UserName, opt => opt.MapFrom(s => $"{s.User.FirstName} {s.User.LastName}"));

        // Coupon
        CreateMap<Coupon, CouponDto>();
        CreateMap<CreateCouponDto, Coupon>();
    }
}

