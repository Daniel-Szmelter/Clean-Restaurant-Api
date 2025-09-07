using AutoMapper;
using CleanRestaurantApi.Entities;
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
    public class CategoryServiceTests
    {
        private readonly DbContextOptions<AppDbContext> _dbOptions;
        private readonly Mock<IMapper> _mockMapper;

        public CategoryServiceTests()
        {
            _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _mockMapper = new Mock<IMapper>();
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnCategoryDto_WhenCategoryExists()
        {
            using var context = new AppDbContext(_dbOptions);
            var category = new Category { Name = "TestCategory" };
            context.Category.Add(category);
            await context.SaveChangesAsync();

            var service = new CategoryService(context, _mockMapper.Object);
            _mockMapper.Setup(m => m.Map<CategoryDto>(It.IsAny<Category>()))
                       .Returns((Category src) => new CategoryDto { Id = src.Id, Name = src.Name });

            var result = await service.GetByIdAsync(category.Id);

            Assert.NotNull(result);
            Assert.Equal(category.Id, result.Id);
            Assert.Equal(category.Name, result.Name);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrow_WhenCategoryDoesNotExist()
        {
            using var context = new AppDbContext(_dbOptions);
            var service = new CategoryService(context, _mockMapper.Object);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetByIdAsync(999));
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllCategories()
        {
            using var context = new AppDbContext(_dbOptions);
            context.Category.AddRange(
                new Category { Name = "Cat1" },
                new Category { Name = "Cat2" }
            );
            await context.SaveChangesAsync();

            var service = new CategoryService(context, _mockMapper.Object);
            _mockMapper.Setup(m => m.Map<List<CategoryDto>>(It.IsAny<List<Category>>()))
                       .Returns((List<Category> src) => src.Select(c => new CategoryDto { Id = c.Id, Name = c.Name }).ToList());

            var result = await service.GetAllAsync();

            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddCategoryToDb()
        {
            using var context = new AppDbContext(_dbOptions);
            var service = new CategoryService(context, _mockMapper.Object);

            var dto = new CreateCategoryDto { Name = "NewCategory" };
            _mockMapper.Setup(m => m.Map<Category>(dto)).Returns(new Category { Name = dto.Name });

            await service.CreateAsync(dto);

            var categoryInDb = context.Category.FirstOrDefault(c => c.Name == "NewCategory");
            Assert.NotNull(categoryInDb);
        }

        [Fact]
        public async Task UpdatePartiallyAsync_ShouldApplyPatch()
        {
            using var context = new AppDbContext(_dbOptions);
            var category = new Category { Name = "OldName" };
            context.Category.Add(category);
            await context.SaveChangesAsync();

            var service = new CategoryService(context, _mockMapper.Object);
            var patchDoc = new JsonPatchDocument<UpdateCategoryDto>();
            patchDoc.Replace(c => c.Name, "PatchedName");

            _mockMapper.Setup(m => m.Map<UpdateCategoryDto>(It.IsAny<Category>()))
                       .Returns((Category src) => new UpdateCategoryDto { Name = src.Name });
            _mockMapper.Setup(m => m.Map(It.IsAny<UpdateCategoryDto>(), It.IsAny<Category>()))
                       .Callback<UpdateCategoryDto, Category>((src, dest) => dest.Name = src.Name);

            await service.UpdateAsync(category.Id, patchDoc);

            var updatedCategory = await context.Category.FindAsync(category.Id);
            Assert.Equal("PatchedName", updatedCategory.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenCategoryDoesNotExist()
        {
            using var context = new AppDbContext(_dbOptions);
            var service = new CategoryService(context, _mockMapper.Object);
            var patchDoc = new JsonPatchDocument<UpdateCategoryDto>();

            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.UpdateAsync(999, patchDoc));
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveCategory()
        {
            using var context = new AppDbContext(_dbOptions);
            var category = new Category { Name = "ToDelete" };
            context.Category.Add(category);
            await context.SaveChangesAsync();

            var service = new CategoryService(context, _mockMapper.Object);
            await service.DeleteAsync(category.Id);

            var deletedCategory = await context.Category.FindAsync(category.Id);
            Assert.Null(deletedCategory);
        }

        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenCategoryDoesNotExist()
        {
            using var context = new AppDbContext(_dbOptions);
            var service = new CategoryService(context, _mockMapper.Object);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.DeleteAsync(999));
        }
    }
}
