namespace ScribeApi.Api.Filters;

// Marker attribute to skip the automatic transaction filter for specific actions
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true)]
public sealed class SkipTransactionAttribute : Attribute;
