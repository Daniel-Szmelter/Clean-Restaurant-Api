using CleanRestaurantApi.Models;
using Microsoft.AspNetCore.JsonPatch;

namespace CleanRestaurantApi.Services
{
    public interface ICategoryService
    {
        Task<CategoryDto> GetByIdAsync(int id);
        Task<List<CategoryDto>> GetAllAsync();
        Task CreateAsync(CreateCategoryDto dto);
        Task UpdateAsync(int id, JsonPatchDocument<UpdateCategoryDto> patchDoc);
        Task DeleteAsync(int id);
    }
}
