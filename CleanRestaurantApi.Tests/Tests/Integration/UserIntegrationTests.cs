using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Mappings;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Services;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;

namespace CleanRestaurantApi.Tests.Integration
{
    public class UserIntegrationTests
    {
        private (AppDbContext, IUserService) CreateTestContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);

            context.User.Add(new User
            {
                Email = "existing@example.com",
                PasswordHash = "hashedpassword",
                Role = "User"
            });
            context.SaveChanges();

            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<CategoryMappingProfile>();
                cfg.AddProfile<DishMappingProfile>();
                cfg.AddProfile<RestaurantMappingProfile>();
                cfg.AddProfile<UserMappingProfile>();
            });
            var mapper = mapperConfig.CreateMapper();

            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            var userService = new UserService(context, mapper, passwordHasher);

            return (context, userService);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnUserDto_WhenUserExists()
        {
            var (_, userService) = CreateTestContext();

            var result = await userService.GetByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal("existing@example.com", result.Email);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllUsers()
        {
            var (_, userService) = CreateTestContext();

            var result = await userService.GetAllAsync();

            Assert.Single(result);
            Assert.Equal("existing@example.com", result[0].Email);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddUser()
        {
            var (_, userService) = CreateTestContext();

            var dto = new CreateUserDto
            {
                Email = "newuser@example.com",
                Password = "Test123!",
                ConfirmPassword = "Test123!"
            };

            await userService.CreateAsync(dto);

            var users = await userService.GetAllAsync();
            Assert.Equal(2, users.Count);
            Assert.Contains(users, u => u.Email == "newuser@example.com");
        }

        [Fact]
        public async Task UpdateAsync_ShouldModifyUser()
        {
            var (_, userService) = CreateTestContext();

            var patchDoc = new JsonPatchDocument<UpdateUserDto>();
            patchDoc.Replace(u => u.Email, "updated@example.com");

            await userService.UpdateAsync(1, patchDoc);

            var updatedUser = await userService.GetByIdAsync(1);
            Assert.Equal("updated@example.com", updatedUser.Email);
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveUser()
        {
            var (_, userService) = CreateTestContext();

            await userService.DeleteAsync(1);

            var users = await userService.GetAllAsync();
            Assert.Empty(users);
        }
    }
}
