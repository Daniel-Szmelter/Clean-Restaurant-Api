using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;

namespace CleanRestaurantApi.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<CreateUserDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
            CreateMap<User, UserDto>();
            CreateMap<User, UpdateUserDto>();
            CreateMap<UpdateUserDto, User>();

            CreateMap<Restaurant, CreateRestaurantDto>();
            CreateMap<CreateRestaurantDto, Restaurant>();
            CreateMap<Restaurant, UpdateRestaurantDto>();
            CreateMap<Restaurant, RestaurantDto>();
            CreateMap<UpdateRestaurantDto, Restaurant>();

            CreateMap<Dish, DishDto>();
            CreateMap<CreateDishDto, Dish>();
            CreateMap<Dish, CreateDishDto>();
            CreateMap<Dish, UpdateDishDto>();
            CreateMap<UpdateDishDto, Dish>();

            CreateMap<Category, CategoryDto>();
            CreateMap<CategoryDto, Category>();
            CreateMap<Category, CreateCategoryDto>();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<Category, UpdateCategoryDto>();
            CreateMap<UpdateCategoryDto, Category>();
        }
    }
}
