using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Xunit;

namespace CleanRestaurantApi.Tests.Services
{
    public class JwtServiceTests
    {
        private readonly JwtService _jwtService;

        public JwtServiceTests()
        {
            var jwtSettings = new JwtSettings
            {
                Key = "f4f4e03f6c118389c41e9465452f199fa1c00cf6077f1b8ef73ff4d0660e2913",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                AccessTokenExpirationMinutes = 60
            };

            // <-- tutaj opakowujemy w IOptions
            var options = Options.Create(jwtSettings);

            _jwtService = new JwtService(options);
        }

        [Fact]
        public void GenerateAccessToken_ShouldReturnValidToken()
        {
            var user = new User { Email = "test@example.com", Role = "Admin" };
            var token = _jwtService.GenerateAccessToken(user);

            Assert.False(string.IsNullOrEmpty(token));
        }

        [Fact]
        public void GenerateRefreshToken_ShouldReturnBase64String()
        {
            var refreshToken = _jwtService.GenerateRefreshToken();
            Assert.False(string.IsNullOrEmpty(refreshToken));
        }
    }
}
