# Backend A

This directory contains the Node.js implementation for Backend A, running on Mac 1.

## Network Configuration

- **TCP Port:** `3001`
- **Host Binding:** `0.0.0.0`
  - *Note:* The server binds to `0.0.0.0` instead of `127.0.0.1` so that it accepts connections from any network interface. This makes it accessible over the LAN from Mac 2, which will later act as the reverse proxy for this service.

## HTTP Endpoints

Every response from Backend A explicitly includes the `X-Backend: A` HTTP header. This header proves which backend instance served the request.

### `GET /`
Returns a simple JSON response identifying the backend.

### `GET /api/status`
Returns a JSON object showing the health/status:
```json
{
  "backend": "A",
  "status": "ok"
}
```
**Headers:** Includes `Cache-Control: public, max-age=60` to enable reverse proxy caching tests during later project phases.

## How to Run

1. Navigate to this directory.
2. Start the server (no `npm install` needed since it relies entirely on Node.js built-ins):
```bash
npm start
```
