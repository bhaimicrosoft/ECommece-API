using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Refunds;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RefundsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RefundsController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> RequestRefund([FromBody] RequestRefundDto dto)
    {
        var result = await _mediator.Send(new RequestRefundCommand(GetUserId(), dto.OrderId, dto.Reason));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetRefunds()
    {
        var result = await _mediator.Send(new GetUserRefundsQuery(GetUserId()));
        return Ok(result);
    }

    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllRefunds()
    {
        var result = await _mediator.Send(new GetAllRefundsQuery());
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ProcessRefund(Guid id, [FromBody] ProcessRefundDto dto)
    {
        var result = await _mediator.Send(new ProcessRefundCommand(id, dto.Status, dto.AdminNotes));
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

