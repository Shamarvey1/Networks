# Node.js Backend B

Backend B component for the Computer Networks course project.

- **Role**: Member 2 (Mac 2)
- **Host IP**: `10.216.38.9`
- **Listening Port**: `3002`
- **Binding Address**: `0.0.0.0` (accessible across the local network)

---

## Getting Started

### Prerequisites
- Node.js (v18+)

### Start the Service
```bash
npm start
```
or directly with Node:
```bash
node server.js
```

The service will start on port `3002` bound to `0.0.0.0`.

---

## Endpoints

### 1. `GET /`
Returns a simple JSON payload identifying Backend B.

- **Status**: `200 OK`
- **Headers**:
  - `Content-Type: application/json`
  - `X-Backend: B`
- **Response Body**:
  ```json
  {
    "backend": "B",
    "message": "Node.js Backend B running on Mac 2"
  }
  ```

### 2. `GET /api/status`
Returns the status of Backend B with cache control.

- **Status**: `200 OK`
- **Headers**:
  - `Content-Type: application/json`
  - `X-Backend: B`
  - `Cache-Control: public, max-age=60`
- **Response Body**:
  ```json
  {
    "backend": "B",
    "status": "ok"
  }
  ```

---

## Verification & Testing

Verify local and LAN access using `curl`:

```bash
# Test root endpoint
curl -i http://localhost:3002/

# Test status endpoint and inspect headers
curl -i http://10.216.38.9:3002/api/status
```
