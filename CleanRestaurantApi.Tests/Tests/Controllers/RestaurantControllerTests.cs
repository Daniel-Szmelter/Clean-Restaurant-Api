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
    public class RestaurantControllerTests
    {
        private readonly RestaurantController _controller;
        private readonly Mock<IRestaurantService> _mockRestaurantService;

        public RestaurantControllerTests()
        {
            _mockRestaurantService = new Mock<IRestaurantService>();
            _controller = new RestaurantController(_mockRestaurantService.Object);
        }

        [Fact]
        public async Task GetById_ShouldReturnOk_WithRestaurant()
        {
            // Arrange
            var restaurant = new RestaurantDto { Id = 1, Name = "Resto", City = "City", Street = "Street" };
            _mockRestaurantService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(restaurant);

            // Act
            var result = await _controller.GetById(1);

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedRestaurant = Assert.IsType<RestaurantDto>(okResult.Value);
            Assert.Equal(1, returnedRestaurant.Id);
            Assert.Equal("Resto", returnedRestaurant.Name);
        }

        [Fact]
        public async Task GetAll_ShouldReturnOk_WithListOfRestaurants()
        {
            // Arrange
            var restaurants = new List<RestaurantDto>
            {
                new RestaurantDto { Id = 1, Name = "Resto1", City = "City1", Street = "Street1" },
                new RestaurantDto { Id = 2, Name = "Resto2", City = "City2", Street = "Street2" }
            };
            _mockRestaurantService.Setup(s => s.GetAllAsync()).ReturnsAsync(restaurants);

            // Act
            var result = await _controller.GetAll();

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedRestaurants = Assert.IsType<List<RestaurantDto>>(okResult.Value);
            Assert.Equal(2, returnedRestaurants.Count);
        }

        [Fact]
        public async Task Create_ShouldReturnOk_WhenRestaurantCreated()
        {
            // Arrange
            var dto = new CreateRestaurantDto { Name = "New Resto", City = "City", Street = "Street" };
            _mockRestaurantService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(1);

            // Act
            var result = await _controller.Create(dto);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Restaurant created succesfully", response.Message);
        }

        [Fact]
        public async Task Update_ShouldReturnOk_WhenRestaurantUpdated()
        {
            // Arrange
            var patchDoc = new JsonPatchDocument<UpdateRestaurantDto>();
            _mockRestaurantService.Setup(s => s.UpdateAsync(1, patchDoc)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Update(1, patchDoc);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Restaurant updated succesfully", response.Message);
        }

        [Fact]
        public async Task Delete_ShouldReturnOk_WhenRestaurantDeleted()
        {
            // Arrange
            _mockRestaurantService.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Delete(1);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Restaurant deleted succesfully", response.Message);
        }
    }
}
