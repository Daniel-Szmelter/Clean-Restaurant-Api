using AutoMapper;
using CleanRestaurantApi.Data;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Mappings;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Services;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CleanRestaurantApi.Tests.Services
{
    public class RestaurantServiceTests
    {
        private readonly RestaurantService _service;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RestaurantServiceTests()
        {
            // Konfiguracja InMemory bazy danych
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            // Dodanie przykładowych danych
            _context.Restaurant.Add(new Restaurant
            {
                Id = 1,
                Name = "Test Restaurant",
                City = "City",
                Street = "Street",
                Dishes = new List<Dish>
                {
                    new Dish { Id = 1, Name = "Dish1", Price = 10, CategoryId = 1, Description = "Desc", Category = new Category { Id = 1, Name = "Cat1" } }
                }
            });
            _context.SaveChanges();

            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<CategoryMappingProfile>();
                cfg.AddProfile<DishMappingProfile>();
                cfg.AddProfile<RestaurantMappingProfile>();
                cfg.AddProfile<UserMappingProfile>();
            });
            _mapper = mapperConfig.CreateMapper();

            _service = new RestaurantService(_context, _mapper);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnRestaurantDto_WhenExists()
        {
            var result = await _service.GetByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal("Test Restaurant", result.Name);
            Assert.Single(result.Dishes);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrowKeyNotFound_WhenNotExists()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetByIdAsync(999));
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllRestaurants()
        {
            var result = await _service.GetAllAsync();

            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("Test Restaurant", result[0].Name);
            Assert.Single(result[0].Dishes);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddRestaurant()
        {
            var dto = new CreateRestaurantDto
            {
                Name = "New Restaurant",
                City = "New City",
                Street = "New Street"
            };

            var id = await _service.CreateAsync(dto);
            var created = await _context.Restaurant.FindAsync(id);

            Assert.NotNull(created);
            Assert.Equal("New Restaurant", created.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateRestaurant()
        {
            var patchDoc = new JsonPatchDocument<UpdateRestaurantDto>();
            patchDoc.Replace(r => r.Name, "Updated Name");

            await _service.UpdateAsync(1, patchDoc);

            var updated = await _context.Restaurant.FindAsync(1);
            Assert.Equal("Updated Name", updated.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenRestaurantNotFound()
        {
            var patchDoc = new JsonPatchDocument<UpdateRestaurantDto>();
            patchDoc.Replace(r => r.Name, "Updated Name");

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(999, patchDoc));
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenPatchDocNull()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(1, null));
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveRestaurant()
        {
            await _service.DeleteAsync(1);
            var restaurant = await _context.Restaurant.FindAsync(1);
            Assert.Null(restaurant);
        }

        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenRestaurantNotFound()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(999));
        }
    }
}
