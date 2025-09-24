using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;

namespace CleanRestaurantApi.Services
{
    public class DishService : IDishService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public DishService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }


        public async Task<DishDto> GetByIdAsync(int id)
        {
            var dish = await _context.Dish.FirstOrDefaultAsync(d => d.Id == id);
            if (dish == null) throw new KeyNotFoundException("Dish not found");

            return _mapper.Map<DishDto>(dish);
        }

        public async Task<List<DishDto>> GetAllAsync()
        {
            var dish = await _context.Dish
                .ToListAsync();
            if (dish == null) throw new KeyNotFoundException("Dish not found");

            return _mapper.Map<List<DishDto>>(dish);
        }

        public async Task<int> CreateAsync(CreateDishDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            if (dto.CategoryId == 0 && string.IsNullOrWhiteSpace(dto.CategoryName))
                throw new ArgumentException("Either CategoryId or CategoryName must be provided.", nameof(dto));


            int categoryId = dto.CategoryId;

            if (categoryId == 0 && !string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                var category = await _context.Category
                    .FirstOrDefaultAsync(c => c.Name == dto.CategoryName);

                if (category == null)
                {
                    category = new Category { Name = dto.CategoryName };
                    await _context.Category.AddAsync(category);
                    await _context.SaveChangesAsync();
                }

                categoryId = category.Id;
            }

            var dish = new Dish
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = categoryId,
                RestaurantId = dto.RestaurantId
            };

            await _context.Dish.AddAsync(dish);
            await _context.SaveChangesAsync();

            return dish.Id;


        }



        public async Task UpdateAsync(int id, JsonPatchDocument<UpdateDishDto> patchDoc)
        {
            if (patchDoc == null) throw new KeyNotFoundException("patchDoc cannot be null");

            var dish = await _context.Dish
                .FirstOrDefaultAsync(r => r.Id == id);
            if (dish == null) throw new KeyNotFoundException("Dish not found");

            var dto = _mapper.Map<UpdateDishDto>(dish);

            patchDoc.ApplyTo(dto);

            _mapper.Map(dto, dish);

            await _context.SaveChangesAsync();

        }

        public async Task DeleteAsync(int id)
        {
            var dish = await _context.Dish.FindAsync(id);
            if (dish == null) throw new KeyNotFoundException("Dish not found");

            _context.Dish.Remove(dish);
            await _context.SaveChangesAsync();
        }
    }
}
