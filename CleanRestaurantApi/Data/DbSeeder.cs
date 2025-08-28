using CleanRestaurantApi.Entities;
using CleanRestaurantAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace CleanRestaurantApi.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (context.Database.CanConnect())
            {
                if (!await context.Category.AnyAsync())
                {
                    var Category = new List<Category>
                {
                    new Category { Name = "Pizza" },
                    new Category { Name = "Pasta" },
                    new Category { Name = "Drinks" }
                };
                    context.Category.AddRange(Category);
                    context.SaveChanges();
                }
                if (!await context.Restaurant.AnyAsync())
                {
                    var pizzaCategory = await context.Category.FirstAsync(c => c.Name == "Pizza");
                    var pastaCategory = await context.Category.FirstAsync(c => c.Name == "Pasta");
                    var drinksCategory = await context.Category.FirstAsync(c => c.Name == "Drinks");

                    var restaurants = new List<Restaurant>
                {
                    new Restaurant
                    {
                        Name = "Roma",
                        City = "Milano",
                        Street = "Via Ancona",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Margherita", Price = 20m, CategoryId = pizzaCategory.Id },
                            new Dish { Name = "Pepperoni", Price = 25m, CategoryId = pizzaCategory.Id }
                        }
                    },
                    new Restaurant
                    {
                        Name = "Bella Italia",
                        City = "Firenze",
                        Street = "Correduria",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Carbonara", Price = 22m, CategoryId = pastaCategory.Id },
                            new Dish { Name = "Bolognese", Price = 23m, CategoryId = pastaCategory.Id },
                        }
                    },
                    new Restaurant
                    {
                        Name = "Lakeside Lounge",
                        City = "Nashville",
                        Street = "Woodland St",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Coca Cola", Price = 8m, CategoryId = drinksCategory.Id },
                            new Dish { Name = "Orange Juice", Price = 10m, CategoryId = drinksCategory.Id }
                        }
                    }
                };

                    context.AddRange(restaurants);
                }

                if (!await context.Role.AnyAsync())
                {
                    var roles = new List<Role>
                    {
                        new Role { Name = "Admin"},
                        new Role { Name = "Manager"},
                        new Role { Name = "Chef"},
                        new Role { Name = "User"},
                        new Role { Name = "Guest"},
                    };
                    context.AddRange(roles);
                    context.SaveChanges();
                }

                if (!await context.User.AnyAsync())
                {
                    var adminRole = await context.Role.FirstAsync(r => r.Name == "Admin");
                    var managerRole = await context.Role.FirstAsync(r => r.Name == "Manager");
                    var chefRole = await context.Role.FirstAsync(r => r.Name == "Chef");
                    var userRole = await context.Role.FirstAsync(r => r.Name == "User");
                    var guestRole = await context.Role.FirstAsync(r => r.Name == "Guest");
                    var users = new List<User>
                {
                    new User { Email = "admin@restaurant.com",   PasswordHash = HashPassword("Admin123!"),   RoleId = adminRole.Id},
                    new User { Email = "manager@restaurant.com", PasswordHash = HashPassword("Manager123!"), RoleId = managerRole.Id},
                    new User { Email = "chef@restaurant.com",    PasswordHash = HashPassword("Chef123!"),    RoleId = chefRole.Id},
                    new User { Email = "user@restaurant.com",    PasswordHash = HashPassword("User123!"),    RoleId = userRole.Id},
                    new User { Email = "guest@restaurant.com",   PasswordHash = HashPassword("Guest123!"),   RoleId = guestRole.Id}
                };

                    context.User.AddRange(users);
                    await context.SaveChangesAsync();
                }
            }
        }
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
