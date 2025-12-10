using AutoMapper;
using ScribeApi.Features.Media.Contracts;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Contracts;

public class UploadMappingProfile : Profile
{
    public UploadMappingProfile()
    {
        CreateMap<UploadSession, UploadSessionDto>();
        CreateMap<MediaFile, MediaFileDto>();
    }
}
