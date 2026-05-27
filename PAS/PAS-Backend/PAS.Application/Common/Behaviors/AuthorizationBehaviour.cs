using Application.Common.Security;
using Application.Common.Exceptions;
using System.Reflection;

namespace Application.Common.Behaviours
{
    public class AuthorizationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly ICurrentUserService _currentUserService;

        public AuthorizationBehaviour(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var authorizeAttributes = request.GetType()
                .GetCustomAttributes<AuthorizeAttribute>();

            if (!authorizeAttributes.Any())
                return await next();

            // 1 — Must be authenticated
            if (!_currentUserService.IsAuthenticated)
                throw new UnauthorizedAccessException("User is not authenticated.");

            // 2 — Role-based authorization
            var withRoles = authorizeAttributes
                .Where(a => !string.IsNullOrWhiteSpace(a.Roles));

            if (withRoles.Any())
            {
                var authorized = false;

                foreach (var roles in withRoles.Select(a => a.Roles.Split(',')))
                {
                    foreach (var role in roles)
                    {
                        if (_currentUserService.IsInRole(role.Trim()))
                        {
                            authorized = true;
                            break;
                        }
                    }
                    if (authorized) break;
                }

                if (!authorized)
                    throw new ForbiddenAccessException("User does not have the required role.");
            }

            // 3 — Permission-based authorization
            var withPolicies = authorizeAttributes
                .Where(a => !string.IsNullOrWhiteSpace(a.Policy));

            if (withPolicies.Any())
            {
                foreach (var policy in withPolicies.Select(a => a.Policy))
                {
                    var authorized = CheckPermission(policy);
                    if (!authorized)
                        throw new ForbiddenAccessException(
                            $"User does not have the required permission: {policy}");
                }
            }

            return await next();
        }

        private bool CheckPermission(string policy)
        {
            // Check if the current user has the specific permission claim
            // Permissions are stored as claims in the JWT token
            return _currentUserService.HasPermission(policy);
        }
    }
}