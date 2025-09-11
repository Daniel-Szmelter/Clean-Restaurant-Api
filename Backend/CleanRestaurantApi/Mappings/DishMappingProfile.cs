using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;

namespace CleanRestaurantApi.Mappings
{
    public class DishMappingProfile : Profile
    {
        public DishMappingProfile()
        {
            CreateMap<Dish, DishDto>();
            CreateMap<CreateDishDto, Dish>();
            CreateMap<Dish, CreateDishDto>();
            CreateMap<Dish, UpdateDishDto>();
            CreateMap<UpdateDishDto, Dish>();
        }
    }
}
