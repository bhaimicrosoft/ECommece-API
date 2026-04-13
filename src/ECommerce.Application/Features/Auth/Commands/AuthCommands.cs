using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;

namespace ECommerce.Application.Features.Auth.Commands;

// ===== REGISTER =====
public record RegisterCommand(string Email, string Password, string FirstName, string LastName, string? Phone) : IRequest<ApiResponse<AuthResponseDto>>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenService _jwt;

    public RegisterCommandHandler(IUnitOfWork uow, IJwtTokenService jwt)
    {
        _uow = uow;
        _jwt = jwt;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _uow.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
            return ApiResponse<AuthResponseDto>.FailResponse("Email already registered.");

        var user = new User
        {
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Role = UserRole.Customer
        };

        await _uow.Users.AddAsync(user, cancellationToken);

        // Create cart and wishlist for user
        await _uow.Carts.AddAsync(new Domain.Entities.Cart { UserId = user.Id }, cancellationToken);
        await _uow.Wishlists.AddAsync(new Domain.Entities.Wishlist { UserId = user.Id }, cancellationToken);

        var rawRefreshToken = _jwt.GenerateRefreshToken();
        await _uow.UserRefreshTokens.AddAsync(new UserRefreshToken
        {
            UserId = user.Id,
            TokenHash = TokenHasher.Hash(rawRefreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        }, cancellationToken);

        await _uow.SaveChangesAsync(cancellationToken);

        var accessToken = _jwt.GenerateAccessToken(user);
        var userDto = new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.AvatarUrl, user.Role.ToString(), user.IsActive, user.CreatedAt);

        return ApiResponse<AuthResponseDto>.SuccessResponse(
            new AuthResponseDto(accessToken, rawRefreshToken, userDto), "Registration successful.");
    }
}

// ===== LOGIN =====
public record LoginCommand(string Email, string Password) : IRequest<ApiResponse<AuthResponseDto>>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenService _jwt;

    public LoginCommandHandler(IUnitOfWork uow, IJwtTokenService jwt)
    {
        _uow = uow;
        _jwt = jwt;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var users = await _uow.Users.FindAsync(u => u.Email == request.Email.ToLower().Trim(), cancellationToken);
        var user = users.FirstOrDefault();

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return ApiResponse<AuthResponseDto>.FailResponse("Invalid email or password.");

        if (!user.IsActive)
            return ApiResponse<AuthResponseDto>.FailResponse("Account is deactivated. Contact support.");

        // Revoke all existing refresh tokens for this user
        var existingTokens = await _uow.UserRefreshTokens.FindAsync(t => t.UserId == user.Id && !t.IsRevoked, cancellationToken);
        foreach (var token in existingTokens)
        {
            token.IsRevoked = true;
            await _uow.UserRefreshTokens.UpdateAsync(token, cancellationToken);
        }

        var accessToken = _jwt.GenerateAccessToken(user);
        var rawRefreshToken = _jwt.GenerateRefreshToken();

        await _uow.UserRefreshTokens.AddAsync(new UserRefreshToken
        {
            UserId = user.Id,
            TokenHash = TokenHasher.Hash(rawRefreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        }, cancellationToken);

        await _uow.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.AvatarUrl, user.Role.ToString(), user.IsActive, user.CreatedAt);

        return ApiResponse<AuthResponseDto>.SuccessResponse(
            new AuthResponseDto(accessToken, rawRefreshToken, userDto), "Login successful.");
    }
}

// ===== REFRESH TOKEN =====
public record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<ApiResponse<AuthResponseDto>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenService _jwt;

    public RefreshTokenCommandHandler(IUnitOfWork uow, IJwtTokenService jwt)
    {
        _uow = uow;
        _jwt = jwt;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var userId = _jwt.ValidateAccessToken(request.AccessToken);
        if (userId == null)
            return ApiResponse<AuthResponseDto>.FailResponse("Invalid access token.");

        var incomingHash = TokenHasher.Hash(request.RefreshToken);
        var storedTokens = await _uow.UserRefreshTokens.FindAsync(
            t => t.UserId == userId.Value && t.TokenHash == incomingHash && !t.IsRevoked, cancellationToken);
        var storedToken = storedTokens.FirstOrDefault();

        if (storedToken == null || storedToken.ExpiresAt <= DateTime.UtcNow)
            return ApiResponse<AuthResponseDto>.FailResponse("Invalid or expired refresh token.");

        var user = await _uow.Users.GetByIdAsync(userId.Value, cancellationToken);
        if (user == null || !user.IsActive)
            return ApiResponse<AuthResponseDto>.FailResponse("User not found or deactivated.");

        // Revoke the used token (rotation — prevents reuse)
        storedToken.IsRevoked = true;
        await _uow.UserRefreshTokens.UpdateAsync(storedToken, cancellationToken);

        var newAccessToken = _jwt.GenerateAccessToken(user);
        var newRawRefreshToken = _jwt.GenerateRefreshToken();

        await _uow.UserRefreshTokens.AddAsync(new UserRefreshToken
        {
            UserId = user.Id,
            TokenHash = TokenHasher.Hash(newRawRefreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        }, cancellationToken);

        await _uow.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.AvatarUrl, user.Role.ToString(), user.IsActive, user.CreatedAt);

        return ApiResponse<AuthResponseDto>.SuccessResponse(
            new AuthResponseDto(newAccessToken, newRawRefreshToken, userDto), "Token refreshed.");
    }
}

internal static class TokenHasher
{
    internal static string Hash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}

