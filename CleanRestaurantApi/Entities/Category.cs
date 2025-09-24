using CleanRestaurantApi.Data;

namespace CleanRestaurantApi.Entities
{
    public class Category : AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
    }
}
