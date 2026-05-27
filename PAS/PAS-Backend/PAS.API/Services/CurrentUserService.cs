using Application.Common.Interfaces;
using System.Security.Claims;

namespace PAS.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User
        .FindFirstValue(ClaimTypes.NameIdentifier);

    public string? UserName => _httpContextAccessor.HttpContext?.User
        .FindFirstValue(ClaimTypes.Name);

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?
        .User.Identity?.IsAuthenticated ?? false;

    public bool IsInRole(string role) =>
        _httpContextAccessor.HttpContext?.User.IsInRole(role) ?? false;

    public bool HasPermission(string permission) =>
        _httpContextAccessor.HttpContext?.User
            .Claims
            .Any(c => c.Type == "permission" && c.Value == permission)
        ?? false;

    public Guid? UserGuid =>
        Guid.TryParse(UserId, out var g) ? g : null;
}