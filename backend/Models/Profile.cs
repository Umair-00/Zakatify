using Postgrest.Attributes;
using Postgrest.Models;

namespace ZakatifyApi.Models
{
    [Table("profiles")]
    public class Profile : BaseModel
    {
        [PrimaryKey("id", false)]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Column("country")]
        public string Country { get; set; } = string.Empty;

        [Column("currency")]
        public string Currency { get; set; } = "USD";

        [Column("nisab_basis")]
        public string NisabBasis { get; set; } = "silver";

        [Column("calendar_type")]
        public string CalendarType { get; set; } = "lunar";

        [Column("zakat_anniversary")]
        public DateTime? ZakatAnniversary { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
