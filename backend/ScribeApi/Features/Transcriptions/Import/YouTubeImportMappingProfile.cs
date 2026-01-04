using AutoMapper;
using ScribeApi.Core.Interfaces;
using ScribeApi.Features.Transcriptions.Contracts;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Transcriptions.Import;

public class YouTubeImportMappingProfile : Profile
{
    public YouTubeImportMappingProfile()
    {
        // Don't modify this map from ApplicationUser -> Job DTO unless needed
        // Here we map from YouTube data to Entities
        
        // This mapping logic is likely handled manually in the service due to complex dependencies (User ID, etc.)
        // But keeping the file as per architectural pattern rules.
        
        // Example: If we had a YouTubeVideoDetails -> MediaFile map
        /*
        CreateMap<YouTubeVideoDetails, MediaFile>()
            .ForMember(d => d.OriginalFileName, opt => opt.MapFrom(s => s.Title))
            .ForMember(d => d.DurationSeconds, opt => opt.MapFrom(s => s.Duration.TotalSeconds));
        */
    }
}
