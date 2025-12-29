---
trigger: manual
---

Billing API - Frontend Integration Guide
Base URL
/api/billing

Endpoints
1. Get Stripe Config
GET /config
Response: { "publishableKey": "pk_test_..." }

2. Create Setup Intent (Start Payment Flow)
POST /setup-intent
Body: { "interval": "Monthly" | "Yearly" }
Response: { "clientSecret": "seti_xxx_secret_xxx" }

3. Confirm Subscription (After Payment)
POST /subscribe
Body: { "paymentMethodId": "pm_xxx", "interval": "Monthly" | "Yearly" }
Response: { "subscriptionId": "sub_xxx", "status": "active" }

4. Get Subscription Status
GET /subscription
Response:

{
  "plan": "Free" | "Pro",
  "status": "Active" | "Canceled" | "PastDue" | "Incomplete",
  "currentPeriodEnd": "2025-01-29T00:00:00Z",
  "cancelAtPeriodEnd": false
}
5. Change Plan (NEW)
PUT /subscription
Body: { "newInterval": "Monthly" | "Yearly" }
Response: { "subscriptionId": "sub_xxx", "status": "active" }

Proration is applied automatically by Stripe.

6. Cancel Subscription (NEW)
DELETE /subscription?cancelImmediately=false
cancelImmediately=false → Cancels at period end (default)
cancelImmediately=true → Cancels immediately
Response: { "message": "Subscription will cancel at period end" }

7. Billing Portal
POST /portal?returnUrl=/settings
Response: { "url": "https://billing.stripe.com/..." }

Opens Stripe's hosted portal for payment method management.