using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence.Context;
using Persistence.Identity;

namespace Persistence.Seed
{
    public static class DataSeed
    {
        public static async Task SeedAsync(
            ApplicationDbContext context,
            RoleManager<ApplicationRole> roleManager,
            UserManager<ApplicationUser> userManager)
        {
            await context.Database.MigrateAsync();

            await CategorySeed.SeedAsync(context);

            await DefaultUserSeed.SeedAsync(userManager, roleManager);
        }
    }
}