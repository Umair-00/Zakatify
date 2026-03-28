namespace ZakatifyApi.Models
{
    public class ProfileResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Country { get; set; }
        public string? Currency { get; set; }
        public string? NisabBasis { get; set; }
        public string? CalendarType { get; set; }
        public string? ZakatAnniversary { get; set; }
    }
}
