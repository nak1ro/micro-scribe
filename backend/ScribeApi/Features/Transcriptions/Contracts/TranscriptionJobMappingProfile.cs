using AutoMapper;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Contracts;

public class TranscriptionJobMappingProfile : Profile
{
    public TranscriptionJobMappingProfile()
    {
        CreateMap<TranscriptionJob, TranscriptionJobResponse>()
            .ForMember(dest => dest.JobId, opt => opt.MapFrom(src => src.Id));

        CreateMap<TranscriptionJob, TranscriptionJobDetailResponse>()
            .ForMember(dest => dest.JobId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.OriginalFileName, opt => opt.MapFrom(src => src.MediaFile.OriginalFileName))
            .ForMember(dest => dest.Segments, opt => opt.MapFrom(src => src.Segments))
            .ForMember(dest => dest.PresignedUrl, opt => opt.MapFrom(_ => (string?)null));

        CreateMap<TranscriptSegment, TranscriptSegmentDto>();
        CreateMap<TranscriptionSpeaker, TranscriptionSpeakerDto>();
    }
}
