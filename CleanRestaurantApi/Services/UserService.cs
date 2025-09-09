using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;

namespace CleanRestaurantApi.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserService(AppDbContext context, IMapper mapper, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserDto> GetByIdAsync(int id)
        {
            var user = await _context.User
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) throw new KeyNotFoundException("User not found");

            return _mapper.Map<UserDto>(user);
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            var totalCount = await _context.User.CountAsync();

            var users = await _context.User
                .ToListAsync();

            return _mapper.Map<List<UserDto>>(users);
        }

        public async Task CreateAsync(CreateUserDto dto)
        {
            var user = new User
            {
                Email = dto.Email,
                Role = dto.Role
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            _context.User.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(int id, JsonPatchDocument<UpdateUserDto> patchDoc)
        {
            if (patchDoc == null) throw new KeyNotFoundException("patchDoc cannot be null");

            var user = await _context.User
                .FirstOrDefaultAsync(r => r.Id == id);
            if (user == null) throw new KeyNotFoundException("User not found");

            var dto = _mapper.Map<UpdateUserDto>(user);

            patchDoc.ApplyTo(dto);

            _mapper.Map(dto, user);

            await _context.SaveChangesAsync();

        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.User.FindAsync(id);
            if (user == null) throw new KeyNotFoundException("User not found");

            _context.User.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
