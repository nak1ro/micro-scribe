using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ScribeApi.Core.Exceptions;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Services;

public class TranscriptEditService : ITranscriptEditService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public TranscriptEditService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TranscriptSegmentDto> UpdateSegmentAsync(
        Guid jobId,
        Guid segmentId,
        string userId,
        UpdateSegmentRequest request,
        CancellationToken ct)
    {
        var segment = await GetSegmentWithAccessCheckAsync(jobId, segmentId, userId, ct);

        // Store original text on first edit
        if (!segment.IsEdited)
        {
            segment.OriginalText = segment.Text;
        }

        segment.Text = request.Text;
        segment.IsEdited = true;
        segment.LastEditedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return _mapper.Map<TranscriptSegmentDto>(segment);
    }

    public async Task<TranscriptSegmentDto> RevertSegmentAsync(
        Guid jobId,
        Guid segmentId,
        string userId,
        CancellationToken ct)
    {
        var segment = await GetSegmentWithAccessCheckAsync(jobId, segmentId, userId, ct);

        if (!segment.IsEdited || segment.OriginalText == null)
            throw new ValidationException("Segment has not been edited.");

        segment.Text = segment.OriginalText;
        segment.OriginalText = null;
        segment.IsEdited = false;
        segment.LastEditedAtUtc = null;

        await _context.SaveChangesAsync(ct);

        return _mapper.Map<TranscriptSegmentDto>(segment);
    }

    private async Task<TranscriptSegment> GetSegmentWithAccessCheckAsync(
        Guid jobId,
        Guid segmentId,
        string userId,
        CancellationToken ct)
    {
        var segment = await _context.TranscriptSegments
            .Include(s => s.TranscriptionJob)
            .FirstOrDefaultAsync(s => s.Id == segmentId && s.TranscriptionJobId == jobId, ct);

        if (segment == null)
            throw new NotFoundException("Segment not found.");

        if (segment.TranscriptionJob.UserId != userId)
            throw new NotFoundException("Segment not found.");

        if (segment.TranscriptionJob.Status != TranscriptionJobStatus.Completed)
            throw new ValidationException("Cannot edit: transcription is not completed.");

        return segment;
    }
}
