using AutoMapper;
using CleanRestaurantApi.Data;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Mappings;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Services;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace CleanRestaurantApi.Tests.Integration
{
    public class RestaurantIntegrationTests
    {
        private (AppDbContext, IRestaurantService) CreateTestContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);

            context.Restaurant.Add(new Restaurant
            {
                Name = "Test Restaurant",
                City = "Phoenix",
                Street = "201 Main St."
            });
            context.SaveChanges();

            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<CategoryMappingProfile>();
                cfg.AddProfile<DishMappingProfile>();
                cfg.AddProfile<RestaurantMappingProfile>();
                cfg.AddProfile<UserMappingProfile>();
            });
            var mapper = mapperConfig.CreateMapper();

            var restaurantService = new RestaurantService(context, mapper);
            return (context, restaurantService);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnRestaurantDto_WhenRestaurantExists()
        {
            var (_, restaurantService) = CreateTestContext();

            var result = await restaurantService.GetByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal("Test Restaurant", result.Name);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllRestaurants()
        {
            var (_, restaurantService) = CreateTestContext();

            var result = await restaurantService.GetAllAsync();

            Assert.Single(result);
            Assert.Equal("Test Restaurant", result[0].Name);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddRestaurant()
        {
            var (_, restaurantService) = CreateTestContext();

            var dto = new CreateRestaurantDto
            {
                Name = "New Restaurant",
                City = "Phoenix",
                Street = "201 Main St."
            };

            await restaurantService.CreateAsync(dto);

            var restaurants = await restaurantService.GetAllAsync();
            Assert.Equal(2, restaurants.Count);
            Assert.Contains(restaurants, r => r.Name == "New Restaurant");
        }

        [Fact]
        public async Task UpdateAsync_ShouldModifyRestaurant()
        {
            var (_, restaurantService) = CreateTestContext();

            var patchDoc = new JsonPatchDocument<UpdateRestaurantDto>();
            patchDoc.Replace(r => r.Name, "Updated Restaurant");

            await restaurantService.UpdateAsync(1, patchDoc);

            var updatedRestaurant = await restaurantService.GetByIdAsync(1);
            Assert.Equal("Updated Restaurant", updatedRestaurant.Name);
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveRestaurant()
        {
            var (_, restaurantService) = CreateTestContext();

            await restaurantService.DeleteAsync(1);

            var restaurants = await restaurantService.GetAllAsync();
            Assert.Empty(restaurants);
        }
    }
}
