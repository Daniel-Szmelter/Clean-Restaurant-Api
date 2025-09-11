using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CleanRestaurantApi.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly DbContextOptions<AppDbContext> _dbOptions;

        public AuthServiceTests()
        {
            _mockJwtService = new Mock<IJwtService>();

            _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task RegisterAsync_ShouldAddUserToDb()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);
            var service = new AuthService(context, _mockJwtService.Object);

            var dto = new CreateUserDto
            {
                Email = "test@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

            await service.RegisterAsync(dto);

            var userInDb = context.User.FirstOrDefault(u => u.Email == dto.Email);
            Assert.NotNull(userInDb);
            Assert.NotNull(userInDb.PasswordHash);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnAuthResponse_WhenCredentialsAreValid()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);
            var service = new AuthService(context, _mockJwtService.Object);

            var user = new User { Email = "user@example.com" };
            var passwordHasher = new PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, "Password123!");
            context.User.Add(user);
            context.SaveChanges();

            _mockJwtService.Setup(j => j.GenerateAccessToken(user)).Returns("access-token");
            _mockJwtService.Setup(j => j.GenerateRefreshToken()).Returns("refresh-token");

            var dto = new LoginDto { Email = "user@example.com", Password = "Password123!" };
            var result = await service.LoginAsync(dto);

            Assert.NotNull(result);
            Assert.Equal("access-token", result!.AccessToken);
            Assert.Equal("refresh-token", result.RefreshToken);

            var userInDb = context.User.First(u => u.Email == dto.Email);
            Assert.Equal("refresh-token", userInDb.RefreshToken);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);
            var service = new AuthService(context, _mockJwtService.Object);

            var dto = new LoginDto { Email = "missing@example.com", Password = "Password123!" };
            var result = await service.LoginAsync(dto);

            Assert.Null(result);
        }

        [Fact]
        public async Task RefreshTokenAsync_ShouldReturnNewTokens_WhenRefreshTokenValid()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);
            var service = new AuthService(context, _mockJwtService.Object);

            var user = new User
            {
                Email = "user@example.com",
                RefreshToken = "old-refresh",
                RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1)
            };

            var passwordHasher = new PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, "Password123!");

            context.User.Add(user);
            context.SaveChanges();

            var claimsPrincipal = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity(new[]
                {
                    new System.Security.Claims.Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub, user.Id.ToString())
                })
            );
            _mockJwtService.Setup(j => j.GetPrincipalFromExpiredToken("expired-token")).Returns(claimsPrincipal);
            _mockJwtService.Setup(j => j.GenerateAccessToken(user)).Returns("new-access");
            _mockJwtService.Setup(j => j.GenerateRefreshToken()).Returns("new-refresh");

            var result = await service.RefreshTokenAsync("expired-token", "old-refresh");

            Assert.NotNull(result);
            Assert.Equal("new-access", result!.AccessToken);
            Assert.Equal("new-refresh", result.RefreshToken);

            var userInDb = context.User.First(u => u.Id == user.Id);
            Assert.Equal("new-refresh", userInDb.RefreshToken);
        }

        [Fact]
        public async Task RefreshTokenAsync_ShouldReturnNull_WhenTokenInvalid()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new AppDbContext(options);
            var service = new AuthService(context, _mockJwtService.Object);

            _mockJwtService.Setup(j => j.GetPrincipalFromExpiredToken("bad-token")).Returns((System.Security.Claims.ClaimsPrincipal?)null);

            var result = await service.RefreshTokenAsync("bad-token", "refresh");
            Assert.Null(result);
        }
    }
}
