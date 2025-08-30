using CleanRestaurantApi.Entities;

namespace CleanRestaurantApi.Models
{
    public class RestaurantDto
    {
        public string Name { get; set; } = default!;
        public string City { get; set; } = default!;
        public string Street { get; set; } = default!;
        public List<DishDto> Dishes { get; set; }
    }
}
