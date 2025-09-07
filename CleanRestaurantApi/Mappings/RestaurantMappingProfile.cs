using AutoMapper;
using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;

namespace CleanRestaurantApi.Mappings
{
    public class RestaurantMappingProfile : Profile
    {
        public RestaurantMappingProfile()
        {
            CreateMap<Restaurant, CreateRestaurantDto>();
            CreateMap<CreateRestaurantDto, Restaurant>();
            CreateMap<Restaurant, UpdateRestaurantDto>();
            CreateMap<Restaurant, RestaurantDto>();
            CreateMap<UpdateRestaurantDto, Restaurant>();
        }
    }
}
