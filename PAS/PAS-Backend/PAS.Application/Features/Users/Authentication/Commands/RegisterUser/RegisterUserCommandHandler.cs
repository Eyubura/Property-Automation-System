using Persistence.Identity;

namespace Application.Features.Users.Authentication.Commands;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public RegisterUserCommandHandler(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _context     = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // Check username
        var existingUsername = await _userManager.FindByNameAsync(request.Username);
        if (existingUsername != null)
            return Result<Guid>.Failure($"Username '{request.Username}' is already taken.");

        // Check email
        var existingEmail = await _userManager.FindByEmailAsync(request.Email);
        if (existingEmail != null)
            return Result<Guid>.Failure($"Email '{request.Email}' is already registered.");

        // Generate or use provided employee code
        var employeeCode = await GetOrGenerateEmployeeCodeAsync(
            request.EmployeeCode, cancellationToken);

        var existingEmployeeCode = await _context.Employees
            .AnyAsync(e => e.EmployeeCode == employeeCode && !e.IsDeleted, cancellationToken);

        if (existingEmployeeCode)
            return Result<Guid>.Failure($"Employee with code '{employeeCode}' already exists.");

        // Ensure role exists
        var roleName = string.IsNullOrWhiteSpace(request.RoleName)
            ? "Employee"
            : request.RoleName.Trim();

        var identityRole = await _roleManager.FindByNameAsync(roleName);
        if (identityRole == null)
        {
            var createRoleResult = await _roleManager.CreateAsync(new ApplicationRole
            {
                Name        = roleName,
                Description = $"Auto-created role: {roleName}"
            });

            if (!createRoleResult.Succeeded)
            {
                var errors = string.Join("; ", createRoleResult.Errors.Select(e => e.Description));
                return Result<Guid>.Failure($"Role creation failed: {errors}");
            }
        }

        // Create Employee domain object — no reflection
        var employee = new Domain.Users.Employee(
            employeeCode,
            request.FullName,
            request.Department);

        // ✅ Use proper method instead of reflection
        employee.UpdateContact(request.Email, request.PhoneNumber);

        _context.Employees.Add(employee);

        // Create Identity user
        var identityUser = new ApplicationUser
        {
            UserName       = request.Username,
            Email          = request.Email,
            FullName       = request.FullName,
            IsActive       = true,
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(identityUser, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return Result<Guid>.Failure($"User registration failed: {errors}");
        }

        var roleResult = await _userManager.AddToRoleAsync(identityUser, roleName);
        if (!roleResult.Succeeded)
        {
            var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
            return Result<Guid>.Failure($"Role assignment failed: {errors}");
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Guid.TryParse(identityUser.Id, out var userId)
            ? Result<Guid>.Success(userId)
            : Result<Guid>.Success(Guid.Empty);
    }

    private async Task<string> GetOrGenerateEmployeeCodeAsync(
        string? requestedCode, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(requestedCode))
            return requestedCode.Trim();

        string code;
        do
        {
            code = $"EMP-{DateTime.UtcNow.Ticks.ToString()[^10..]}";
        }
        while (await _context.Employees
            .AnyAsync(e => e.EmployeeCode == code && !e.IsDeleted, cancellationToken));

        return code;
    }
}