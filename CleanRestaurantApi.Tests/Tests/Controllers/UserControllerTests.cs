using CleanRestaurantApi.Controllers;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace CleanRestaurantApi.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly UserController _controller;
        private readonly Mock<IUserService> _mockUserService;

        public UserControllerTests()
        {
            _mockUserService = new Mock<IUserService>();
            _controller = new UserController(_mockUserService.Object);
        }

        [Fact]
        public async Task GetById_ShouldReturnOk_WithUser()
        {
            // Arrange
            var user = new UserDto { Id = 1, Email = "test@example.com", Role = "Admin" };
            _mockUserService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(user);

            // Act
            var result = await _controller.GetById(1);

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedUser = Assert.IsType<UserDto>(okResult.Value);
            Assert.Equal(1, returnedUser.Id);
            Assert.Equal("test@example.com", returnedUser.Email);
        }

        [Fact]
        public async Task GetAll_ShouldReturnOk_WithListOfUsers()
        {
            // Arrange
            var users = new List<UserDto>
            {
                new UserDto { Id = 1, Email = "user1@example.com", Role = "Admin" },
                new UserDto { Id = 2, Email = "user2@example.com", Role = "User" }
            };
            _mockUserService.Setup(s => s.GetAllAsync()).ReturnsAsync(users);

            // Act
            var result = await _controller.GetAll();

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedUsers = Assert.IsType<List<UserDto>>(okResult.Value);
            Assert.Equal(2, returnedUsers.Count);
        }

        [Fact]
        public async Task Create_ShouldReturnOk_WhenUserCreated()
        {
            // Arrange
            var dto = new CreateUserDto { Email = "newuser@example.com", Password = "password", Role = "User" };
            _mockUserService.Setup(s => s.CreateAsync(dto)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Create(dto);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("User created succesfully", response.Message);
        }

        [Fact]
        public async Task Update_ShouldReturnOk_WhenUserUpdated()
        {
            // Arrange
            var patchDoc = new JsonPatchDocument<UpdateUserDto>();
            _mockUserService.Setup(s => s.UpdateAsync(1, patchDoc)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Update(1, patchDoc);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("User updated succesfully", response.Message);
        }

        [Fact]
        public async Task Delete_ShouldReturnOk_WhenUserDeleted()
        {
            // Arrange
            _mockUserService.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Delete(1);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("User deleted succesfully", response.Message);
        }
    }
}
