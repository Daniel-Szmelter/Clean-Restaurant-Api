using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;

namespace CleanRestaurantApi.Services
{
    public class RestaurantService : IRestaurantService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RestaurantService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<RestaurantDto> GetByIdAsync(int id)
        {
            var restaurant = await _context.Restaurant
                .Include(r => r.Dishes)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (restaurant == null) throw new KeyNotFoundException("Restaurant not found");

            return _mapper.Map<RestaurantDto>(restaurant);
        }

        public async Task<List<RestaurantDto>> GetAllAsync()
        {

            var baseQuery = _context.Restaurant
                .Include(r => r.Dishes)
                .ThenInclude(d => d.Category)
                .AsQueryable();

            var totalItems = await baseQuery.CountAsync();

            var restaurants = await baseQuery
     .Select(r => new RestaurantDto
     {
         Id = r.Id,
         Name = r.Name,
         City = r.City,
         Street = r.Street,
         Dishes = r.Dishes.Select(d => new DishDto
         {
             Name = d.Name,
             Price = d.Price,
             Description = d.Description,
             CategoryId = d.CategoryId,    
             CategoryName = d.Category.Name 
         }).ToList()
     })
     .ToListAsync();

            foreach (var r in restaurants)
            {
                foreach (var d in r.Dishes)
                {
                    Console.WriteLine($"{d.Name} => {d.CategoryName}");
                }
            }

            return restaurants;
        }

        public async Task<int> CreateAsync(CreateRestaurantDto dto)
        {
            var restaurant = _mapper.Map<Restaurant>(dto);
            _context.Restaurant.Add(restaurant);
            await _context.SaveChangesAsync();
            return restaurant.Id;
        }

        public async Task UpdateAsync(int id, JsonPatchDocument<UpdateRestaurantDto> patchDoc)
        {
            if (patchDoc == null) throw new KeyNotFoundException("patchDoc cannot be null");

            var restaurant = await _context.Restaurant
                .Include(i => i.Dishes)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (restaurant == null) throw new KeyNotFoundException("Restaurant not found");

            var dto = _mapper.Map<UpdateRestaurantDto>(restaurant);

            patchDoc.ApplyTo(dto);

            if (dto.Dishes != null)
            {
                _context.Dish.RemoveRange(restaurant.Dishes);

                restaurant.Dishes = dto.Dishes.Select(d => new Dish
                {
                    Name = d.Name,
                    Price = d.Price,
                    CategoryId = d.CategoryId,
                    Description = d.Description,
                    RestaurantId = restaurant.Id
                }).ToList();
            }

            _mapper.Map(dto, restaurant);

            await _context.SaveChangesAsync();

        }

        public async Task DeleteAsync(int id)
        {
            var restaurant = await _context.Restaurant.FindAsync(id);
            if (restaurant == null) throw new KeyNotFoundException("Restaurant not found");

            _context.Restaurant.Remove(restaurant);
            await _context.SaveChangesAsync();
        }
    }
}
