using AutoMapper;
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
    public class DishControllerTests
    {
        private readonly Mock<IDishService> _mockDishService;
        private readonly DishController _controller;

        public DishControllerTests()
        {
            _mockDishService = new Mock<IDishService>();
            _controller = new DishController(_mockDishService.Object);
        }

        [Fact]
        public async Task GetById_ShouldReturnOk_WithDish()
        {
            
            var dishDto = new DishDto
            {
                Name = "Pizza",
                Price = 25,
                Description = "Delicious pizza",
                CategoryId = 1,
                CategoryName = "Italian"
            };
            _mockDishService.Setup(s => s.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync(dishDto);

            
            var result = await _controller.GetById(1);

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedDish = Assert.IsType<DishDto>(okResult.Value);
            Assert.Equal("Pizza", returnedDish.Name);
            Assert.Equal(25, returnedDish.Price);
            Assert.Equal("Delicious pizza", returnedDish.Description);
            Assert.Equal(1, returnedDish.CategoryId);
            Assert.Equal("Italian", returnedDish.CategoryName);
        }


        [Fact]
        public async Task GetAll_ShouldReturnOk_WithListOfDishes()
        {
            
            var dishes = new List<DishDto>
    {
        new DishDto { Name = "Pizza", Price = 25, Description = "Delicious pizza", CategoryId = 1, CategoryName = "Italian" },
        new DishDto { Name = "Burger", Price = 15, Description = "Tasty burger", CategoryId = 2, CategoryName = "Fast Food" }
    };
            _mockDishService.Setup(s => s.GetAllAsync())
                .ReturnsAsync(dishes);

            
            var result = await _controller.GetAll();

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedDishes = Assert.IsType<List<DishDto>>(okResult.Value);
            Assert.Equal(2, returnedDishes.Count);
            Assert.Equal("Pizza", returnedDishes[0].Name);
            Assert.Equal("Burger", returnedDishes[1].Name);
        }


        [Fact]
        public async Task Create_ShouldReturnOk_WhenDishCreated()
        {
            var dto = new CreateDishDto { Name = "Pasta", Price = 20 };

            _mockDishService.Setup(s => s.CreateAsync(dto))
                .ReturnsAsync(2);

            var result = await _controller.Create(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Dish created succesfully", response.Message);
        }


        [Fact]
        public async Task UpdatePartially_ShouldReturnOk_WhenDishUpdated()
        {
            
            var patchDoc = new JsonPatchDocument<UpdateDishDto>();
            _mockDishService.Setup(s => s.UpdateAsync(1, patchDoc))
                .Returns(Task.CompletedTask);

            
            var result = await _controller.UpdatePartially(1, patchDoc);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Dish updated succesfully", response.Message);
        }

        [Fact]
        public async Task Delete_ShouldReturnOk_WhenDishDeleted()
        {
            
            _mockDishService.Setup(s => s.DeleteAsync(1))
                .Returns(Task.CompletedTask);

            
            var result = await _controller.Delete(1);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Dish deleted succesfully", response.Message);
        }
    }
}
