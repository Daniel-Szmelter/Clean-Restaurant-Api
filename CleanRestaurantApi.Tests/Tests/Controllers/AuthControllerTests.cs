using System.Threading.Tasks;
using CleanRestaurantApi.Controllers;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CleanRestaurantApi.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _authServiceMock = new Mock<IAuthService>();
            _controller = new AuthController(_authServiceMock.Object);
        }

        [Fact]
        public async Task Register_ShouldReturnOk_WhenUserIsCreated()
        {
            // Arrange
            var dto = new CreateUserDto
            {
                Email = "test@example.com",
                Password = "Test123!"
            };

            _authServiceMock.Setup(s => s.RegisterAsync(dto))
                            .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Register(dto);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("User created succesfully", response.Message);
            _authServiceMock.Verify(s => s.RegisterAsync(dto), Times.Once);
        }

        [Fact]
        public async Task Login_ShouldReturnOk_WithAuthResponse()
        {
            // Arrange
            var dto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Test123!"
            };

            var expectedResponse = new AuthResponseDto("fake-access-token", "fake-refresh-token");

            _authServiceMock.Setup(s => s.LoginAsync(dto))
                            .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Login(dto);

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<AuthResponseDto>(okResult.Value);

            Assert.Equal(expectedResponse.AccessToken, response.AccessToken);
            Assert.Equal(expectedResponse.RefreshToken, response.RefreshToken);
            _authServiceMock.Verify(s => s.LoginAsync(dto), Times.Once);
        }
        [Fact]
        public async Task Login_ShouldReturnUnauthorized_WhenAuthServiceReturnsNull()
        {
            var dto = new LoginDto
            {
                Email = "wrong@example.com",
                Password = "badpassword"
            };

            _authServiceMock.Setup(s => s.LoginAsync(dto))
                            .ReturnsAsync((AuthResponseDto?)null);

            var result = await _controller.Login(dto);

            var unauthorizedResult = Assert.IsType<UnauthorizedResult>(result.Result);
            _authServiceMock.Verify(s => s.LoginAsync(dto), Times.Once);
        }

        [Fact]
        public async Task Register_ShouldReturnBadRequest_WhenServiceThrowsException()
        {
            var dto = new CreateUserDto
            {
                Email = "duplicate@example.com",
                Password = "Test123!"
            };

            _authServiceMock.Setup(s => s.RegisterAsync(dto))
                            .ThrowsAsync(new InvalidOperationException("User already exists"));

            Func<Task> action = async () => await _controller.Register(dto);

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(action);
            Assert.Equal("User already exists", ex.Message);

            _authServiceMock.Verify(s => s.RegisterAsync(dto), Times.Once);
        }

    }
}
