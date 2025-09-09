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
    public class CategoryControllerTests
    {
        private readonly Mock<ICategoryService> _categoryServiceMock;
        private readonly CategoryController _controller;

        public CategoryControllerTests()
        {
            _categoryServiceMock = new Mock<ICategoryService>();
            _controller = new CategoryController(_categoryServiceMock.Object);
        }

        [Fact]
        public async Task GetById_ShouldReturnOk_WithCategory()
        {
            // Arrange
            var categoryId = 1;
            var categoryDto = new CategoryDto { Id = categoryId, Name = "TestCategory" };
            _categoryServiceMock.Setup(s => s.GetByIdAsync(categoryId))
                                .ReturnsAsync(categoryDto);

            // Act
            var result = await _controller.GetById(categoryId);

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<CategoryDto>(okResult.Value);
            Assert.Equal(categoryId, response.Id);
            Assert.Equal("TestCategory", response.Name);
        }

        [Fact]
        public async Task GetAll_ShouldReturnOk_WithListOfCategories()
        {
            // Arrange
            var categories = new List<CategoryDto>
            {
                new CategoryDto { Id = 1, Name = "Category1" },
                new CategoryDto { Id = 2, Name = "Category2" }
            };
            _categoryServiceMock.Setup(s => s.GetAllAsync())
                                .ReturnsAsync(categories);

            // Act
            var result = await _controller.GetAll();

            
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<List<CategoryDto>>(okResult.Value);
            Assert.Equal(2, response.Count);
        }

        [Fact]
        public async Task Create_ShouldReturnOk_WhenCategoryCreated()
        {
            // Arrange
            var dto = new CreateCategoryDto { Name = "NewCategory" };
            _categoryServiceMock.Setup(s => s.CreateAsync(dto))
                                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Create(dto);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Category created successfully", response.Message);
            _categoryServiceMock.Verify(s => s.CreateAsync(dto), Times.Once);
        }

        [Fact]
        public async Task Update_ShouldReturnOk_WhenCategoryUpdated()
        {
            // Arrange
            var categoryId = 1;
            var patchDoc = new JsonPatchDocument<UpdateCategoryDto>();
            patchDoc.Replace(c => c.Name, "UpdatedCategory");
            _categoryServiceMock.Setup(s => s.UpdateAsync(categoryId, patchDoc))
                                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Update(categoryId, patchDoc);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Category updated successfully", response.Message);
            _categoryServiceMock.Verify(s => s.UpdateAsync(categoryId, patchDoc), Times.Once);
        }

        [Fact]
        public async Task Delete_ShouldReturnOk_WhenCategoryDeleted()
        {
            // Arrange
            var categoryId = 1;
            _categoryServiceMock.Setup(s => s.DeleteAsync(categoryId))
                                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Delete(categoryId);

            
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<MessageResponseDto>(okResult.Value);
            Assert.Equal("Category deleted successfully", response.Message);
            _categoryServiceMock.Verify(s => s.DeleteAsync(categoryId), Times.Once);
        }
    }
}
