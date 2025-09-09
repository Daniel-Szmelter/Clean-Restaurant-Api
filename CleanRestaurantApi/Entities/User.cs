using System.ComponentModel.DataAnnotations;

namespace CleanRestaurantApi.Entities
{
    public class User : AuditableEntity
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Email { get; set; } = default!;

        [Required]
        public string PasswordHash { get; set; } = default!;
        public string? Role { get; set; } = "User";
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }

}
