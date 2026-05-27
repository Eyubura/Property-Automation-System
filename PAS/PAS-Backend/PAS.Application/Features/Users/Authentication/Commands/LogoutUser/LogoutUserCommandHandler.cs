using Microsoft.Extensions.Logging;
using Persistence.Identity;

namespace Application.Features.Users.Authentication.Commands;

public class LogoutUserCommandHandler : IRequestHandler<LogoutUserCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<LogoutUserCommandHandler> _logger;

    public LogoutUserCommandHandler(
        ICurrentUserService currentUser,
        UserManager<ApplicationUser> userManager,
        ILogger<LogoutUserCommandHandler> logger)
    {
        _currentUser = currentUser;
        _userManager = userManager;
        _logger      = logger;
    }

    public async Task<Result> Handle(
        LogoutUserCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user != null)
            {
                // ✅ Clear refresh token so no new JWT can be issued after logout
                user.RefreshToken       = null;
                user.RefreshTokenExpiry = null;
                await _userManager.UpdateAsync(user);

                _logger.LogInformation(
                    "User logged out and refresh token cleared: {UserId} ({Username})",
                    userId, user.UserName);
            }
            else
            {
                _logger.LogWarning(
                    "Logout called for unknown user ID: {UserId}", userId);
            }
        }
        else
        {
            _logger.LogWarning("Logout called with no user ID in context.");
        }

        return Result.Success();
    }
}