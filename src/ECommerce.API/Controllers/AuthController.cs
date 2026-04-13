using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _mediator.Send(new RegisterCommand(dto.Email, dto.Password, dto.FirstName, dto.LastName, dto.Phone));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _mediator.Send(new LoginCommand(dto.Email, dto.Password));
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
    {
        var result = await _mediator.Send(new RefreshTokenCommand(dto.AccessToken, dto.RefreshToken));
        return result.Success ? Ok(result) : Unauthorized(result);
    }
}

