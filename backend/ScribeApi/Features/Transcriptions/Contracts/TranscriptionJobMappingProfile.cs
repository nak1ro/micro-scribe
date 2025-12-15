using AutoMapper;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts;

public class TranscriptionJobMappingProfile : Profile
{
    public TranscriptionJobMappingProfile()
    {
        CreateMap<TranscriptionJob, TranscriptionJobResponse>()
            .ForCtorParam("JobId", opt => opt.MapFrom(src => src.Id));

        CreateMap<TranscriptionJob, TranscriptionJobDetailResponse>()
            .ForCtorParam("JobId", opt => opt.MapFrom(src => src.Id))
            .ForCtorParam("OriginalFileName", opt => opt.MapFrom(src => src.MediaFile.OriginalFileName))
            .ForCtorParam("Segments", opt => opt.MapFrom(src => src.Segments));

        CreateMap<TranscriptSegment, TranscriptSegmentDto>();
    }
}
