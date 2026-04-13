using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Cart;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly IMediator _mediator;

    public CartController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var result = await _mediator.Send(new GetCartQuery(GetUserId()));
        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var result = await _mediator.Send(new AddToCartCommand(GetUserId(), dto.ProductId, dto.Quantity));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("items/{cartItemId:guid}")]
    public async Task<IActionResult> UpdateCartItem(Guid cartItemId, [FromBody] UpdateCartItemDto dto)
    {
        var result = await _mediator.Send(new UpdateCartItemCommand(GetUserId(), cartItemId, dto.Quantity));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("items/{cartItemId:guid}")]
    public async Task<IActionResult> RemoveCartItem(Guid cartItemId)
    {
        var result = await _mediator.Send(new RemoveCartItemCommand(GetUserId(), cartItemId));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var result = await _mediator.Send(new ClearCartCommand(GetUserId()));
        return Ok(result);
    }
}

