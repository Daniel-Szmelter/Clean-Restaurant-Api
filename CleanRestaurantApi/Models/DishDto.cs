namespace CleanRestaurantApi.Models
{
    public class DishDto
    {
        public string Name { get; set; } = default!;
        public decimal Price { get; set; }
        public int RestaurantId { get; set; }
    }
}
