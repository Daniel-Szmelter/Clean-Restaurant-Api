using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using Microsoft.AspNetCore.JsonPatch;

namespace CleanRestaurantApi.Services
{
    public interface IRestaurantService
    {
        Task<RestaurantDto> GetByIdAsync(int id);
        Task<List<RestaurantDto>> GetAllAsync(int pageNumber, int pageSize);
        Task<int> CreateAsync(CreateRestaurantDto dto);
        Task UpdateAsync(int id, UpdateRestaurantDto dto);
        Task UpdatePartiallyAsync(int id, JsonPatchDocument<UpdateRestaurantDto> patchDoc);
        Task DeleteAsync(int id);
    }
}
