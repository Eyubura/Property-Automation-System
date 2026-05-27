namespace Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        string? UserName { get; }
        bool IsAuthenticated { get; }
        bool IsInRole(string role);
        bool HasPermission(string permission);

        // Add UserGuid — parsed from UserId
        Guid? UserGuid => Guid.TryParse(UserId, out var g) ? g : null;
    }
}