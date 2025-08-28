using CleanRestaurantApi.Data;

namespace CleanRestaurantApi.Entities
{
    public class Dish : AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; } = default!;
        public int RestaurantId { get; set; }
    }

}
