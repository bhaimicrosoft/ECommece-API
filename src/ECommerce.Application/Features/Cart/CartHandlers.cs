using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart;

// ===== GET CART =====
public record GetCartQuery(Guid UserId) : IRequest<ApiResponse<CartDto>>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, ApiResponse<CartDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetCartQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<CartDto>> Handle(GetCartQuery request, CancellationToken ct)
    {
        var cart = await _uow.Carts.Query()
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, ct);

        if (cart == null)
        {
            cart = new Domain.Entities.Cart { UserId = request.UserId };
            await _uow.Carts.AddAsync(cart, ct);
            await _uow.SaveChangesAsync(ct);
        }

        return ApiResponse<CartDto>.SuccessResponse(_mapper.Map<CartDto>(cart));
    }
}

// ===== ADD TO CART =====
public record AddToCartCommand(Guid UserId, Guid ProductId, int Quantity) : IRequest<ApiResponse<CartDto>>;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, ApiResponse<CartDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public AddToCartCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<CartDto>> Handle(AddToCartCommand request, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(request.ProductId, ct);
        if (product == null) return ApiResponse<CartDto>.FailResponse("Product not found.");
        if (product.StockQuantity < request.Quantity) return ApiResponse<CartDto>.FailResponse("Insufficient stock.");

        var cart = await _uow.Carts.Query()
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, ct);

        if (cart == null)
        {
            cart = new Domain.Entities.Cart { UserId = request.UserId };
            await _uow.Carts.AddAsync(cart, ct);
            await _uow.SaveChangesAsync(ct);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            existingItem.UnitPrice = product.DiscountPrice ?? product.Price;
            await _uow.CartItems.UpdateAsync(existingItem, ct);
        }
        else
        {
            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                UnitPrice = product.DiscountPrice ?? product.Price
            };
            await _uow.CartItems.AddAsync(cartItem, ct);
        }

        await _uow.SaveChangesAsync(ct);

        // Reload
        cart = await _uow.Carts.Query()
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstAsync(c => c.UserId == request.UserId, ct);

        return ApiResponse<CartDto>.SuccessResponse(_mapper.Map<CartDto>(cart), "Item added to cart.");
    }
}

// ===== UPDATE CART ITEM =====
public record UpdateCartItemCommand(Guid UserId, Guid CartItemId, int Quantity) : IRequest<ApiResponse<CartDto>>;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, ApiResponse<CartDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateCartItemCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<CartDto>> Handle(UpdateCartItemCommand request, CancellationToken ct)
    {
        var cartItem = await _uow.CartItems.Query()
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId && ci.Cart.UserId == request.UserId, ct);

        if (cartItem == null) return ApiResponse<CartDto>.FailResponse("Cart item not found.");

        if (request.Quantity <= 0)
        {
            await _uow.CartItems.DeleteAsync(cartItem, ct);
        }
        else
        {
            cartItem.Quantity = request.Quantity;
            await _uow.CartItems.UpdateAsync(cartItem, ct);
        }

        await _uow.SaveChangesAsync(ct);

        var cart = await _uow.Carts.Query()
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstAsync(c => c.UserId == request.UserId, ct);

        return ApiResponse<CartDto>.SuccessResponse(_mapper.Map<CartDto>(cart), "Cart updated.");
    }
}

// ===== REMOVE CART ITEM =====
public record RemoveCartItemCommand(Guid UserId, Guid CartItemId) : IRequest<ApiResponse<CartDto>>;

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, ApiResponse<CartDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public RemoveCartItemCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<CartDto>> Handle(RemoveCartItemCommand request, CancellationToken ct)
    {
        var cartItem = await _uow.CartItems.Query()
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId && ci.Cart.UserId == request.UserId, ct);

        if (cartItem == null) return ApiResponse<CartDto>.FailResponse("Cart item not found.");

        await _uow.CartItems.DeleteAsync(cartItem, ct);
        await _uow.SaveChangesAsync(ct);

        var cart = await _uow.Carts.Query()
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstAsync(c => c.UserId == request.UserId, ct);

        return ApiResponse<CartDto>.SuccessResponse(_mapper.Map<CartDto>(cart), "Item removed from cart.");
    }
}

// ===== CLEAR CART =====
public record ClearCartCommand(Guid UserId) : IRequest<ApiResponse<bool>>;

public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public ClearCartCommandHandler(IUnitOfWork uow) { _uow = uow; }

    public async Task<ApiResponse<bool>> Handle(ClearCartCommand request, CancellationToken ct)
    {
        var cart = await _uow.Carts.Query()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, ct);

        if (cart == null) return ApiResponse<bool>.SuccessResponse(true);

        foreach (var item in cart.Items.ToList())
            await _uow.CartItems.DeleteAsync(item, ct);

        await _uow.SaveChangesAsync(ct);
        return ApiResponse<bool>.SuccessResponse(true, "Cart cleared.");
    }
}

