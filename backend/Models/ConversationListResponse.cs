namespace ZakatifyApi.Models
{
    public class ConversationListResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<ConversationSummary> Conversations { get; set; } = new();
    }

    public class ConversationSummary
    {
        public string Id { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;
    }

    public class ConversationDetailResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Id { get; set; }
        public string? Title { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = new();
    }

    public class ChatMessageDto
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }
}
