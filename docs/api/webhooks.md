# Webhook API Documentation

## Overview
The MediCRM Webhook API allows you to receive real-time notifications for case-related events. This document describes how to register webhooks, handle deliveries, and verify webhook signatures.

## Authentication
All webhook endpoints require authentication. Only staff and admin users can manage webhooks.

## Endpoints

### Register Webhook
```http
POST /api/webhooks
```

Register a new webhook to receive notifications for specific events.

**Request Body:**
```typescript
{
  url: string;          // HTTPS URL to receive webhook deliveries
  secret: string;       // Secret for signature verification (32-256 chars)
  description?: string; // Optional description of the webhook
  events: string[];     // Array of event types to subscribe to
}
```

**Event Types:**
- `case.created` - When a new case is created
- `case.updated` - When case details are updated
- `case.status_changed` - When case status changes
- `case.assigned` - When case assignment changes
- `case.deleted` - When a case is deleted

**Response:**
```typescript
{
  id: string;          // Webhook ID
  url: string;         // Registered URL
  secret: string;      // Your webhook secret
  events: string[];    // Subscribed events
  created_at: string;  // Creation timestamp
}
```

### List Webhooks
```http
GET /api/webhooks
```

Retrieve all webhooks registered by the authenticated user.

**Response:**
```typescript
[
  {
    id: string;
    url: string;
    events: string[];
    created_at: string;
    last_triggered_at?: string;
    is_active: boolean;
  }
]
```

### Delete Webhook
```http
DELETE /api/webhooks?id={webhook_id}
```

Delete a registered webhook.

### Test Webhook
```http
POST /api/webhooks/test?id={webhook_id}
```

Send a test payload to verify webhook configuration.

**Request Body:**
```typescript
{
  event: string;       // Event type to test
  data?: Record<string, unknown>; // Optional test data
}
```

## Webhook Deliveries

### Payload Format
Each webhook delivery includes:
```typescript
{
  id: string;          // Unique delivery ID
  event: string;       // Event type
  timestamp: string;   // ISO 8601 timestamp
  data: {             // Event-specific data
    case_id: string;
    [key: string]: unknown;
  }
}
```

### Security

#### Signature Verification
Each delivery includes these headers:
- `x-medicrm-signature`: HMAC SHA-256 signature
- `x-medicrm-timestamp`: Unix timestamp of delivery

To verify the signature:
```typescript
const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
const expectedSignature = createHmac('sha256', webhookSecret)
  .update(signaturePayload)
  .digest('hex');
```

#### Best Practices
1. Always verify signatures
2. Validate timestamp is within 5 minutes
3. Process webhooks asynchronously
4. Return 2xx status quickly
5. Implement idempotency checks

### Rate Limiting
- 60 requests per minute per webhook URL
- Exponential backoff on failures
- Automatic deactivation after 10 consecutive failures

### Example Implementation

```typescript
import { createHmac } from 'crypto';

function verifyWebhook(
  payload: unknown,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  // Verify timestamp is within 5 minutes
  const timestampNum = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNum) > 300) {
    return false;
  }

  // Verify signature
  const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');
  
  return expectedSignature === signature;
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Invalid request
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Webhook not found
- `429` - Rate limit exceeded
- `500` - Server error

### Error Response Format
```typescript
{
  error: string;
  details?: unknown;
}
``` 