using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Wishlists;

// ===== GET WISHLIST =====
public record GetWishlistQuery(Guid UserId) : IRequest<ApiResponse<WishlistDto>>;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, ApiResponse<WishlistDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetWishlistQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<WishlistDto>> Handle(GetWishlistQuery request, CancellationToken ct)
    {
        var wishlist = await _uow.Wishlists.Query()
            .Include(w => w.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(w => w.UserId == request.UserId, ct);

        if (wishlist == null)
        {
            wishlist = new Wishlist { UserId = request.UserId };
            await _uow.Wishlists.AddAsync(wishlist, ct);
            await _uow.SaveChangesAsync(ct);
        }

        return ApiResponse<WishlistDto>.SuccessResponse(_mapper.Map<WishlistDto>(wishlist));
    }
}

// ===== ADD TO WISHLIST =====
public record AddToWishlistCommand(Guid UserId, Guid ProductId) : IRequest<ApiResponse<WishlistDto>>;

public class AddToWishlistCommandHandler : IRequestHandler<AddToWishlistCommand, ApiResponse<WishlistDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public AddToWishlistCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<WishlistDto>> Handle(AddToWishlistCommand request, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(request.ProductId, ct);
        if (product == null) return ApiResponse<WishlistDto>.FailResponse("Product not found.");

        var wishlist = await _uow.Wishlists.Query()
            .Include(w => w.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(w => w.UserId == request.UserId, ct);

        if (wishlist == null)
        {
            wishlist = new Wishlist { UserId = request.UserId };
            await _uow.Wishlists.AddAsync(wishlist, ct);
            await _uow.SaveChangesAsync(ct);
        }

        if (wishlist.Items.Any(i => i.ProductId == request.ProductId))
            return ApiResponse<WishlistDto>.FailResponse("Product already in wishlist.");

        await _uow.WishlistItems.AddAsync(new WishlistItem
        {
            WishlistId = wishlist.Id,
            ProductId = request.ProductId
        }, ct);

        await _uow.SaveChangesAsync(ct);

        wishlist = await _uow.Wishlists.Query()
            .Include(w => w.Items).ThenInclude(i => i.Product)
            .FirstAsync(w => w.UserId == request.UserId, ct);

        return ApiResponse<WishlistDto>.SuccessResponse(_mapper.Map<WishlistDto>(wishlist), "Added to wishlist.");
    }
}

// ===== REMOVE FROM WISHLIST =====
public record RemoveFromWishlistCommand(Guid UserId, Guid ProductId) : IRequest<ApiResponse<WishlistDto>>;

public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, ApiResponse<WishlistDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public RemoveFromWishlistCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<WishlistDto>> Handle(RemoveFromWishlistCommand request, CancellationToken ct)
    {
        var wishlistItem = await _uow.WishlistItems.Query()
            .Include(wi => wi.Wishlist)
            .FirstOrDefaultAsync(wi => wi.Wishlist.UserId == request.UserId && wi.ProductId == request.ProductId, ct);

        if (wishlistItem == null)
            return ApiResponse<WishlistDto>.FailResponse("Item not found in wishlist.");

        await _uow.WishlistItems.DeleteAsync(wishlistItem, ct);
        await _uow.SaveChangesAsync(ct);

        var wishlist = await _uow.Wishlists.Query()
            .Include(w => w.Items).ThenInclude(i => i.Product)
            .FirstAsync(w => w.UserId == request.UserId, ct);

        return ApiResponse<WishlistDto>.SuccessResponse(_mapper.Map<WishlistDto>(wishlist), "Removed from wishlist.");
    }
}

