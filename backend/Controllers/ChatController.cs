using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ZakatifyApi.Models;
using ZakatifyApi.Services;

namespace ZakatifyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ChatService _chatService;

        public ChatController(ChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost("ask")]
        [EnableRateLimiting("chat-ask")]
        public async Task<ActionResult<ChatResponse>> Ask([FromBody] ChatRequest request)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Ok(new ChatResponse { Success = false, Message = "Unauthorized" });

            var message = request.Message?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(message))
                return Ok(new ChatResponse { Success = false, Message = "Message is required." });

            if (message.Length > 1000)
                return Ok(new ChatResponse { Success = false, Message = "Message must be 1000 characters or less." });

            try
            {
                // Resolve or create conversation
                string conversationId;
                string? conversationTitle;
                List<ChatMessageEntity>? history = null;

                if (!string.IsNullOrEmpty(request.ConversationId))
                {
                    var existing = await _chatService.GetConversationAsync(request.ConversationId, userId);
                    if (existing == null)
                        return Ok(new ChatResponse { Success = false, Message = "Conversation not found." });

                    conversationId = existing.Id;
                    conversationTitle = existing.Title;
                    history = await _chatService.GetMessagesAsync(conversationId);
                }
                else
                {
                    var conversation = await _chatService.CreateConversationAsync(userId, message);
                    conversationId = conversation.Id;
                    conversationTitle = conversation.Title;
                }

                // RAG pipeline: embed → search → generate
                var embedding = await _chatService.EmbedQueryAsync(message);
                var chunks = await _chatService.FindRelevantChunksAsync(embedding);
                var answer = await _chatService.GenerateAnswerAsync(message, chunks, history);

                // Build sources for response
                var sources = chunks.Select(c => new ChatSourceDto
                {
                    SectionTitle = c.SectionTitle,
                    SourceLocation = c.SourceLocation,
                    Source = c.Source
                }).ToList();

                // Save both messages
                await _chatService.SaveMessageAsync(conversationId, "user", message);
                await _chatService.SaveMessageAsync(conversationId, "assistant", answer, sources);

                return Ok(new ChatResponse
                {
                    Success = true,
                    Message = "Response generated",
                    ConversationId = conversationId,
                    ConversationTitle = conversationTitle,
                    Answer = answer,
                    Sources = sources
                });
            }
            catch (Exception)
            {
                return Ok(new ChatResponse
                {
                    Success = false,
                    Message = "Failed to generate response. Please try again."
                });
            }
        }

        [HttpGet("conversations")]
        [EnableRateLimiting("chat-list")]
        public async Task<ActionResult<ConversationListResponse>> GetConversations()
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Ok(new ConversationListResponse { Success = false, Message = "Unauthorized" });

            try
            {
                var conversations = await _chatService.GetConversationsAsync(userId);
                return Ok(new ConversationListResponse
                {
                    Success = true,
                    Message = "Conversations retrieved",
                    Conversations = conversations.Select(c => new ConversationSummary
                    {
                        Id = c.Id,
                        Title = c.Title,
                        CreatedAt = c.CreatedAt.ToString("o"),
                        UpdatedAt = c.UpdatedAt.ToString("o")
                    }).ToList()
                });
            }
            catch (Exception)
            {
                return Ok(new ConversationListResponse { Success = false, Message = "Failed to load conversations." });
            }
        }

        [HttpGet("conversations/{id}")]
        [EnableRateLimiting("chat-list")]
        public async Task<ActionResult<ConversationDetailResponse>> GetConversation(string id)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Ok(new ConversationDetailResponse { Success = false, Message = "Unauthorized" });

            try
            {
                var conversation = await _chatService.GetConversationAsync(id, userId);
                if (conversation == null)
                    return Ok(new ConversationDetailResponse { Success = false, Message = "Conversation not found." });

                var messages = await _chatService.GetMessagesAsync(id);

                return Ok(new ConversationDetailResponse
                {
                    Success = true,
                    Message = "Conversation retrieved",
                    Id = conversation.Id,
                    Title = conversation.Title,
                    Messages = messages.Select(m => new ChatMessageDto
                    {
                        Role = m.Role,
                        Content = m.Content,
                        CreatedAt = m.CreatedAt.ToString("o")
                    }).ToList()
                });
            }
            catch (Exception)
            {
                return Ok(new ConversationDetailResponse { Success = false, Message = "Failed to load conversation." });
            }
        }

        [HttpDelete("conversations/{id}")]
        [EnableRateLimiting("chat-list")]
        public async Task<ActionResult<ChatResponse>> DeleteConversation(string id)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Ok(new ChatResponse { Success = false, Message = "Unauthorized" });

            try
            {
                await _chatService.DeleteConversationAsync(id, userId);
                return Ok(new ChatResponse { Success = true, Message = "Conversation deleted" });
            }
            catch (Exception)
            {
                return Ok(new ChatResponse { Success = false, Message = "Failed to delete conversation." });
            }
        }
    }
}
