namespace ZakatifyApi.Models
{
    public class UpdateProfileRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public string NisabBasis { get; set; } = "silver";
        public string CalendarType { get; set; } = "lunar";
        public string? ZakatAnniversary { get; set; }
    }
}
