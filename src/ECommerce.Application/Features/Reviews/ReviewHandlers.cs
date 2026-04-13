using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Reviews;

// ===== GET PRODUCT REVIEWS =====
public record GetProductReviewsQuery(Guid ProductId, int PageNumber = 1, int PageSize = 10) : IRequest<ApiResponse<PaginatedResult<ReviewDto>>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, ApiResponse<PaginatedResult<ReviewDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductReviewsQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<PaginatedResult<ReviewDto>>> Handle(GetProductReviewsQuery request, CancellationToken ct)
    {
        var query = _uow.Reviews.Query()
            .Include(r => r.User)
            .Where(r => r.ProductId == request.ProductId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToListAsync(ct);

        var result = new PaginatedResult<ReviewDto>
        {
            Items = _mapper.Map<List<ReviewDto>>(items),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PaginatedResult<ReviewDto>>.SuccessResponse(result);
    }
}

// ===== CREATE REVIEW =====
public record CreateReviewCommand(Guid UserId, Guid ProductId, int Rating, string? Title, string? Comment) : IRequest<ApiResponse<ReviewDto>>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ApiResponse<ReviewDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateReviewCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<ReviewDto>> Handle(CreateReviewCommand request, CancellationToken ct)
    {
        if (await _uow.Reviews.AnyAsync(r => r.UserId == request.UserId && r.ProductId == request.ProductId, ct))
            return ApiResponse<ReviewDto>.FailResponse("You have already reviewed this product.");

        var product = await _uow.Products.GetByIdAsync(request.ProductId, ct);
        if (product == null) return ApiResponse<ReviewDto>.FailResponse("Product not found.");

        // Check if user purchased the product
        var isVerifiedPurchase = await _uow.OrderItems.Query()
            .AnyAsync(oi => oi.ProductId == request.ProductId && oi.Order.UserId == request.UserId
                && oi.Order.Status == Domain.Enums.OrderStatus.Delivered, ct);

        var review = new Review
        {
            UserId = request.UserId,
            ProductId = request.ProductId,
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment,
            IsVerifiedPurchase = isVerifiedPurchase
        };

        await _uow.Reviews.AddAsync(review, ct);

        // Update product rating
        var allReviews = await _uow.Reviews.FindAsync(r => r.ProductId == request.ProductId, ct);
        product.ReviewCount = allReviews.Count + 1;
        product.AverageRating = (allReviews.Sum(r => r.Rating) + request.Rating) / (double)product.ReviewCount;
        await _uow.Products.UpdateAsync(product, ct);

        await _uow.SaveChangesAsync(ct);

        var result = await _uow.Reviews.Query()
            .Include(r => r.User)
            .FirstAsync(r => r.Id == review.Id, ct);

        return ApiResponse<ReviewDto>.SuccessResponse(_mapper.Map<ReviewDto>(result), "Review submitted.");
    }
}

// ===== DELETE REVIEW =====
public record DeleteReviewCommand(Guid ReviewId, Guid UserId) : IRequest<ApiResponse<bool>>;

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteReviewCommandHandler(IUnitOfWork uow) { _uow = uow; }

    public async Task<ApiResponse<bool>> Handle(DeleteReviewCommand request, CancellationToken ct)
    {
        var review = await _uow.Reviews.Query()
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId && r.UserId == request.UserId, ct);

        if (review == null) return ApiResponse<bool>.FailResponse("Review not found.");

        await _uow.Reviews.DeleteAsync(review, ct);

        // Update product rating
        var product = await _uow.Products.GetByIdAsync(review.ProductId, ct);
        if (product != null)
        {
            var remainingReviews = await _uow.Reviews.FindAsync(r => r.ProductId == review.ProductId && r.Id != review.Id, ct);
            product.ReviewCount = remainingReviews.Count;
            product.AverageRating = remainingReviews.Any() ? remainingReviews.Average(r => r.Rating) : 0;
            await _uow.Products.UpdateAsync(product, ct);
        }

        await _uow.SaveChangesAsync(ct);
        return ApiResponse<bool>.SuccessResponse(true, "Review deleted.");
    }
}

