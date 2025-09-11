namespace CleanRestaurantApi.Entities
{
    public class Role : AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public ICollection<User> Users { get; set; } = new List<User>();
    }

}
