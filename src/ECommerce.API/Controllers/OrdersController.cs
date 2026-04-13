using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Orders;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
    {
        var result = await _mediator.Send(new PlaceOrderCommand(GetUserId(), dto.ShippingAddressId, dto.PaymentMethod, dto.CouponCode, dto.Notes));
        return result.Success ? CreatedAtAction(nameof(GetOrder), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetOrdersQuery(GetUserId(), status, pageNumber, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id, GetUserId()));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderRequest request)
    {
        var result = await _mediator.Send(new CancelOrderCommand(id, GetUserId(), request.Reason));
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

public record CancelOrderRequest(string? Reason);

