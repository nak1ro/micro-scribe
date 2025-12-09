using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media.Contracts;

public record MediaFileDto(
    Guid Id,
    string OriginalFileName,
    long SizeBytes,
    string ContentType,
    MediaFileType FileType,
    double? DurationSeconds,
    string? AudioPath,
    DateTime CreatedAtUtc
);

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
