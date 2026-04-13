using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Wishlists;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IMediator _mediator;

    public WishlistController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var result = await _mediator.Send(new GetWishlistQuery(GetUserId()));
        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToWishlist([FromBody] AddToWishlistDto dto)
    {
        var result = await _mediator.Send(new AddToWishlistCommand(GetUserId(), dto.ProductId));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("items/{productId:guid}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId)
    {
        var result = await _mediator.Send(new RemoveFromWishlistCommand(GetUserId(), productId));
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

