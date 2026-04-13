using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders;

// ===== PLACE ORDER =====
public record PlaceOrderCommand(Guid UserId, Guid ShippingAddressId, PaymentMethod PaymentMethod, string? CouponCode, string? Notes)
    : IRequest<ApiResponse<OrderDto>>;

public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, ApiResponse<OrderDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public PlaceOrderCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<OrderDto>> Handle(PlaceOrderCommand request, CancellationToken ct)
    {
        // Get cart
        var cart = await _uow.Carts.Query()
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, ct);

        if (cart == null || !cart.Items.Any())
            return ApiResponse<OrderDto>.FailResponse("Cart is empty.");

        // Get shipping address
        var address = await _uow.Addresses.Query()
            .FirstOrDefaultAsync(a => a.Id == request.ShippingAddressId && a.UserId == request.UserId, ct);

        if (address == null)
            return ApiResponse<OrderDto>.FailResponse("Shipping address not found.");

        // Calculate totals
        decimal subTotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in cart.Items)
        {
            if (item.Product.StockQuantity < item.Quantity)
                return ApiResponse<OrderDto>.FailResponse($"Insufficient stock for {item.Product.Name}.");

            var unitPrice = item.Product.DiscountPrice ?? item.Product.Price;
            var orderItem = new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductImageUrl = item.Product.ImageUrl,
                ProductSKU = item.Product.SKU,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = unitPrice * item.Quantity
            };
            orderItems.Add(orderItem);
            subTotal += orderItem.TotalPrice;

            // Reduce stock
            item.Product.StockQuantity -= item.Quantity;
            await _uow.Products.UpdateAsync(item.Product, ct);
        }

        decimal shippingCost = subTotal >= 500 ? 0 : 49.99m; // Free shipping above 500
        decimal tax = subTotal * 0.18m; // 18% GST
        decimal discountAmount = 0;

        // Apply coupon if provided
        Coupon? coupon = null;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var coupons = await _uow.Coupons.FindAsync(c => c.Code == request.CouponCode && c.IsActive, ct);
            coupon = coupons.FirstOrDefault();

            if (coupon != null && coupon.ExpiryDate > DateTime.UtcNow && coupon.CurrentUses < coupon.MaxUses)
            {
                if (coupon.MinOrderAmount == null || subTotal >= coupon.MinOrderAmount)
                {
                    discountAmount = coupon.DiscountType == DiscountType.Percentage
                        ? subTotal * (coupon.DiscountValue / 100)
                        : coupon.DiscountValue;

                    if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                        discountAmount = coupon.MaxDiscountAmount.Value;

                    coupon.CurrentUses++;
                    await _uow.Coupons.UpdateAsync(coupon, ct);
                }
            }
        }

        var order = new Order
        {
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            UserId = request.UserId,
            Status = OrderStatus.Pending,
            SubTotal = subTotal,
            ShippingCost = shippingCost,
            Tax = tax,
            DiscountAmount = discountAmount,
            TotalAmount = subTotal + shippingCost + tax - discountAmount,
            ShippingStreet = address.Street,
            ShippingCity = address.City,
            ShippingState = address.State,
            ShippingZipCode = address.ZipCode,
            ShippingCountry = address.Country,
            Notes = request.Notes,
            CouponId = coupon?.Id,
            Items = orderItems
        };

        await _uow.Orders.AddAsync(order, ct);

        // Create payment
        var payment = new Payment
        {
            OrderId = order.Id,
            Method = request.PaymentMethod,
            Amount = order.TotalAmount,
            Status = request.PaymentMethod == PaymentMethod.COD ? PaymentStatus.Pending : PaymentStatus.Completed,
            TransactionId = request.PaymentMethod != PaymentMethod.COD ? $"TXN-{Guid.NewGuid().ToString()[..12].ToUpper()}" : null,
            PaidAt = request.PaymentMethod != PaymentMethod.COD ? DateTime.UtcNow : null
        };
        await _uow.Payments.AddAsync(payment, ct);

        if (payment.Status == PaymentStatus.Completed)
            order.Status = OrderStatus.Confirmed;

        // Clear cart
        foreach (var item in cart.Items.ToList())
            await _uow.CartItems.DeleteAsync(item, ct);

        await _uow.SaveChangesAsync(ct);

        // Reload order with all includes
        var createdOrder = await _uow.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .FirstAsync(o => o.Id == order.Id, ct);

        return ApiResponse<OrderDto>.SuccessResponse(_mapper.Map<OrderDto>(createdOrder), "Order placed successfully.");
    }
}

// ===== GET USER ORDERS =====
public record GetOrdersQuery(Guid UserId, OrderStatus? Status, int PageNumber = 1, int PageSize = 10) : IRequest<ApiResponse<PaginatedResult<OrderDto>>>;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, ApiResponse<PaginatedResult<OrderDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetOrdersQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<PaginatedResult<OrderDto>>> Handle(GetOrdersQuery request, CancellationToken ct)
    {
        var query = _uow.Orders.Query()
            .Include(o => o.Items).Include(o => o.Payment)
            .Where(o => o.UserId == request.UserId);

        if (request.Status.HasValue)
            query = query.Where(o => o.Status == request.Status.Value);

        query = query.OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToListAsync(ct);

        var result = new PaginatedResult<OrderDto>
        {
            Items = _mapper.Map<List<OrderDto>>(items),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PaginatedResult<OrderDto>>.SuccessResponse(result);
    }
}

// ===== GET ORDER BY ID =====
public record GetOrderByIdQuery(Guid OrderId, Guid? UserId = null) : IRequest<ApiResponse<OrderDto>>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, ApiResponse<OrderDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetOrderByIdQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken ct)
    {
        var query = _uow.Orders.Query()
            .Include(o => o.Items).Include(o => o.Payment)
            .Where(o => o.Id == request.OrderId);

        if (request.UserId.HasValue)
            query = query.Where(o => o.UserId == request.UserId.Value);

        var order = await query.FirstOrDefaultAsync(ct);
        if (order == null) return ApiResponse<OrderDto>.FailResponse("Order not found.");

        return ApiResponse<OrderDto>.SuccessResponse(_mapper.Map<OrderDto>(order));
    }
}

// ===== CANCEL ORDER =====
public record CancelOrderCommand(Guid OrderId, Guid UserId, string? Reason) : IRequest<ApiResponse<OrderDto>>;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, ApiResponse<OrderDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CancelOrderCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<OrderDto>> Handle(CancelOrderCommand request, CancellationToken ct)
    {
        var order = await _uow.Orders.Query()
            .Include(o => o.Items).Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == request.UserId, ct);

        if (order == null) return ApiResponse<OrderDto>.FailResponse("Order not found.");

        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            return ApiResponse<OrderDto>.FailResponse("Order cannot be cancelled at this stage.");

        order.Status = OrderStatus.Cancelled;
        order.CancelledDate = DateTime.UtcNow;
        order.CancellationReason = request.Reason;
        order.UpdatedAt = DateTime.UtcNow;

        // Restore stock
        foreach (var item in order.Items)
        {
            var product = await _uow.Products.GetByIdAsync(item.ProductId, ct);
            if (product != null)
            {
                product.StockQuantity += item.Quantity;
                await _uow.Products.UpdateAsync(product, ct);
            }
        }

        await _uow.Orders.UpdateAsync(order, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<OrderDto>.SuccessResponse(_mapper.Map<OrderDto>(order), "Order cancelled successfully.");
    }
}

// ===== UPDATE ORDER STATUS (Admin) =====
public record UpdateOrderStatusCommand(Guid OrderId, OrderStatus Status, string? TrackingNumber) : IRequest<ApiResponse<OrderDto>>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, ApiResponse<OrderDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateOrderStatusCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<OrderDto>> Handle(UpdateOrderStatusCommand request, CancellationToken ct)
    {
        var order = await _uow.Orders.Query()
            .Include(o => o.Items).Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, ct);

        if (order == null) return ApiResponse<OrderDto>.FailResponse("Order not found.");

        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;

        if (request.Status == OrderStatus.Shipped)
        {
            order.ShippedDate = DateTime.UtcNow;
            order.TrackingNumber = request.TrackingNumber;
        }
        else if (request.Status == OrderStatus.Delivered)
        {
            order.DeliveredDate = DateTime.UtcNow;
        }

        await _uow.Orders.UpdateAsync(order, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<OrderDto>.SuccessResponse(_mapper.Map<OrderDto>(order), "Order status updated.");
    }
}

