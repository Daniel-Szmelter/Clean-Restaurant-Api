namespace CleanRestaurantApi.Models
{
    public class CreateDishDto
    {
        public string Name { get; set; } = default!;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public int RestaurantId { get; set; }
    }
}
