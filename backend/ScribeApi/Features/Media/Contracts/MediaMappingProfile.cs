using AutoMapper;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media.Contracts;

public class MediaMappingProfile : Profile
{
    public MediaMappingProfile()
    {
        CreateMap<MediaFile, MediaFileDto>()
            .ForMember(dest => dest.AudioPath, opt => opt.MapFrom(src => src.NormalizedAudioObjectKey))
            .ForMember(dest => dest.PresignedUrl, opt => opt.MapFrom(_ => (string?)null));
    }
}
