---
trigger: manual
---

Stripe Elements Integration Guide
Overview
This guide explains how to integrate Stripe Elements for in-app payment collection. The backend uses SetupIntent flow instead of Checkout Sessions.

1. Get Stripe Config
Fetch the publishable key on app init.

GET /api/billing/config
{ "publishableKey": "pk_test_..." }
2. Create SetupIntent
When user opens the payment modal, create a SetupIntent.

POST /api/billing/setup-intent
Request:

{ "interval": "Monthly" }
Response:

{ "clientSecret": "seti_..." }
3. Render Payment Form
Use the clientSecret with Stripe Elements:

import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_test_...');
function CheckoutForm({ clientSecret, interval }) {
  const stripe = useStripe();
  const elements = useElements();
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required'
    });
    
    if (error) {
      console.error(error);
      return;
    }
    
    // Call backend to create subscription
    await fetch('/api/billing/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: setupIntent.payment_method,
        interval: interval
      })
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Subscribe</button>
    </form>
  );
}
function PaymentModal({ clientSecret, interval }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} interval={interval} />
    </Elements>
  );
}
4. Confirm Subscription
After confirmSetup succeeds, create the subscription.

POST /api/billing/subscribe
Request:

{
  "paymentMethodId": "pm_...",
  "interval": "Yearly"
}
Response:

{
  "subscriptionId": "sub_...",
  "status": "active"
}
5. Manage Subscription
Redirect to Stripe Billing Portal for cancellation/updates.

POST /api/billing/portal
Query Params: ?returnUrl=https://yourapp.com/settings

Response:

{ "url": "https://billing.stripe.com/..." }
6. Check Status
Get current subscription state.

GET /api/billing/subscription
{
  "plan": 1,
  "status": 0,
  "currentPeriodEnd": "2025-01-28T00:00:00Z",
  "cancelAtPeriodEnd": false
}
Plan	Value
Free	0
Pro	1
Status	Value
Active	0
Canceled	1
PastDue	2