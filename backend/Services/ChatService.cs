using System.Text.Json;
using Anthropic.SDK;
using Anthropic.SDK.Messaging;
using OpenAI.Embeddings;
using Supabase;
using ZakatifyApi.Models;

namespace ZakatifyApi.Services
{
    public class ChatService
    {
        private readonly AnthropicClient _anthropic;
        private readonly EmbeddingClient _embeddingClient;
        private readonly Supabase.Client _supabaseAdmin;

        private const string ChatModel = "claude-haiku-4-5-20251001";
        private const string EmbeddingModel = "text-embedding-3-small";
        private const int MaxHistoryMessages = 10;
        private const int MaxChunks = 5;

        private const string SystemPrompt = @"You are the Zakatify Scholar Assistant, an AI helper that answers questions about zakat (Islamic almsgiving) based exclusively on Joe Bradford's ""Simple Zakat Guide"" (3rd Edition, 2022).

RULES:
1. Only answer questions related to zakat, Islamic finance, and charitable giving.
2. Base your answers EXCLUSIVELY on the provided reference material. Do not invent rules or cite sources not provided.
3. If the reference material does not contain enough information to answer, say so clearly and suggest the user consult a qualified scholar.
4. When citing rules, reference the specific section from the book.
5. Use clear, accessible language. Define technical terms when you use them.
6. For calculation questions, show the formula and a worked example when possible.
7. Be respectful of the religious context. Zakat is an obligatory pillar of Islam.
8. If asked about topics outside zakat, politely redirect to zakat-related topics only.
9. Format responses with markdown for readability (headers, bullet points, bold for key terms). Use h2 (##) as the largest heading, never h1.
10. Keep answers concise but thorough. Aim for clarity over length.
11. Do NOT use emojis in your responses. Use plain text only.

IMPORTANT DISCLAIMER: You are a calculation assistant, not a replacement for a qualified Islamic scholar. For complex personal situations, always recommend consulting a scholar.";

        public ChatService(IConfiguration configuration)
        {
            var anthropicKey = configuration["Anthropic:ApiKey"]
                ?? throw new ArgumentNullException("Anthropic:ApiKey");
            var openaiKey = configuration["OpenAI:ApiKey"]
                ?? throw new ArgumentNullException("OpenAI:ApiKey");
            var supabaseUrl = configuration["Supabase:Url"]
                ?? throw new ArgumentNullException("Supabase:Url");
            var serviceKey = configuration["Supabase:ServiceRoleKey"];

            _anthropic = new AnthropicClient(anthropicKey);
            _embeddingClient = new EmbeddingClient(EmbeddingModel, openaiKey);
            _supabaseAdmin = new Supabase.Client(supabaseUrl, serviceKey, new SupabaseOptions());
        }

        public async Task<float[]> EmbedQueryAsync(string query)
        {
            var result = await _embeddingClient.GenerateEmbeddingAsync(query);
            return result.Value.ToFloats().ToArray();
        }

        public async Task<List<ChunkResult>> FindRelevantChunksAsync(float[] embedding)
        {
            var embeddingJson = "[" + string.Join(",", embedding) + "]";

            var response = await _supabaseAdmin.Rpc("match_zakat_chunks", new Dictionary<string, object>
            {
                { "query_embedding", embeddingJson },
                { "match_threshold", 0.5 },
                { "match_count", MaxChunks }
            });

            var content = response.Content;
            if (string.IsNullOrEmpty(content))
                return new List<ChunkResult>();

            var chunks = JsonSerializer.Deserialize<List<ChunkResult>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return chunks ?? new List<ChunkResult>();
        }

        public async Task<string> GenerateAnswerAsync(
            string question,
            List<ChunkResult> chunks,
            List<ChatMessageEntity>? history)
        {
            var contextText = string.Join("\n---\n", chunks.Select(c =>
                $"[Section: {c.SectionTitle}] (Source: {c.Source}, {c.SourceLocation})\n{c.Content}"));

            var messages = new List<Message>();

            // Add conversation history
            if (history != null)
            {
                foreach (var msg in history.TakeLast(MaxHistoryMessages))
                {
                    messages.Add(new Message(
                        msg.Role == "user" ? RoleType.User : RoleType.Assistant,
                        msg.Content));
                }
            }

            // Build the current user message with context
            var userMessage = $@"REFERENCE MATERIAL:
---
{contextText}
---

USER QUESTION: {question}";

            messages.Add(new Message(RoleType.User, userMessage));

            var parameters = new MessageParameters
            {
                Model = ChatModel,
                MaxTokens = 1024,
                SystemMessage = SystemPrompt,
                Messages = messages
            };

            var response = await _anthropic.Messages.GetClaudeMessageAsync(parameters);

            return response.Content
                .OfType<TextContent>()
                .FirstOrDefault()?.Text ?? "I was unable to generate a response. Please try again.";
        }

        public async Task<ChatConversation> CreateConversationAsync(string userId, string title)
        {
            var conversation = new ChatConversation
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                Title = title.Length > 80 ? title[..80] + "..." : title
            };

            await _supabaseAdmin.From<ChatConversation>().Insert(conversation);
            return conversation;
        }

        public async Task SaveMessageAsync(
            string conversationId,
            string role,
            string content,
            List<ChatSourceDto>? sources = null)
        {
            var message = new ChatMessageEntity
            {
                Id = Guid.NewGuid().ToString(),
                ConversationId = conversationId,
                Role = role,
                Content = content,
                Sources = sources != null ? JsonSerializer.Serialize(sources) : null
            };

            await _supabaseAdmin.From<ChatMessageEntity>().Insert(message);
        }

        public async Task<List<ChatConversation>> GetConversationsAsync(string userId)
        {
            var response = await _supabaseAdmin.From<ChatConversation>()
                .Where(c => c.UserId == userId)
                .Order(c => c.UpdatedAt, Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }

        public async Task<ChatConversation?> GetConversationAsync(string conversationId, string userId)
        {
            return await _supabaseAdmin.From<ChatConversation>()
                .Where(c => c.Id == conversationId && c.UserId == userId)
                .Single();
        }

        public async Task<List<ChatMessageEntity>> GetMessagesAsync(string conversationId)
        {
            var response = await _supabaseAdmin.From<ChatMessageEntity>()
                .Where(m => m.ConversationId == conversationId)
                .Order(m => m.CreatedAt, Postgrest.Constants.Ordering.Ascending)
                .Get();

            return response.Models;
        }

        public async Task DeleteConversationAsync(string conversationId, string userId)
        {
            await _supabaseAdmin.From<ChatConversation>()
                .Where(c => c.Id == conversationId && c.UserId == userId)
                .Delete();
        }
    }

    public class ChunkResult
    {
        public string Id { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string? SourceLocation { get; set; }
        public string? SectionTitle { get; set; }
        public float Similarity { get; set; }
    }
}
