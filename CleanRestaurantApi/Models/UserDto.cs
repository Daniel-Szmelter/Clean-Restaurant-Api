namespace CleanRestaurantApi.Models
{
    public class UserDto
    {
        public string Email { get; set; }
        public int RoleId { get; set; }
        public bool IsDeleted { get; set; }
    }
}
