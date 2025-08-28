namespace CleanRestaurantApi.Models.Auth
{
    public class JwtSettings
    {
        public string Key { get; set; } = null!;  // sekret JWT
        public string Issuer { get; set; } = null!; // issuer tokena
        public string Audience { get; set; } = null!; // audience tokena
        public int AccessTokenExpirationMinutes { get; set; } // czas życia access tokena w minutach
    }
}
