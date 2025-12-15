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
        var (job, segment) = await GetJobAndSegmentWithAccessCheckAsync(jobId, segmentId, userId, ct);

        // Store original text on first edit
        if (!segment.IsEdited)
        {
            segment.OriginalText = segment.Text;
        }

        segment.Text = request.Text;
        segment.IsEdited = true;
        segment.LastEditedAtUtc = DateTime.UtcNow;

        // Force EF to detect change in JSON column
        _context.Entry(job).Property(x => x.Segments).IsModified = true;
        
        await _context.SaveChangesAsync(ct);

        return _mapper.Map<TranscriptSegmentDto>(segment);
    }

    public async Task<TranscriptSegmentDto> RevertSegmentAsync(
        Guid jobId,
        Guid segmentId,
        string userId,
        CancellationToken ct)
    {
        var (job, segment) = await GetJobAndSegmentWithAccessCheckAsync(jobId, segmentId, userId, ct);

        if (!segment.IsEdited || segment.OriginalText == null)
            throw new ValidationException("Segment has not been edited.");

        segment.Text = segment.OriginalText;
        segment.OriginalText = null;
        segment.IsEdited = false;
        segment.LastEditedAtUtc = null;

        // Force EF to detect change in JSON column
        _context.Entry(job).Property(x => x.Segments).IsModified = true;

        await _context.SaveChangesAsync(ct);

        return _mapper.Map<TranscriptSegmentDto>(segment);
    }

    private async Task<(TranscriptionJob Job, TranscriptSegment Segment)> GetJobAndSegmentWithAccessCheckAsync(
        Guid jobId,
        Guid segmentId,
        string userId,
        CancellationToken ct)
    {
        var job = await _context.TranscriptionJobs
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);

        if (job == null)
            throw new NotFoundException("Transcription job not found.");

        if (job.UserId != userId)
            throw new NotFoundException("Transcription job not found.");

        if (job.Status != TranscriptionJobStatus.Completed)
            throw new ValidationException("Cannot edit: transcription is not completed.");

        var segment = job.Segments.FirstOrDefault(s => s.Id == segmentId);
        if (segment == null)
            throw new NotFoundException("Segment not found.");

        return (job, segment);
    }
}
