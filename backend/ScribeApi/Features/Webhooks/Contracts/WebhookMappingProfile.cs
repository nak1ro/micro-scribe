using AutoMapper;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Webhooks.Contracts;

public class WebhookMappingProfile : Profile
{
    public WebhookMappingProfile()
    {
        CreateMap<WebhookSubscription, WebhookSubscriptionDto>();
        CreateMap<WebhookDelivery, WebhookDeliveryDto>();
    }
}
