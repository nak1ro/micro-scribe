using Microsoft.Extensions.Options;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Common.Configuration.Plans;

public interface IPlanResolver
{
    PlanDefinition GetPlanDefinition(PlanType planType);
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
}