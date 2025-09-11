namespace CleanRestaurantApi.Models
{
    public class UpdateDishDto
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public int RestaurantId { get; set; }
    }
}
