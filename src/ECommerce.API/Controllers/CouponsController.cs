using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Coupons;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CouponsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
    {
        var result = await _mediator.Send(new ValidateCouponQuery(dto.Code, dto.OrderAmount));
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetCoupons()
    {
        var result = await _mediator.Send(new GetCouponsQuery());
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
    {
        var result = await _mediator.Send(new CreateCouponCommand(dto));
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

