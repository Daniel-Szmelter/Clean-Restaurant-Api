using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using Microsoft.AspNetCore.JsonPatch;
using System.Runtime.CompilerServices;

namespace CleanRestaurantApi.Services
{
    public interface IUserService
    {
        Task<UserDto> GetByIdAsync(int id);
        public Task<List<UserDto>> GetAllAsync();
        Task CreateAsync(CreateUserDto dto);
        Task UpdateAsync(int id, JsonPatchDocument<UpdateUserDto> patchDoc);
        Task DeleteAsync(int id);
    }
}
