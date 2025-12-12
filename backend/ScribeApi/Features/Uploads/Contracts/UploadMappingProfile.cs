using AutoMapper;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Uploads.Contracts;

public class UploadMappingProfile : Profile
{
    public UploadMappingProfile()
    {
        CreateMap<UploadSession, UploadSessionStatusResponse>()
            .ForCtorParam("Status", opt => opt.MapFrom(src => src.Status.ToString()));
    }
}
