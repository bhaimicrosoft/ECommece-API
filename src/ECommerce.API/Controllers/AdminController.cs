using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Admin;
using ECommerce.Application.Features.Orders;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator) => _mediator = mediator;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var result = await _mediator.Send(new GetDashboardStatsQuery());
        return Ok(result);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders([FromQuery] OrderStatus? status, [FromQuery] string? search,
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAllOrdersQuery(status, search, pageNumber, pageSize));
        return Ok(result);
    }

    [HttpPut("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        var result = await _mediator.Send(new UpdateOrderStatusCommand(id, dto.Status, dto.TrackingNumber));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAllUsersQuery(pageNumber, pageSize));
        return Ok(result);
    }
}

