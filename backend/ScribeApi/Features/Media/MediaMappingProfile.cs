using AutoMapper;
using ScribeApi.Features.Media;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Media;

public class MediaMappingProfile : Profile
{
    public MediaMappingProfile()
    {
        CreateMap<MediaFile, MediaFileDto>();
    }
}
