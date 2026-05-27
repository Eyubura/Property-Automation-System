using Microsoft.AspNetCore.Identity;
using Persistence.Identity;

namespace Persistence.Seed
{
    public static class DefaultUserSeed
    {
        public static async Task SeedAsync(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager)
        {
            // Seed roles first
            string[] roles = ["Admin", "StoreOfficer", "Staff", "Inspector", "Approver", "Manager"];
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new ApplicationRole
                    {
                        Name        = role,
                        Description = $"System role: {role}"
                    });
                }
            }

            // Seed default admin user
            var adminEmail = "admin@pas.com";
            var existing   = await userManager.FindByEmailAsync(adminEmail);

            if (existing == null)
            {
                var admin = new ApplicationUser   // ← ApplicationUser not IdentityUser
                {
                    UserName       = "admin",
                    Email          = adminEmail,
                    FullName       = "System Administrator",
                    IsActive       = true,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, "Admin@123123!");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to seed admin user: {errors}");
                }
            }
        }
    }
}