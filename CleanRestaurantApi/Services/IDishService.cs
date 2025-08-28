using CleanRestaurantApi.Models;
using Microsoft.AspNetCore.JsonPatch;

namespace CleanRestaurantApi.Services
{
    public interface IDishService
    {
        Task<DishDto> GetByIdAsync(int id);
        Task<List<DishDto>> GetAllAsync();
        Task CreateAsync(CreateDishDto dto);
        Task UpdateAsync(int id, UpdateDishDto dto);
        Task UpdatePartiallyAsync(int id, JsonPatchDocument<UpdateDishDto> patchDoc);
        Task DeleteAsync(int id);
    }
}
