namespace ZakatifyApi.Models
{
    public class SignupRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;   // ISO 3166-1 alpha-2
        public string Currency { get; set; } = "USD";          // ISO 4217
    }
}
