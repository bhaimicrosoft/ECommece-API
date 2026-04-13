using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Admin;

// ===== DASHBOARD STATS =====
public record GetDashboardStatsQuery() : IRequest<ApiResponse<DashboardStatsDto>>;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, ApiResponse<DashboardStatsDto>>
{
    private readonly IUnitOfWork _uow;

    public GetDashboardStatsQueryHandler(IUnitOfWork uow) { _uow = uow; }

    public async Task<ApiResponse<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var sixMonthsAgo = today.AddMonths(-6);

        var totalRevenue = await _uow.Orders.Query()
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => o.TotalAmount, ct);

        var totalOrders = await _uow.Orders.CountAsync(cancellationToken: ct);
        var totalProducts = await _uow.Products.CountAsync(cancellationToken: ct);
        var totalUsers = await _uow.Users.CountAsync(u => u.Role == UserRole.Customer, ct);
        var pendingOrders = await _uow.Orders.CountAsync(o => o.Status == OrderStatus.Pending, ct);
        var lowStockProducts = await _uow.Products.CountAsync(p => p.StockQuantity <= p.LowStockThreshold && p.IsActive, ct);

        var todayRevenue = await _uow.Orders.Query()
            .Where(o => o.CreatedAt >= today && o.Status != OrderStatus.Cancelled)
            .SumAsync(o => o.TotalAmount, ct);

        var todayOrders = await _uow.Orders.CountAsync(o => o.CreatedAt >= today, ct);

        // Recent orders
        var recentOrders = await _uow.Orders.Query()
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new RecentOrderDto(o.Id, o.OrderNumber,
                o.User.FirstName + " " + o.User.LastName, o.TotalAmount, o.Status, o.CreatedAt))
            .ToListAsync(ct);

        // Top products
        var topProducts = await _uow.OrderItems.Query()
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.Status != OrderStatus.Cancelled)
            .GroupBy(oi => new { oi.ProductId, oi.ProductName, oi.ProductImageUrl })
            .Select(g => new TopProductDto(g.Key.ProductId, g.Key.ProductName, g.Key.ProductImageUrl,
                g.Sum(x => x.Quantity), g.Sum(x => x.TotalPrice)))
            .OrderByDescending(tp => tp.TotalSold)
            .Take(5)
            .ToListAsync(ct);

        // Monthly sales (last 6 months)
        var monthlySales = await _uow.Orders.Query()
            .Where(o => o.CreatedAt >= sixMonthsAgo && o.Status != OrderStatus.Cancelled)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new MonthlySalesDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Sum(o => o.TotalAmount),
                g.Count()))
            .OrderBy(ms => ms.Month)
            .ToListAsync(ct);

        var stats = new DashboardStatsDto(totalRevenue, totalOrders, totalProducts, totalUsers,
            pendingOrders, lowStockProducts, todayRevenue, todayOrders, recentOrders, topProducts, monthlySales);

        return ApiResponse<DashboardStatsDto>.SuccessResponse(stats);
    }
}

// ===== GET ALL ORDERS (Admin) =====
public record GetAllOrdersQuery(OrderStatus? Status, string? Search, int PageNumber = 1, int PageSize = 20) : IRequest<ApiResponse<PaginatedResult<OrderDto>>>;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, ApiResponse<PaginatedResult<OrderDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly AutoMapper.IMapper _mapper;

    public GetAllOrdersQueryHandler(IUnitOfWork uow, AutoMapper.IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<PaginatedResult<OrderDto>>> Handle(GetAllOrdersQuery request, CancellationToken ct)
    {
        var query = _uow.Orders.Query()
            .Include(o => o.Items).Include(o => o.Payment).Include(o => o.User).AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(o => o.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(o => o.OrderNumber.Contains(request.Search) ||
                o.User.Email.Contains(request.Search) ||
                o.User.FirstName.Contains(request.Search));

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

// ===== GET ALL USERS (Admin) =====
public record GetAllUsersQuery(int PageNumber = 1, int PageSize = 20) : IRequest<ApiResponse<PaginatedResult<UserDto>>>;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, ApiResponse<PaginatedResult<UserDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly AutoMapper.IMapper _mapper;

    public GetAllUsersQueryHandler(IUnitOfWork uow, AutoMapper.IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<PaginatedResult<UserDto>>> Handle(GetAllUsersQuery request, CancellationToken ct)
    {
        var query = _uow.Users.Query().OrderByDescending(u => u.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToListAsync(ct);

        var result = new PaginatedResult<UserDto>
        {
            Items = _mapper.Map<List<UserDto>>(items),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PaginatedResult<UserDto>>.SuccessResponse(result);
    }
}

