using CleanRestaurantApi.Data;

namespace CleanRestaurantApi.Entities
{
    public class Restaurant : AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string City { get; set; } = default!;
        public string Street { get; set; } = default!;

        public ICollection<Dish> Dishes { get; set; } = new List<Dish>();
    }
}