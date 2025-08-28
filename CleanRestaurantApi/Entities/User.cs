using CleanRestaurantApi.Data;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Security.Claims;

namespace CleanRestaurantApi.Entities
{
    public class User : AuditableEntity
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Email { get; set; } = default!;

        [Required]
        public string PasswordHash { get; set; } = default!;
        public int? RoleId { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }

}
