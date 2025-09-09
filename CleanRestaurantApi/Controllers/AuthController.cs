using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace CleanRestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] CreateUserDto dto)
        {
            await _authService.RegisterAsync(dto);
            return Ok(new MessageResponseDto { Message = "User created succesfully" });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var authResponse = await _authService.LoginAsync(dto);
            if (authResponse == null) return Unauthorized();
            return Ok(authResponse);
        }
    }
}
