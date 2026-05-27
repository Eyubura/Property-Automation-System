using Application.Features.Users.Authentication.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Persistence.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Users.Authentication.Commands;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResultDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RefreshTokenCommandHandler> _logger;

    public RefreshTokenCommandHandler(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogger<RefreshTokenCommandHandler> logger)
    {
        _userManager   = userManager;
        _configuration = configuration;
        _logger        = logger;
    }

    public async Task<Result<AuthResultDto>> Handle(
        RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return Result<AuthResultDto>.Failure("Refresh token is required.");

        var user = _userManager.Users
            .FirstOrDefault(u => u.RefreshToken == request.RefreshToken);

        if (user == null)
        {
            _logger.LogWarning("Refresh token not found or already used.");
            return Result<AuthResultDto>.Failure("Invalid refresh token.");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Refresh attempted for inactive user: {Username}", user.UserName);
            return Result<AuthResultDto>.Failure("User account is inactive.");
        }

        if (user.RefreshTokenExpiry == null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            _logger.LogWarning("Expired refresh token for user: {Username}", user.UserName);
            user.RefreshToken       = null;
            user.RefreshTokenExpiry = null;
            await _userManager.UpdateAsync(user);
            return Result<AuthResultDto>.Failure("Refresh token has expired. Please log in again.");
        }

        var newRefreshToken         = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        user.RefreshToken           = newRefreshToken;
        user.RefreshTokenExpiry     = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        var roles       = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "User";
        var jwtToken    = GenerateJwtToken(user, roles);
        var expiryHours = int.TryParse(_configuration["Jwt:ExpiryInHours"], out var h) ? h : 8;

        _logger.LogInformation("Token refreshed for user: {Username}", user.UserName);

        var dto = new AuthResultDto
        {
            Succeeded    = true,
            Token        = jwtToken,
            RefreshToken = newRefreshToken,
            ExpiresAt    = DateTime.UtcNow.AddHours(expiryHours),
            User = new UserInfoDto
            {
                Id           = Guid.TryParse(user.Id, out var parsedId) ? parsedId : Guid.Empty,
                Username     = user.UserName ?? string.Empty,
                FullName     = user.FullName,
                Email        = user.Email ?? string.Empty,
                EmployeeCode = string.Empty,
                Department   = string.Empty,
                Roles        = roles.ToArray(),
                Permissions  = GetPermissionsForRole(primaryRole)
            }
        };

        return Result<AuthResultDto>.Success(dto);
    }

    private string GenerateJwtToken(ApplicationUser user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,        user.Id),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new(JwtRegisteredClaimNames.Email,      user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti,        Guid.NewGuid().ToString()),
            new(ClaimTypes.Name,                    user.UserName ?? string.Empty),
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds       = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryHours = int.TryParse(_configuration["Jwt:ExpiryInHours"], out var h) ? h : 8;

        var token = new JwtSecurityToken(
            issuer:             _configuration["Jwt:Issuer"],
            audience:           _configuration["Jwt:Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string[] GetPermissionsForRole(string role)
    {
        return role switch
        {
            SystemRoles.Admin        => SystemRoles.RolePermissions.AdminPermissions,
            SystemRoles.StoreOfficer => SystemRoles.RolePermissions.StoreOfficerPermissions,
            SystemRoles.Staff        => SystemRoles.RolePermissions.StaffPermissions,
            SystemRoles.Inspector    => SystemRoles.RolePermissions.InspectorPermissions,
            SystemRoles.Approver     => SystemRoles.RolePermissions.ApproverPermissions,
            SystemRoles.Manager      => SystemRoles.RolePermissions.ManagerPermissions,
            _                        => Array.Empty<string>()
        };
    }
}