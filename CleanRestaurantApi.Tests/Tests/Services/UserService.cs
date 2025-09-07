using AutoMapper;
using CleanRestaurantApi.Data;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Mappings;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Services;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace CleanRestaurantApi.Tests.Services
{
    public class UserServiceTests
    {
        private readonly UserService _service;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly Mock<IPasswordHasher<User>> _passwordHasherMock;

        public UserServiceTests()
        {
            // InMemory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            // Dodanie przykładowego użytkownika
            _context.User.Add(new User
            {
                Id = 1,
                Email = "test@example.com",
                Role = "Admin",
                PasswordHash = "hashed"
            });
            _context.SaveChanges();

            // AutoMapper - użycie wszystkich Twoich profili
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<CategoryMappingProfile>();
                cfg.AddProfile<DishMappingProfile>();
                cfg.AddProfile<RestaurantMappingProfile>();
                cfg.AddProfile<UserMappingProfile>();
            });
            _mapper = mapperConfig.CreateMapper();

            // Mock PasswordHasher
            _passwordHasherMock = new Mock<IPasswordHasher<User>>();
            _passwordHasherMock.Setup(ph => ph.HashPassword(It.IsAny<User>(), It.IsAny<string>()))
                               .Returns((User u, string p) => "hashed_" + p);

            // Serwis
            _service = new UserService(_context, _mapper, _passwordHasherMock.Object);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnUserDto_WhenExists()
        {
            var result = await _service.GetByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal("test@example.com", result.Email);
            Assert.Equal("Admin", result.Role);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrowKeyNotFound_WhenNotExists()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetByIdAsync(999));
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllUsers()
        {
            var result = await _service.GetAllAsync();

            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("test@example.com", result[0].Email);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddUserWithHashedPassword()
        {
            var dto = new CreateUserDto
            {
                Email = "new@example.com",
                Password = "password123",
                Role = "User"
            };

            await _service.CreateAsync(dto);

            var created = await _context.User.FirstOrDefaultAsync(u => u.Email == "new@example.com");
            Assert.NotNull(created);
            Assert.Equal("User", created.Role);
            Assert.Equal("hashed_password123", created.PasswordHash);
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateUser()
        {
            var patchDoc = new JsonPatchDocument<UpdateUserDto>();
            patchDoc.Replace(u => u.Role, "SuperAdmin");

            await _service.UpdateAsync(1, patchDoc);

            var updated = await _context.User.FindAsync(1);
            Assert.Equal("SuperAdmin", updated.Role);
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenUserNotFound()
        {
            var patchDoc = new JsonPatchDocument<UpdateUserDto>();
            patchDoc.Replace(u => u.Role, "SuperAdmin");

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(999, patchDoc));
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenPatchDocNull()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(1, null));
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveUser()
        {
            await _service.DeleteAsync(1);

            var user = await _context.User.FindAsync(1);
            Assert.Null(user);
        }

        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenUserNotFound()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(999));
        }
    }
}
