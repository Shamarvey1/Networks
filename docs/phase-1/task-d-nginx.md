# Task D: NGINX Reverse Proxy and Load Balancer Implementation

**Course Project**: Computer Networks  
**Role**: Member 2 (Mac 2)  
**Edge / Mac 2 IP**: `10.216.38.9`  
**Target Backends**:
- **Backend A**: `10.216.38.155:3001` (Mac 1 / Member 1)
- **Backend B**: `10.216.38.9:3002` (Mac 2 / Member 2)

---

## 1. Overview & Objective

In this task, we prepare and document the configuration structure for the **NGINX Edge Component** running on Mac 2.

In our multi-machine network architecture, NGINX acts as:
1. **A Reverse Proxy**: The single public entry point for client HTTP traffic, decoupling clients from internal backend addresses.
2. **A Layer 7 Load Balancer**: Distributing client traffic evenly between the two Node.js backends using Round-Robin scheduling.

---

## 2. Network Topology & Request Flow

```
                         +-----------------------+
                         |      Client Node      |
                         |  (curl / Web Browser) |
                         +-----------+-----------+
                                     |
                                     | 1. HTTP GET http://10.216.38.9/
                                     | (TCP Port 80)
                                     v
                         +-----------------------+
                         |   Mac 2 / NGINX Edge  |
                         |     (10.216.38.9)     |
                         +-----------+-----------+
                                     |
                 +-------------------+-------------------+
                 | 2. Round-Robin Upstream Distribution  |
                 v                                       v
       +--------------------+                 +--------------------+
       |  Mac 1 / Backend A |                 |  Mac 2 / Backend B |
       | 10.216.38.155:3001 |                 |  10.216.38.9:3002  |
       +---------+----------+                 +---------+----------+
                 |                                      |
                 | 3. Response with                     | 3. Response with
                 |    X-Backend: A                      |    X-Backend: B
                 |                                      |
                 +-------------------+------------------+
                                     |
                                     | 4. NGINX preserves headers
                                     v
                         +-----------------------+
                         |      Client Node      |
                         |  Receives response +  |
                         |  Header X-Backend:A/B |
                         +-----------------------+
```

### Detailed Flow Steps:
1. **Client Connection**: The client initiates an HTTP request to `http://10.216.38.9/` on port `80`.
2. **Reverse Proxy Processing**: NGINX receives the request at the `location /` block.
3. **Load Balancing via Upstream**: NGINX selects a backend from the `upstream node_backends` pool using round-robin alternation.
4. **Header Translation**:
   - `Host` is forwarded to maintain target host context.
   - `X-Real-IP` and `X-Forwarded-For` are populated with the client's source IP address.
   - `X-Forwarded-Proto`, `X-Forwarded-Host`, and `X-Forwarded-Port` capture edge protocol parameters.
5. **Backend Execution**:
   - Backend A (Mac 1) handles odd-numbered requests and sets header `X-Backend: A`.
   - Backend B (Mac 2) handles even-numbered requests and sets header `X-Backend: B`.
6. **Response Pass-Through**: NGINX passes the backend's response and status code back to the client, preserving the `X-Backend` header via `proxy_pass_header X-Backend;`.

---

## 3. Configuration Analysis (`network/nginx/nginx.conf`)

### Upstream Definition
```nginx
upstream node_backends {
    server 10.216.38.155:3001; # Backend A on Mac 1
    server 10.216.38.9:3002;    # Backend B on Mac 2
}
```
- **Function**: Defines the server pool to which NGINX forwards requests.
- **Algorithm**: Default Round-Robin. Requests alternate automatically between `10.216.38.155:3001` and `10.216.38.9:3002`.

### Reverse Proxy & Headers Configuration
```nginx
server {
    listen       80;
    server_name  10.216.38.9 localhost;

    location / {
        proxy_pass http://node_backends;

        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Port   $server_port;

        proxy_pass_header X-Backend;
    }
}
```
- `proxy_pass http://node_backends;`: Directs incoming HTTP requests to the upstream server pool.
- `proxy_pass_header X-Backend;`: Instructs NGINX to deliver the backend identification header (`X-Backend`) to the client without stripping or altering it.
- `proxy_set_header`: Passes essential client metadata downstream to the Node.js instances.

---

## 4. Testing Procedure & Expected Output

### Testing via `curl`
When NGINX is run, verify load balancing behavior and header preservation with the following commands:

```bash
# Request 1: Should hit the first backend in the pool
curl -i http://10.216.38.9/

# Request 2: Should hit the second backend in the pool
curl -i http://10.216.38.9/

# Request 3: Cycles back to the first backend
curl -i http://10.216.38.9/
```

### Expected `X-Backend` Results
- **Request 1**:
  ```http
  HTTP/1.1 200 OK
  Server: nginx
  Content-Type: application/json
  X-Backend: A

  {"backend":"A","message":"Node.js Backend A running on Mac 1"}
  ```

- **Request 2**:
  ```http
  HTTP/1.1 200 OK
  Server: nginx
  Content-Type: application/json
  X-Backend: B

  {"backend":"B","message":"Node.js Backend B running on Mac 2"}
  ```

- **Request 3**:
  ```http
  HTTP/1.1 200 OK
  Server: nginx
  Content-Type: application/json
  X-Backend: A
  ```

### Direct Backend Reachability
Both backends remain directly accessible on their respective IP and port bindings for health checks and fault isolation:
```bash
# Verify Backend A directly
curl -i http://10.216.38.155:3001/api/status

# Verify Backend B directly
curl -i http://10.216.38.9:3002/api/status
```

---

## 5. Viva Preparation: Key Networking Concepts

### Q1: What is the difference between a Reverse Proxy and a Forward Proxy?
- **Forward Proxy**: Sits in front of client devices. It acts on behalf of the client to request resources from external servers (e.g., enterprise content filtering, anonymity, caching outbound requests).
- **Reverse Proxy**: Sits in front of backend servers. It acts on behalf of the servers to receive client requests, terminate connections, shield backend IP addresses, and distribute workload.

### Q2: What is an Upstream in NGINX?
An `upstream` is an NGINX configuration directive that defines a named group of servers that can be referenced by the `proxy_pass` directive. It enables NGINX to treat multiple physical or logical backend instances as a single logical pool for load balancing.

### Q3: How does Round-Robin load balancing work?
Round-Robin is a deterministic scheduling algorithm where requests are distributed across upstream servers in sequential order:
$$\text{Request } n \implies \text{Server } (n \bmod k)$$
where $k$ is the number of active servers in the pool. If a backend fails or times out, NGINX marks it as temporarily unavailable and passes the request to the next available server.

### Q4: Why do we use `X-Forwarded-For` and `X-Real-IP`?
When a reverse proxy forwards a request, the TCP connection received by the backend originates from the proxy's IP address (`10.216.38.9`), not the client's IP. The `X-Real-IP` and `X-Forwarded-For` headers ensure that the original client IP is preserved and visible to application backends for logging, analytics, and rate limiting.

### Q5: Why preserve the `X-Backend` header?
In distributed architectures, header transparency allows clients and monitoring tools to determine which specific server processed their request without exposing internal network routing details.

---

## 6. Phase Constraints Summary

- **No TLS / HTTPS**: Certificates and SSL termination are deliberately excluded from Phase 1.
- **Process Inactive**: NGINX is not started; configuration validated via `nginx -t`.
- **Decoupled Architecture**: Node.js backends and DNS configurations were not altered.
