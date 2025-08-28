using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using Microsoft.Extensions.Options;
using Xunit;

namespace CleanRestaurantApi.Tests.Services
{
    public class JwtServiceTests
    {
        private readonly IJwtService _jwtService;

        public JwtServiceTests()
        {
            var jwtSettings = new JwtSettings
            {
                Key = "super_secret_jwt_key_1234567890",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                AccessTokenExpirationMinutes = 60
            };

            // Owijamy w IOptions
            var options = Options.Create(jwtSettings);

            _jwtService = new JwtService(options);
        }

        [Fact]
        public void GenerateAccessToken_ShouldIncludeClaims()
        {
            var user = new User
            {
                Id = 1,
                Email = "test@test.com",
            };

            var token = _jwtService.GenerateAccessToken(user);

            Assert.False(string.IsNullOrWhiteSpace(token));
        }

        [Fact]
        public void GenerateRefreshToken_ShouldReturnUniqueTokens()
        {
            var token1 = _jwtService.GenerateRefreshToken();
            var token2 = _jwtService.GenerateRefreshToken();

            Assert.NotEqual(token1, token2);
        }
    }
}
