namespace CleanRestaurantApi.Models
{
    public class CreateDishDto
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public string CategoryName { get; set; }
        public int CategoryId { get; set; }
        public int RestaurantId { get; set; }
    }
}
