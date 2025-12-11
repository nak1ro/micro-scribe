# Subscription Feature

Subscription and billing management.

## Route: `/dashboard/subscription`

Subscription management, plan upgrades, and billing information.
**Access**: Protected (requires authentication)

## Components To Build

- **CurrentPlanCard** - Display current subscription plan
- **PlanComparisonTable** - Compare Free vs Pro features
- **UpgradeButton** - Upgrade to Pro plan CTA
- **UsageStats** - Current month usage statistics
- **UsageProgress** - Visual progress bars for limits
- **BillingHistory** - Past invoices (future)
- **PaymentMethodSection** - Payment method management (future)

## Features

- View current subscription plan
- See usage against plan limits
- Upgrade to Pro plan
- View billing history (future with Stripe)
- Manage payment methods (future with Stripe)
