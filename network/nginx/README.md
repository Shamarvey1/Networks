# NGINX Reverse Proxy and Load Balancer

Configuration for the NGINX edge component in the Computer Networks project.

- **Role**: Member 2 (Mac 2)
- **Mac 2 / Edge IP**: `10.216.38.9`
- **Port**: `80` (HTTP entry point)
- **Target Backends**:
  - **Backend A**: `10.216.38.155:3001` (Mac 1)
  - **Backend B**: `10.216.38.9:3002` (Mac 2)

---

## 1. Core Architecture Concepts

### Reverse Proxy
A **reverse proxy** sits between external clients and internal backend application servers. Instead of clients contacting backend servers directly, clients send requests to the reverse proxy (Mac 2 on `10.216.38.9`), which then forwards (proxies) the request to an appropriate backend server and returns the server's response back to the client.

### Upstream
The `upstream node_backends` block groups our Node.js backends into a logical pool:
```nginx
upstream node_backends {
    server 10.216.38.155:3001; # Backend A on Mac 1
    server 10.216.38.9:3002;    # Backend B on Mac 2
}
```
NGINX uses this block as the destination for `proxy_pass http://node_backends;`.

### Round-Robin Load Balancing
NGINX applies **Round-Robin** scheduling by default when no specific algorithm directive is specified. It distributes incoming requests sequentially across the upstream servers:
- Request 1 → Backend A (`10.216.38.155:3001`)
- Request 2 → Backend B (`10.216.38.9:3002`)
- Request 3 → Backend A (`10.216.38.155:3001`)
- Request 4 → Backend B (`10.216.38.9:3002`)

---

## 2. Request Flow

```
Client (Browser / curl)
        |
        | 1. HTTP GET http://10.216.38.9/
        v
Mac 2 / NGINX Edge (10.216.38.9:80)
        |
        +---- (Round-Robin alternating proxy pass) ----+
        |                                             |
        v (Request 1, 3, ...)                         v (Request 2, 4, ...)
Backend A (Mac 1)                             Backend B (Mac 2)
10.216.38.155:3001                            10.216.38.9:3002
Response Header:                              Response Header:
  X-Backend: A                                  X-Backend: B
        |                                             |
        +----------------------+----------------------+
                               |
                               | 2. Passes response through
                               v
                   Client receives response
                   Header: X-Backend: A or B
```

---

## 3. Headers Forwarding and Preservation

1. **Client Identity Forwarding**:
   - `Host`: Forwards the original HTTP host header.
   - `X-Real-IP`: Passes the client's direct IP address.
   - `X-Forwarded-For`: Tracks the chain of client and intermediate proxy IP addresses.
   - `X-Forwarded-Proto`: Records the protocol used by the client (`http`).
   - `X-Forwarded-Host`: Records the original host requested by the client.
   - `X-Forwarded-Port`: Records the port used by the client.

2. **Preservation of `X-Backend`**:
   - `proxy_pass_header X-Backend;` ensures NGINX passes through the custom `X-Backend` header from each Node.js backend.
   - This lets clients verify whether Backend A or Backend B handled the request.

---

## 4. How to Test Using `curl`

Once NGINX is started in future phases, the following commands can be used to verify the setup:

### Test the Edge Proxy (Port 80)
```bash
# Request 1 (Inspect headers for X-Backend)
curl -i http://10.216.38.9/

# Request 2 (Subsequent request to verify alternation)
curl -i http://10.216.38.9/

# Test the status endpoint through the edge
curl -i http://10.216.38.9/api/status
```

### Expected `X-Backend` Results
When sending repeated requests to `http://10.216.38.9/`:

- **First response headers**:
  ```http
  HTTP/1.1 200 OK
  Server: nginx
  Content-Type: application/json
  X-Backend: A
  ```
- **Second response headers**:
  ```http
  HTTP/1.1 200 OK
  Server: nginx
  Content-Type: application/json
  X-Backend: B
  ```

### Direct Backend Verification
Both backends remain directly reachable for diagnostics:
```bash
# Test Backend A directly on Mac 1
curl -i http://10.216.38.155:3001/api/status

# Test Backend B directly on Mac 2
curl -i http://10.216.38.9:3002/api/status
```

---

## 5. Implementation Status

- **TLS / HTTPS**: Not configured yet (deferred to subsequent phase).
- **Certificates**: None created.
- **DNS**: Unchanged.
- **Process State**: NGINX is **not started** in this phase.
- **Syntax Check**: Validated via `nginx -t -c network/nginx/nginx.conf`.
