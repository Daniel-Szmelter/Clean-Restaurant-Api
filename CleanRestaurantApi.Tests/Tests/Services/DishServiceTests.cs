using AutoMapper;
using CleanRestaurantApi.Data;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Services;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace CleanRestaurantApi.Tests.Services
{
    public class DishServiceTests
    {
        private readonly DbContextOptions<AppDbContext> _dbOptions;
        private readonly Mock<IMapper> _mockMapper;

        public DishServiceTests()
        {
            _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _mockMapper = new Mock<IMapper>();
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnDishDto_WhenDishExists()
        {
            
            using var context = new AppDbContext(_dbOptions);
            var dish = new Dish
            {
                Id = 1,
                Name = "Pizza",
                Price = 20m,
                Description = "Test dish",
                CategoryId = 5,
                Category = new Category { Id = 5, Name = "Italian" }
            };
            context.Dish.Add(dish);
            await context.SaveChangesAsync();

            _mockMapper.Setup(m => m.Map<DishDto>(It.IsAny<Dish>()))
                       .Returns<Dish>(d => new DishDto
                       {
                           Name = d.Name,
                           Price = d.Price,
                           Description = d.Description,
                           CategoryId = d.CategoryId,
                           CategoryName = d.Category.Name
                       });

            var service = new DishService(context, _mockMapper.Object);

            
            var result = await service.GetByIdAsync(dish.Id);

            
            Assert.NotNull(result);
            Assert.Equal(dish.Name, result.Name);
            Assert.Equal(dish.Price, result.Price);
            Assert.Equal(dish.Description, result.Description);
            Assert.Equal(dish.CategoryId, result.CategoryId);
            Assert.Equal(dish.Category.Name, result.CategoryName);
        }


        [Fact]
        public async Task GetByIdAsync_ShouldThrow_WhenDishNotFound()
        {
            
            using var context = new AppDbContext(_dbOptions);
            var service = new DishService(context, _mockMapper.Object);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetByIdAsync(999));
        }

        [Fact]
        public async Task CreateAsync_ShouldAddDishToDb()
        {
            using var context = new AppDbContext(_dbOptions);

            var category = new Category { Id = 1, Name = "FastFood" };
            context.Category.Add(category);

            var restaurant = new Restaurant { Id = 1, Name = "TestRest", City = "City", Street = "Street" };
            context.Restaurant.Add(restaurant);

            await context.SaveChangesAsync();

            var dto = new CreateDishDto
            {
                Name = "Burger",
                Price = 15,
                Description = "Tasty burger",
                CategoryName = "FastFood",
                RestaurantId = 1
            };

            var dishService = new DishService(context, _mockMapper.Object);
            await dishService.CreateAsync(dto);

            var createdDish = context.Dish.FirstOrDefault(d => d.Name == "Burger");
            Assert.NotNull(createdDish);
            Assert.Equal("Tasty burger", createdDish!.Description);
            Assert.Equal(category.Id, createdDish.CategoryId);
        }


        [Fact]
        public async Task UpdateAsync_ShouldApplyPatch_WhenDishExists()
        {
            
            using var context = new AppDbContext(_dbOptions);
            var dish = new Dish { Id = 1, Name = "Pasta", Price = 12m, Description = "Original" };
            context.Dish.Add(dish);
            await context.SaveChangesAsync();

            var patch = new JsonPatchDocument<UpdateDishDto>();
            patch.Replace(d => d.Name, "Updated Pasta");

            _mockMapper.Setup(m => m.Map<UpdateDishDto>(dish)).Returns(new UpdateDishDto { Name = dish.Name });
            _mockMapper.Setup(m => m.Map(It.IsAny<UpdateDishDto>(), dish)).Callback<UpdateDishDto, Dish>((dto, entity) => entity.Name = dto.Name);

            var service = new DishService(context, _mockMapper.Object);

            
            await service.UpdateAsync(dish.Id, patch);

            
            var updatedDish = await context.Dish.FindAsync(dish.Id);
            Assert.Equal("Updated Pasta", updatedDish!.Name);
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveDish_WhenDishExists()
        {
            
            using var context = new AppDbContext(_dbOptions);
            var dish = new Dish { Id = 1, Name = "Salad", Description = "Green salad" };
            context.Dish.Add(dish);
            await context.SaveChangesAsync();

            var service = new DishService(context, _mockMapper.Object);

            
            await service.DeleteAsync(dish.Id);

            
            var deletedDish = await context.Dish.FindAsync(dish.Id);
            Assert.Null(deletedDish);
        }
    }
}
