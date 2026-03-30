using Postgrest.Attributes;
using Postgrest.Models;

namespace ZakatifyApi.Models
{
    [Table("chat_conversations")]
    public class ChatConversation : BaseModel
    {
        [PrimaryKey("id", false)]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Column("title")]
        public string? Title { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
