using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products;

// ===== GET PRODUCTS (Paginated, Filterable) =====
public record GetProductsQuery(string? Search, Guid? CategoryId, Guid? BrandId, decimal? MinPrice, decimal? MaxPrice,
    bool? IsFeatured, string? SortBy, bool SortDescending, int PageNumber = 1, int PageSize = 12) : IRequest<ApiResponse<PaginatedResult<ProductDto>>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, ApiResponse<PaginatedResult<ProductDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductsQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<PaginatedResult<ProductDto>>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var query = _uow.Products.Query()
            .Include(p => p.Category).Include(p => p.Brand)
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(p => p.Name.Contains(request.Search) || p.Description.Contains(request.Search) || p.Tags!.Contains(request.Search));
        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        if (request.BrandId.HasValue)
            query = query.Where(p => p.BrandId == request.BrandId.Value);
        if (request.MinPrice.HasValue)
            query = query.Where(p => (p.DiscountPrice ?? p.Price) >= request.MinPrice.Value);
        if (request.MaxPrice.HasValue)
            query = query.Where(p => (p.DiscountPrice ?? p.Price) <= request.MaxPrice.Value);
        if (request.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == request.IsFeatured.Value);

        query = request.SortBy?.ToLower() switch
        {
            "price" => request.SortDescending ? query.OrderByDescending(p => p.DiscountPrice ?? p.Price) : query.OrderBy(p => p.DiscountPrice ?? p.Price),
            "name" => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "rating" => query.OrderByDescending(p => p.AverageRating),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToListAsync(ct);

        var result = new PaginatedResult<ProductDto>
        {
            Items = _mapper.Map<List<ProductDto>>(items),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PaginatedResult<ProductDto>>.SuccessResponse(result);
    }
}

// ===== GET PRODUCT BY ID =====
public record GetProductByIdQuery(Guid Id) : IRequest<ApiResponse<ProductDto>>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductByIdQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken ct)
    {
        var product = await _uow.Products.Query()
            .Include(p => p.Category).Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (product == null)
            return ApiResponse<ProductDto>.FailResponse("Product not found.");

        return ApiResponse<ProductDto>.SuccessResponse(_mapper.Map<ProductDto>(product));
    }
}

// ===== CREATE PRODUCT (Admin) =====
public record CreateProductCommand(CreateProductDto Dto) : IRequest<ApiResponse<ProductDto>>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateProductCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<ProductDto>> Handle(CreateProductCommand request, CancellationToken ct)
    {
        var product = _mapper.Map<Product>(request.Dto);
        product.Slug = GenerateSlug(request.Dto.Name);

        await _uow.Products.AddAsync(product, ct);
        await _uow.SaveChangesAsync(ct);

        // Reload with navigation properties
        var created = await _uow.Products.Query()
            .Include(p => p.Category).Include(p => p.Brand)
            .FirstAsync(p => p.Id == product.Id, ct);

        return ApiResponse<ProductDto>.SuccessResponse(_mapper.Map<ProductDto>(created), "Product created.");
    }

    private static string GenerateSlug(string name) =>
        name.ToLower().Replace(" ", "-").Replace("--", "-").Trim('-') + "-" + Guid.NewGuid().ToString()[..8];
}

// ===== UPDATE PRODUCT (Admin) =====
public record UpdateProductCommand(Guid Id, UpdateProductDto Dto) : IRequest<ApiResponse<ProductDto>>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateProductCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<ProductDto>> Handle(UpdateProductCommand request, CancellationToken ct)
    {
        var product = await _uow.Products.Query().Include(p => p.Category).Include(p => p.Brand).FirstOrDefaultAsync(p => p.Id == request.Id, ct);
        if (product == null) return ApiResponse<ProductDto>.FailResponse("Product not found.");

        product.Name = request.Dto.Name;
        product.Description = request.Dto.Description;
        product.ShortDescription = request.Dto.ShortDescription;
        product.Price = request.Dto.Price;
        product.DiscountPrice = request.Dto.DiscountPrice;
        product.SKU = request.Dto.SKU;
        product.StockQuantity = request.Dto.StockQuantity;
        product.LowStockThreshold = request.Dto.LowStockThreshold;
        product.IsActive = request.Dto.IsActive;
        product.IsFeatured = request.Dto.IsFeatured;
        product.ImageUrl = request.Dto.ImageUrl;
        product.Images = request.Dto.Images;
        product.Tags = request.Dto.Tags;
        product.Weight = request.Dto.Weight;
        product.CategoryId = request.Dto.CategoryId;
        product.BrandId = request.Dto.BrandId;
        product.UpdatedAt = DateTime.UtcNow;

        await _uow.Products.UpdateAsync(product, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<ProductDto>.SuccessResponse(_mapper.Map<ProductDto>(product), "Product updated.");
    }
}

// ===== DELETE PRODUCT (Admin) =====
public record DeleteProductCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteProductCommandHandler(IUnitOfWork uow) { _uow = uow; }

    public async Task<ApiResponse<bool>> Handle(DeleteProductCommand request, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(request.Id, ct);
        if (product == null) return ApiResponse<bool>.FailResponse("Product not found.");

        await _uow.Products.DeleteAsync(product, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResponse(true, "Product deleted.");
    }
}

