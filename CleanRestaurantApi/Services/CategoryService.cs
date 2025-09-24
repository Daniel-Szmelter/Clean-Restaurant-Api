using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;

namespace CleanRestaurantApi.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public CategoryService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }


        public async Task<CategoryDto> GetByIdAsync(int id)
        {
            var category = await _context.Category.FirstOrDefaultAsync(d => d.Id == id);
            if (category == null) throw new KeyNotFoundException("Category not found");

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<List<CategoryDto>> GetAllAsync()
        {
            var category = await _context.Category
                .ToListAsync();
            if (category == null) throw new KeyNotFoundException("Category not found");

            return _mapper.Map<List<CategoryDto>>(category);
        }

        public async Task CreateAsync(CreateCategoryDto dto)
        {
            var category = _mapper.Map<Category>(dto);
            _context.Category.Add(category);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(int id, JsonPatchDocument<UpdateCategoryDto> patchDoc)
        {
            if (patchDoc == null) throw new KeyNotFoundException("patchDoc cannot be null");

            var category = await _context.Category
                .FirstOrDefaultAsync(r => r.Id == id);
            if (category == null) throw new KeyNotFoundException("Category not found");

            var dto = _mapper.Map<UpdateCategoryDto>(category);

            patchDoc.ApplyTo(dto);

            _mapper.Map(dto, category);

            await _context.SaveChangesAsync();

        }

        public async Task DeleteAsync(int id)
        {
            var category = await _context.Category.FindAsync(id);
            if (category == null)
                throw new KeyNotFoundException("Category not found");

            bool hasDishes = await _context.Dish.AnyAsync(d => d.CategoryId == id);
            if (hasDishes)
                throw new InvalidOperationException("Cannot delete category because it has related dishes.");

            _context.Category.Remove(category);
            await _context.SaveChangesAsync();
        }


    }
}
