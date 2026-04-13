using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Refunds;

// ===== REQUEST REFUND =====
public record RequestRefundCommand(Guid UserId, Guid OrderId, string Reason) : IRequest<ApiResponse<RefundDto>>;

public class RequestRefundCommandHandler : IRequestHandler<RequestRefundCommand, ApiResponse<RefundDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public RequestRefundCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<RefundDto>> Handle(RequestRefundCommand request, CancellationToken ct)
    {
        var order = await _uow.Orders.Query()
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == request.UserId, ct);

        if (order == null) return ApiResponse<RefundDto>.FailResponse("Order not found.");
        if (order.Payment == null || order.Payment.Status != PaymentStatus.Completed)
            return ApiResponse<RefundDto>.FailResponse("No completed payment found for this order.");

        if (await _uow.Refunds.AnyAsync(r => r.OrderId == request.OrderId && r.Status != RefundStatus.Rejected, ct))
            return ApiResponse<RefundDto>.FailResponse("A refund request already exists for this order.");

        var refund = new Refund
        {
            OrderId = order.Id,
            PaymentId = order.Payment.Id,
            Reason = request.Reason,
            Amount = order.TotalAmount,
            Status = RefundStatus.Requested
        };

        order.Status = OrderStatus.ReturnRequested;
        await _uow.Orders.UpdateAsync(order, ct);
        await _uow.Refunds.AddAsync(refund, ct);
        await _uow.SaveChangesAsync(ct);

        var result = await _uow.Refunds.Query()
            .Include(r => r.Order)
            .FirstAsync(r => r.Id == refund.Id, ct);

        return ApiResponse<RefundDto>.SuccessResponse(_mapper.Map<RefundDto>(result), "Refund requested.");
    }
}

// ===== GET REFUNDS (User) =====
public record GetUserRefundsQuery(Guid UserId) : IRequest<ApiResponse<List<RefundDto>>>;

public class GetUserRefundsQueryHandler : IRequestHandler<GetUserRefundsQuery, ApiResponse<List<RefundDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetUserRefundsQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<List<RefundDto>>> Handle(GetUserRefundsQuery request, CancellationToken ct)
    {
        var refunds = await _uow.Refunds.Query()
            .Include(r => r.Order)
            .Where(r => r.Order.UserId == request.UserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return ApiResponse<List<RefundDto>>.SuccessResponse(_mapper.Map<List<RefundDto>>(refunds));
    }
}

// ===== GET ALL REFUNDS (Admin) =====
public record GetAllRefundsQuery() : IRequest<ApiResponse<List<RefundDto>>>;

public class GetAllRefundsQueryHandler : IRequestHandler<GetAllRefundsQuery, ApiResponse<List<RefundDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetAllRefundsQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<List<RefundDto>>> Handle(GetAllRefundsQuery request, CancellationToken ct)
    {
        var refunds = await _uow.Refunds.Query()
            .Include(r => r.Order)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return ApiResponse<List<RefundDto>>.SuccessResponse(_mapper.Map<List<RefundDto>>(refunds));
    }
}

// ===== PROCESS REFUND (Admin) =====
public record ProcessRefundCommand(Guid RefundId, RefundStatus Status, string? AdminNotes) : IRequest<ApiResponse<RefundDto>>;

public class ProcessRefundCommandHandler : IRequestHandler<ProcessRefundCommand, ApiResponse<RefundDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public ProcessRefundCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<RefundDto>> Handle(ProcessRefundCommand request, CancellationToken ct)
    {
        var refund = await _uow.Refunds.Query()
            .Include(r => r.Order).Include(r => r.Payment)
            .FirstOrDefaultAsync(r => r.Id == request.RefundId, ct);

        if (refund == null) return ApiResponse<RefundDto>.FailResponse("Refund not found.");

        refund.Status = request.Status;
        refund.AdminNotes = request.AdminNotes;
        refund.ProcessedAt = DateTime.UtcNow;
        refund.UpdatedAt = DateTime.UtcNow;

        if (request.Status == RefundStatus.Processed)
        {
            refund.Order.Status = OrderStatus.Returned;
            refund.Payment.Status = PaymentStatus.Refunded;
            await _uow.Orders.UpdateAsync(refund.Order, ct);
            await _uow.Payments.UpdateAsync(refund.Payment, ct);
        }

        await _uow.Refunds.UpdateAsync(refund, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<RefundDto>.SuccessResponse(_mapper.Map<RefundDto>(refund), "Refund processed.");
    }
}

