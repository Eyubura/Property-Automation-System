using Application.Features.Users.Authentication.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Data.SqlClient;
using Persistence.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Users.Authentication.Commands;

public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, Result<AuthResultDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<LoginUserCommandHandler> _logger;

    public LoginUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogger<LoginUserCommandHandler> logger)
    {
        _userManager   = userManager;
        _configuration = configuration;
        _logger        = logger;
    }

    public async Task<Result<AuthResultDto>> Handle(
        LoginUserCommand request, CancellationToken cancellationToken)
    {
        var loginInput = request.Username?.Trim();
        if (string.IsNullOrWhiteSpace(loginInput) ||
            string.IsNullOrWhiteSpace(request.Password))
            return Result<AuthResultDto>.Failure(
                "Username and password are required.");

        // Find user by username or email
        var user = await _userManager.FindByNameAsync(loginInput)
                   ?? await _userManager.FindByEmailAsync(loginInput);

        if (user == null)
        {
            _logger.LogWarning(
                "Login attempt with non-existent username/email: {Username}",
                loginInput);
            return Result<AuthResultDto>.Failure("Invalid username or password.");
        }

        // Check if active
        if (!user.IsActive)
        {
            _logger.LogWarning(
                "Login blocked for inactive user: {Username}", user.UserName);
            return Result<AuthResultDto>.Failure(
                "User account is not allowed to sign in.");
        }

        // Check lockout
        if (await _userManager.IsLockedOutAsync(user))
        {
            _logger.LogWarning(
                "Locked out login attempt for user: {Username}", user.UserName);
            return Result<AuthResultDto>.Failure(
                "User account is locked. Try again later.");
        }

        // Check password directly — no SignInManager needed
        var passwordValid = await _userManager.CheckPasswordAsync(
            user, request.Password);

        if (!passwordValid)
        {
            // Increment failed access count
            await _userManager.AccessFailedAsync(user);
            _logger.LogWarning(
                "Invalid password attempt for user: {Username}", user.UserName);
            return Result<AuthResultDto>.Failure("Invalid username or password.");
        }

        // Reset failed count on success
        await _userManager.ResetAccessFailedCountAsync(user);

        var authPayload = await ExecuteWithRetryAsync(async () =>
        {
            var roles = await _userManager.GetRolesAsync(user);
            var primaryRole = roles.FirstOrDefault() ?? "User";
            var token = GenerateJwtToken(user, roles);
            var refreshToken = await GenerateRefreshToken(user);
            var expiryHours = int.TryParse(
                _configuration["Jwt:ExpiryInHours"], out var h) ? h : 8;
            var expiresAt = DateTime.UtcNow.AddHours(
                request.RememberMe ? 168 : expiryHours);

            return new
            {
                Roles = roles,
                PrimaryRole = primaryRole,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt
            };
        });

        _logger.LogInformation(
            "User logged in successfully: {Username}", user.UserName);

        var result = new AuthResultDto
        {
            Succeeded    = true,
            Token        = authPayload.Token,
            RefreshToken = authPayload.RefreshToken,
            ExpiresAt    = authPayload.ExpiresAt,
            User = new UserInfoDto
            {
                Id           = Guid.TryParse(user.Id, out var parsedId)
                               ? parsedId : Guid.Empty,
                Username     = user.UserName     ?? string.Empty,
                FullName     = user.FullName,
                Email        = user.Email        ?? string.Empty,
                EmployeeCode = string.Empty,
                Department   = string.Empty,
                Roles        = authPayload.Roles.ToArray(),
                Permissions  = GetPermissionsForRole(authPayload.PrimaryRole)
            }
        };

        return Result<AuthResultDto>.Success(result);
    }

    private async Task<T> ExecuteWithRetryAsync<T>(Func<Task<T>> action)
    {
        const int maxAttempts = 2;
        var attempt = 0;

        while (true)
        {
            try
            {
                return await action();
            }
            catch (Exception ex) when (IsTransientSqlTimeout(ex) && attempt < maxAttempts)
            {
                attempt++;
                _logger.LogWarning(ex, "Transient SQL timeout during login. Retrying attempt {Attempt}.", attempt + 1);
                await Task.Delay(TimeSpan.FromSeconds(attempt));
            }
        }
    }

    private static bool IsTransientSqlTimeout(Exception exception)
    {
        for (var current = exception; current != null; current = current.InnerException)
        {
            if (current is SqlException sqlException && sqlException.Number == -2)
            {
                return true;
            }
        }

        return exception.Message.Contains("Connection Timeout Expired", StringComparison.OrdinalIgnoreCase);
    }

    private string GenerateJwtToken(
        ApplicationUser user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,        user.Id),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new(JwtRegisteredClaimNames.Email,      user.Email    ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti,        Guid.NewGuid().ToString()),
            new(ClaimTypes.Name,                    user.UserName ?? string.Empty),
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT key is not configured.");

        var key         = new SymmetricSecurityKey(
                              Encoding.UTF8.GetBytes(jwtKey));
        var creds       = new SigningCredentials(
                              key, SecurityAlgorithms.HmacSha256);
        var expiryHours = int.TryParse(
            _configuration["Jwt:ExpiryInHours"], out var h) ? h : 8;

        var token = new JwtSecurityToken(
            issuer:             _configuration["Jwt:Issuer"],
            audience:           _configuration["Jwt:Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> GenerateRefreshToken(ApplicationUser user)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        try
        {
            user.RefreshToken       = token;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                _logger.LogWarning(
                    "Refresh token persistence failed for user {Username}: {Errors}",
                    user.UserName,
                    string.Join(", ", updateResult.Errors.Select(e => e.Description)));
                return string.Empty;
            }

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Refresh token persistence threw an exception for user {Username}",
                user.UserName);
            return string.Empty;
        }
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