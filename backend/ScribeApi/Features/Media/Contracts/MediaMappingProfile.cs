using AutoMapper;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media.Contracts;

public class MediaMappingProfile : Profile
{
    public MediaMappingProfile()
    {
        CreateMap<MediaFile, MediaFileDto>()
            .ForCtorParam("AudioPath", opt => opt.MapFrom(src => src.NormalizedAudioObjectKey));
    }
}
