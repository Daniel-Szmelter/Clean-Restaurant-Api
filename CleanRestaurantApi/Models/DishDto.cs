namespace CleanRestaurantApi.Models
{
    public class DishDto
    {
        public string Name { get; set; } = default!;
        public decimal Price { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
    }
}
