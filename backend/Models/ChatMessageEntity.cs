using Postgrest.Attributes;
using Postgrest.Models;

namespace ZakatifyApi.Models
{
    [Table("chat_messages")]
    public class ChatMessageEntity : BaseModel
    {
        [PrimaryKey("id", false)]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Column("conversation_id")]
        public string ConversationId { get; set; } = string.Empty;

        [Column("role")]
        public string Role { get; set; } = string.Empty;

        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("sources")]
        public string? Sources { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }
    }
}
