namespace CleanRestaurantApi.Models
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsSeeded { get; set; } = false;
    }
}
