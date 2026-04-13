using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Categories;

// ===== GET ALL CATEGORIES (Tree) =====
public record GetCategoriesQuery() : IRequest<ApiResponse<List<CategoryDto>>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, ApiResponse<List<CategoryDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetCategoriesQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<List<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        var categories = await _uow.Categories.Query()
            .Include(c => c.SubCategories)
            .Where(c => c.ParentCategoryId == null)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(ct);

        return ApiResponse<List<CategoryDto>>.SuccessResponse(_mapper.Map<List<CategoryDto>>(categories));
    }
}

// ===== CREATE CATEGORY =====
public record CreateCategoryCommand(CreateCategoryDto Dto) : IRequest<ApiResponse<CategoryDto>>;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, ApiResponse<CategoryDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateCategoryCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<CategoryDto>> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var category = _mapper.Map<Category>(request.Dto);
        category.Slug = request.Dto.Name.ToLower().Replace(" ", "-").Replace("--", "-").Trim('-');

        await _uow.Categories.AddAsync(category, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<CategoryDto>.SuccessResponse(_mapper.Map<CategoryDto>(category), "Category created.");
    }
}

// ===== UPDATE CATEGORY =====
public record UpdateCategoryCommand(Guid Id, UpdateCategoryDto Dto) : IRequest<ApiResponse<CategoryDto>>;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, ApiResponse<CategoryDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<CategoryDto>> Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, ct);
        if (category == null) return ApiResponse<CategoryDto>.FailResponse("Category not found.");

        category.Name = request.Dto.Name;
        category.Slug = request.Dto.Name.ToLower().Replace(" ", "-").Replace("--", "-").Trim('-');
        category.Description = request.Dto.Description;
        category.ImageUrl = request.Dto.ImageUrl;
        category.IsActive = request.Dto.IsActive;
        category.SortOrder = request.Dto.SortOrder;
        category.ParentCategoryId = request.Dto.ParentCategoryId;
        category.UpdatedAt = DateTime.UtcNow;

        await _uow.Categories.UpdateAsync(category, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<CategoryDto>.SuccessResponse(_mapper.Map<CategoryDto>(category), "Category updated.");
    }
}

// ===== DELETE CATEGORY =====
public record DeleteCategoryCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteCategoryCommandHandler(IUnitOfWork uow) { _uow = uow; }

    public async Task<ApiResponse<bool>> Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, ct);
        if (category == null) return ApiResponse<bool>.FailResponse("Category not found.");

        await _uow.Categories.DeleteAsync(category, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResponse(true, "Category deleted.");
    }
}

// ===== BRAND HANDLERS =====
public record GetBrandsQuery() : IRequest<ApiResponse<List<BrandDto>>>;

public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, ApiResponse<List<BrandDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetBrandsQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<List<BrandDto>>> Handle(GetBrandsQuery request, CancellationToken ct)
    {
        var brands = await _uow.Brands.GetAllAsync(ct);
        return ApiResponse<List<BrandDto>>.SuccessResponse(_mapper.Map<List<BrandDto>>(brands.ToList()));
    }
}

public record CreateBrandCommand(CreateBrandDto Dto) : IRequest<ApiResponse<BrandDto>>;

public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, ApiResponse<BrandDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateBrandCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<BrandDto>> Handle(CreateBrandCommand request, CancellationToken ct)
    {
        var brand = _mapper.Map<Brand>(request.Dto);
        brand.Slug = request.Dto.Name.ToLower().Replace(" ", "-").Replace("--", "-").Trim('-');

        await _uow.Brands.AddAsync(brand, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<BrandDto>.SuccessResponse(_mapper.Map<BrandDto>(brand), "Brand created.");
    }
}

