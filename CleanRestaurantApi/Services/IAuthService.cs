using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;

namespace CleanRestaurantApi.Services
{
    public interface IAuthService
    {
        Task RegisterAsync(CreateUserDto dto);
        Task<AuthResponseDto?> LoginAsync(LoginDto dto);

        Task<AuthResponseDto?> RefreshTokenAsync(string token, string refreshToken);
    }
}
