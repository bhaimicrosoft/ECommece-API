using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Coupons;

// ===== GET COUPONS (Admin) =====
public record GetCouponsQuery() : IRequest<ApiResponse<List<CouponDto>>>;

public class GetCouponsQueryHandler : IRequestHandler<GetCouponsQuery, ApiResponse<List<CouponDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetCouponsQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<List<CouponDto>>> Handle(GetCouponsQuery request, CancellationToken ct)
    {
        var coupons = await _uow.Coupons.Query().OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
        return ApiResponse<List<CouponDto>>.SuccessResponse(_mapper.Map<List<CouponDto>>(coupons));
    }
}

// ===== CREATE COUPON =====
public record CreateCouponCommand(CreateCouponDto Dto) : IRequest<ApiResponse<CouponDto>>;

public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, ApiResponse<CouponDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateCouponCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<CouponDto>> Handle(CreateCouponCommand request, CancellationToken ct)
    {
        if (await _uow.Coupons.AnyAsync(c => c.Code == request.Dto.Code, ct))
            return ApiResponse<CouponDto>.FailResponse("Coupon code already exists.");

        var coupon = _mapper.Map<Coupon>(request.Dto);
        await _uow.Coupons.AddAsync(coupon, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<CouponDto>.SuccessResponse(_mapper.Map<CouponDto>(coupon), "Coupon created.");
    }
}

// ===== VALIDATE COUPON =====
public record ValidateCouponQuery(string Code, decimal OrderAmount) : IRequest<ApiResponse<CouponValidationResultDto>>;

public class ValidateCouponQueryHandler : IRequestHandler<ValidateCouponQuery, ApiResponse<CouponValidationResultDto>>
{
    private readonly IUnitOfWork _uow;

    public ValidateCouponQueryHandler(IUnitOfWork uow) { _uow = uow; }

    public async Task<ApiResponse<CouponValidationResultDto>> Handle(ValidateCouponQuery request, CancellationToken ct)
    {
        var coupons = await _uow.Coupons.FindAsync(c => c.Code == request.Code, ct);
        var coupon = coupons.FirstOrDefault();

        if (coupon == null)
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(
                new CouponValidationResultDto(false, "Invalid coupon code.", 0));

        if (!coupon.IsActive || coupon.ExpiryDate <= DateTime.UtcNow)
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(
                new CouponValidationResultDto(false, "Coupon is expired or inactive.", 0));

        if (coupon.CurrentUses >= coupon.MaxUses)
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(
                new CouponValidationResultDto(false, "Coupon usage limit reached.", 0));

        if (coupon.MinOrderAmount.HasValue && request.OrderAmount < coupon.MinOrderAmount.Value)
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(
                new CouponValidationResultDto(false, $"Minimum order amount is {coupon.MinOrderAmount}.", 0));

        var discount = coupon.DiscountType == DiscountType.Percentage
            ? request.OrderAmount * (coupon.DiscountValue / 100)
            : coupon.DiscountValue;

        if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
            discount = coupon.MaxDiscountAmount.Value;

        return ApiResponse<CouponValidationResultDto>.SuccessResponse(
            new CouponValidationResultDto(true, "Coupon is valid.", discount));
    }
}

