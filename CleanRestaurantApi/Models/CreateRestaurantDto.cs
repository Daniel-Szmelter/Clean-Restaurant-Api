using CleanRestaurantApi.Entities;

namespace CleanRestaurantApi.Models
{
    public class CreateRestaurantDto
    {
        public string Name { get; set; } = default!;
        public string City { get; set; } = default!;
        public string Street { get; set; } = default!;
        public List<CreateDishDto>? Dishes { get; set; }
    }
}
