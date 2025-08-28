namespace CleanRestaurantApi.Entities
{
    public class RefreshToken : AuditableEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = default!;
        public string Token { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
        public bool Revoked { get; set; }
        public string? ReplacedByToken { get; set; }
    }
}