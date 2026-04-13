using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Addresses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AddressesController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAddresses()
    {
        var result = await _mediator.Send(new GetAddressesQuery(GetUserId()));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
    {
        var result = await _mediator.Send(new CreateAddressCommand(GetUserId(), dto));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] UpdateAddressDto dto)
    {
        var result = await _mediator.Send(new UpdateAddressCommand(GetUserId(), id, dto));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid id)
    {
        var result = await _mediator.Send(new DeleteAddressCommand(GetUserId(), id));
        return result.Success ? Ok(result) : NotFound(result);
    }
}

