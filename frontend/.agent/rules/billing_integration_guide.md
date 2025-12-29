---
trigger: manual
---

# Stripe Billing Integration Guide

## Overview
This guide details how to integrate the Scribe Pro subscription flow (Stripe) into the frontend. The backend supports two billing intervals: **Monthly** and **Yearly**.

## 1. Configuration
Before making requests, fetch the Stripe Publishable Key.

### `GET /api/billing/config`
**Response:**
```json
{
  "publishableKey": "pk_test_..."
}
```
*Use this key to initialize `loadStripe`.*

---

## 2. Starting Checkout
When the user clicks "Subscribe", call this endpoint. You must specify the selected billing interval.

### `POST /api/billing/checkout`
**Request Body:**
```json
{
  "interval": "Monthly", // or "Yearly"
  "successUrl": "https://your-app.com/dashboard?checkout=success", // Optional override
  "cancelUrl": "https://your-app.com/dashboard?checkout=canceled"  // Optional override
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Frontend Action:**
Redirect the user to the `url` returned in the response.

---

## 3. Managing Subscriptions
For users who are already subscribed, provide a "Manage Subscription" button.

### `POST /api/billing/portal`
**Request Body:**
```json
{
  "returnUrl": "https://your-app.com/dashboard" // User returns here after portal
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

**Frontend Action:**
Redirect the user to the `url`.

---

## 4. Checking Status
To determine if a user has access to Pro features and what plan they are on.

### `GET /api/billing/subscription`
**Response:**
```json
{
  "plan": 1, // 0 = Free, 1 = Pro
  "status": 0, // 0 = Active, 1 = Canceled, etc.
  "currentPeriodEnd": "2025-12-31T23:59:59Z",
  "cancelAtPeriodEnd": false
}
```

## UI Guidelines
1.  **Toggle Switch**: Add a UI toggle for "Monthly ($10)" vs "Yearly ($100)".
2.  **Visual Feedback**:
    *   Show "Save 20%" (or similar) when Yearly is selected.
    *   Update the price display dynamically based on the toggle.
3.  **State Management**: Store the selected `interval` state (`Monthly` | `Yearly`) and pass it to the checkout API.
