using Microsoft.Extensions.Options;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Core.Domain.Plans;

public interface IPlanResolver
{
    PlanDefinition GetPlanDefinition(PlanType planType);
    string GetQueueName(PlanDefinition plan);
}

public class PlanResolver : IPlanResolver
{
    private readonly Dictionary<PlanType, PlanDefinition> _plans;

    public PlanResolver(IOptions<PlansOptions> options)
    {
        _plans = options.Value.Plans.ToDictionary(p => p.PlanType);
    }

    public PlanDefinition GetPlanDefinition(PlanType planType)
        => _plans[planType];

    public string GetQueueName(PlanDefinition plan)
    {
        return plan.TranscriptionJobPriority ? "priority" : "default";
    }
}