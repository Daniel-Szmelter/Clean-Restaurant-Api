using CleanRestaurantApi.Entities;

namespace CleanRestaurantApi.Models
{
    public class RestaurantDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string City { get; set; } = default!;
        public string Street { get; set; } = default!;
        public bool IsSeeded { get; set; } = false;
        public List<DishDto> Dishes { get; set; }
    }
}
