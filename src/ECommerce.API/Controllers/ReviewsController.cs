using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Reviews;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/products/{productId:guid}/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetReviews(Guid productId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetProductReviewsQuery(productId, pageNumber, pageSize));
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview(Guid productId, [FromBody] CreateReviewDto dto)
    {
        var result = await _mediator.Send(new CreateReviewCommand(GetUserId(), productId, dto.Rating, dto.Title, dto.Comment));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{reviewId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(Guid productId, Guid reviewId)
    {
        var result = await _mediator.Send(new DeleteReviewCommand(reviewId, GetUserId()));
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

