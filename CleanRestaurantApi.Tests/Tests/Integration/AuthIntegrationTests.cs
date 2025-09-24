using CleanRestaurantApi.Data;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using CleanRestaurantAPI.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Xunit;

namespace CleanRestaurantApi.Tests.Integration
{
    public class AuthIntegrationTests
    {
        private (AppDbContext, AuthService) CreateTestContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);

            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            var user = new User
            {
                Email = "existing@example.com",
                Role = "User"
            };
            user.PasswordHash = passwordHasher.HashPassword(user, "Password123!");
            context.User.Add(user);
            context.SaveChanges();

            var fakeJwtService = new FakeJwtService();
            var authService = new AuthService(context, fakeJwtService);

            return (context, authService);
        }


        [Fact]
        public async Task RegisterAsync_ShouldAddNewUser()
        {
            var (context, authService) = CreateTestContext();

            var dto = new CreateUserDto
            {
                Email = "newuser@example.com",
                Password = "Test123!"
            };

            await authService.RegisterAsync(dto);

            var user = await context.User.FirstOrDefaultAsync(u => u.Email == "newuser@example.com");
            Assert.NotNull(user);
            Assert.Equal("newuser@example.com", user.Email);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnTokens_WhenPasswordIsCorrect()
        {
            var (context, authService) = CreateTestContext();

            var user = await context.User.FirstAsync(u => u.Email == "existing@example.com");
            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, "Password123!");
            await context.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "existing@example.com",
                Password = "Password123!"
            };

            var result = await authService.LoginAsync(loginDto);

            Assert.NotNull(result);
            Assert.False(string.IsNullOrEmpty(result.AccessToken));
            Assert.False(string.IsNullOrEmpty(result.RefreshToken));
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnNull_WhenPasswordIsIncorrect()
        {
            var (_, authService) = CreateTestContext();

            var loginDto = new LoginDto
            {
                Email = "existing@example.com",
                Password = "WrongPassword"
            };

            var result = await authService.LoginAsync(loginDto);
            Assert.Null(result);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnNull_WhenEmailDoesNotExist()
        {
            var (_, authService) = CreateTestContext();

            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "Password123!"
            };

            var result = await authService.LoginAsync(loginDto);
            Assert.Null(result);
        }
    }

    public class FakeJwtService : IJwtService
    {
        public string GenerateAccessToken(User user) => "fake-access-token";
        public string GenerateRefreshToken() => "fake-refresh-token";
        public System.Security.Claims.ClaimsPrincipal? GetPrincipalFromExpiredToken(string token) => null;
    }
}
