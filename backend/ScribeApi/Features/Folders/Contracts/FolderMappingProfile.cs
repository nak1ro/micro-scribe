using AutoMapper;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Folders.Contracts;

public class FolderMappingProfile : Profile
{
    public FolderMappingProfile()
    {
        CreateMap<Folder, FolderDto>()
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.FolderTranscriptionJobs.Count));

        CreateMap<Folder, FolderSummaryDto>();
    }
}
