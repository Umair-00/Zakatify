namespace ZakatifyApi.Models
{
    public class ChatResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? ConversationId { get; set; }
        public string? ConversationTitle { get; set; }
        public string? Answer { get; set; }
        public List<ChatSourceDto>? Sources { get; set; }
    }

    public class ChatSourceDto
    {
        public string? SectionTitle { get; set; }
        public string? SourceLocation { get; set; }
        public string? Source { get; set; }
    }
}
