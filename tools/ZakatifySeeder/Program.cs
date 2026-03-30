using System.Text.RegularExpressions;
using Npgsql;
using OpenAI.Embeddings;
using Pgvector;

// Configuration - set these before running
var openAiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY")
    ?? throw new Exception("Set OPENAI_API_KEY environment variable");
var supabaseConnectionString = Environment.GetEnvironmentVariable("SUPABASE_CONNECTION_STRING")
    ?? throw new Exception("Set SUPABASE_CONNECTION_STRING environment variable (e.g., Host=...;Port=5432;Database=postgres;Username=postgres;Password=...)");

var repoRoot = FindRepoRoot(Directory.GetCurrentDirectory());
var rulesPath = Path.Combine(repoRoot, "ZAKAT_RULES.md");
var bookPath = Path.Combine(repoRoot, "zakat_extracted.txt");

Console.WriteLine("=== Zakatify Knowledge Base Seeder ===\n");

// 1. Chunk the sources
var chunks = new List<Chunk>();

Console.WriteLine("Chunking ZAKAT_RULES.md...");
chunks.AddRange(ChunkRulesFile(rulesPath));
Console.WriteLine($"  -> {chunks.Count} chunks from rules\n");

var rulesCount = chunks.Count;
Console.WriteLine("Chunking zakat_extracted.txt...");
chunks.AddRange(ChunkBookFile(bookPath));
Console.WriteLine($"  -> {chunks.Count - rulesCount} chunks from book\n");

Console.WriteLine($"Total chunks: {chunks.Count}\n");

// 2. Generate embeddings
Console.WriteLine("Generating embeddings via OpenAI...");
var embeddingClient = new EmbeddingClient("text-embedding-3-small", openAiKey);

// Process in batches of 20
var batchSize = 20;
var embeddings = new float[chunks.Count][];

for (var i = 0; i < chunks.Count; i += batchSize)
{
    var batch = chunks.Skip(i).Take(batchSize).Select(c => c.Content).ToList();
    var result = await embeddingClient.GenerateEmbeddingsAsync(batch);

    for (var j = 0; j < result.Value.Count; j++)
    {
        embeddings[i + j] = result.Value[j].ToFloats().ToArray();
    }

    Console.WriteLine($"  Embedded {Math.Min(i + batchSize, chunks.Count)}/{chunks.Count}");
}

Console.WriteLine();

// 3. Insert into Supabase via direct PostgreSQL connection
Console.WriteLine("Inserting into database...");

var dataSourceBuilder = new NpgsqlDataSourceBuilder(supabaseConnectionString);
dataSourceBuilder.UseVector();
await using var dataSource = dataSourceBuilder.Build();
await using var conn = await dataSource.OpenConnectionAsync();

// Ensure pgvector extension
await using (var cmd = new NpgsqlCommand("CREATE EXTENSION IF NOT EXISTS vector", conn))
    await cmd.ExecuteNonQueryAsync();

// Clear existing chunks
await using (var cmd = new NpgsqlCommand("DELETE FROM zakat_chunks", conn))
{
    var deleted = await cmd.ExecuteNonQueryAsync();
    if (deleted > 0) Console.WriteLine($"  Cleared {deleted} existing chunks");
}

// Insert chunks
for (var i = 0; i < chunks.Count; i++)
{
    var chunk = chunks[i];
    var embedding = new Vector(embeddings[i]);

    await using var cmd = new NpgsqlCommand(
        @"INSERT INTO zakat_chunks (content, embedding, source, source_location, section_title, chunk_index, token_count)
          VALUES (@content, @embedding, @source, @source_location, @section_title, @chunk_index, @token_count)", conn);

    cmd.Parameters.AddWithValue("content", chunk.Content);
    cmd.Parameters.AddWithValue("embedding", embedding);
    cmd.Parameters.AddWithValue("source", chunk.Source);
    cmd.Parameters.AddWithValue("source_location", (object?)chunk.SourceLocation ?? DBNull.Value);
    cmd.Parameters.AddWithValue("section_title", (object?)chunk.SectionTitle ?? DBNull.Value);
    cmd.Parameters.AddWithValue("chunk_index", chunk.Index);
    cmd.Parameters.AddWithValue("token_count", EstimateTokens(chunk.Content));

    await cmd.ExecuteNonQueryAsync();
}

Console.WriteLine($"  Inserted {chunks.Count} chunks\n");
Console.WriteLine("Done! Knowledge base is ready.");

// ---- Helper methods ----

static string FindRepoRoot(string startDir)
{
    var dir = startDir;
    while (dir != null)
    {
        if (File.Exists(Path.Combine(dir, "ZAKAT_RULES.md")))
            return dir;
        dir = Directory.GetParent(dir)?.FullName;
    }
    throw new Exception("Could not find repo root (looking for ZAKAT_RULES.md)");
}

static int EstimateTokens(string text) => (int)(text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length * 1.3);

static List<Chunk> ChunkRulesFile(string path)
{
    var text = File.ReadAllText(path);
    var chunks = new List<Chunk>();

    // Split by ## headings (level 2)
    var sections = Regex.Split(text, @"(?=^## \d)", RegexOptions.Multiline);
    var index = 0;

    foreach (var section in sections)
    {
        var trimmed = section.Trim();
        if (string.IsNullOrWhiteSpace(trimmed) || trimmed.Length < 50)
            continue;

        // Extract section title from first line
        var firstLine = trimmed.Split('\n')[0].Trim();
        var title = Regex.Replace(firstLine, @"^#+\s*\d*\.?\s*", "").Trim();

        // If section is very large (>800 tokens), split at ### boundaries
        if (EstimateTokens(trimmed) > 800)
        {
            var subsections = Regex.Split(trimmed, @"(?=^### )", RegexOptions.Multiline);
            foreach (var sub in subsections)
            {
                var subTrimmed = sub.Trim();
                if (string.IsNullOrWhiteSpace(subTrimmed) || subTrimmed.Length < 30)
                    continue;

                var subTitle = Regex.Match(subTrimmed, @"^###?\s*(.+)$", RegexOptions.Multiline);
                chunks.Add(new Chunk
                {
                    Content = subTrimmed,
                    Source = "rules",
                    SourceLocation = $"ZAKAT_RULES.md",
                    SectionTitle = subTitle.Success ? subTitle.Groups[1].Value.Trim() : title,
                    Index = index++
                });
            }
        }
        else
        {
            chunks.Add(new Chunk
            {
                Content = trimmed,
                Source = "rules",
                SourceLocation = "ZAKAT_RULES.md",
                SectionTitle = title,
                Index = index++
            });
        }
    }

    return chunks;
}

static List<Chunk> ChunkBookFile(string path)
{
    var text = File.ReadAllText(path);
    var chunks = new List<Chunk>();
    var index = 0;

    // Split by page markers
    var pages = Regex.Split(text, @"--- PAGE (\d+) ---");

    // pages array alternates: content, page_number, content, page_number, ...
    var pageContents = new List<(int pageNum, string content)>();
    for (var i = 1; i < pages.Length - 1; i += 2)
    {
        var pageNum = int.Parse(pages[i]);
        var content = pages[i + 1].Trim();

        // Skip very short pages (headers, blank pages)
        if (content.Length > 50)
            pageContents.Add((pageNum, content));
    }

    // Skip front matter (pages 1-8) and table of contents
    var contentPages = pageContents.Where(p => p.pageNum >= 9).ToList();

    // Group consecutive pages into topic-based chunks
    var currentChunk = "";
    var currentStartPage = 0;
    var currentTitle = "";

    foreach (var (pageNum, content) in contentPages)
    {
        // Detect topic boundaries: lines that look like headings
        var headingMatch = Regex.Match(content, @"^(?:Part\s+\w+|[IVX]+\s*[-–—]\s*.+|Chapter\s+\d+|#+\s*.+)", RegexOptions.Multiline);
        var detectedTitle = headingMatch.Success ? headingMatch.Value.Trim().TrimStart('#', ' ') : "";

        // Start a new chunk if we detect a new topic heading or chunk is getting large
        if ((!string.IsNullOrEmpty(detectedTitle) && currentChunk.Length > 200) ||
            EstimateTokens(currentChunk + content) > 600)
        {
            if (currentChunk.Length > 50)
            {
                chunks.Add(new Chunk
                {
                    Content = CleanBookText(currentChunk),
                    Source = "book",
                    SourceLocation = currentStartPage == pageNum - 1
                        ? $"Page {currentStartPage}"
                        : $"Pages {currentStartPage}-{pageNum - 1}",
                    SectionTitle = string.IsNullOrEmpty(currentTitle) ? $"Page {currentStartPage}" : currentTitle,
                    Index = index++
                });
            }
            currentChunk = content;
            currentStartPage = pageNum;
            currentTitle = !string.IsNullOrEmpty(detectedTitle) ? detectedTitle : currentTitle;
        }
        else
        {
            if (string.IsNullOrEmpty(currentChunk))
                currentStartPage = pageNum;
            if (!string.IsNullOrEmpty(detectedTitle))
                currentTitle = detectedTitle;
            currentChunk += "\n\n" + content;
        }
    }

    // Don't forget the last chunk
    if (currentChunk.Length > 50)
    {
        chunks.Add(new Chunk
        {
            Content = CleanBookText(currentChunk),
            Source = "book",
            SourceLocation = $"Page {currentStartPage}+",
            SectionTitle = string.IsNullOrEmpty(currentTitle) ? $"Page {currentStartPage}" : currentTitle,
            Index = index++
        });
    }

    return chunks;
}

static string CleanBookText(string text)
{
    // Remove repeated header/footer lines from OCR
    text = Regex.Replace(text, @"^Simple Zakat Guide\s*$", "", RegexOptions.Multiline);
    // Remove standalone page numbers
    text = Regex.Replace(text, @"^\d{1,3}\s*$", "", RegexOptions.Multiline);
    // Collapse multiple blank lines
    text = Regex.Replace(text, @"\n{3,}", "\n\n");
    return text.Trim();
}

class Chunk
{
    public string Content { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string? SourceLocation { get; set; }
    public string? SectionTitle { get; set; }
    public int Index { get; set; }
}
