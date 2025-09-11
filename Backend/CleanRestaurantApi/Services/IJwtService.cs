using CleanRestaurantApi.Entities;
using System.Security.Claims;

namespace CleanRestaurantApi.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
