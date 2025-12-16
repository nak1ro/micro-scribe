using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media.Contracts;

public class MediaFileDto
{
    public Guid Id { get; init; }
    public string OriginalFileName { get; init; } = string.Empty;
    public long SizeBytes { get; init; }
    public string ContentType { get; init; } = string.Empty;
    public MediaFileType FileType { get; init; }
    public double? DurationSeconds { get; init; }
    public string? AudioPath { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string? PresignedUrl { get; set; }
}

public class PagedResponse<T>
{
    public IEnumerable<T> Items { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    public PagedResponse(IEnumerable<T> items, int page, int pageSize, int totalCount)
    {
        Items = items;
        Page = page;
        PageSize = pageSize;
        TotalCount = totalCount;
    }
}

public record MediaListRequest(
    int Page = 1,
    int PageSize = 10
);
