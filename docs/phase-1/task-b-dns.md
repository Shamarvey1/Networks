# Task B: Private DNS Setup

## DNS Architecture
This project utilizes a centralized, private DNS architecture to mimic public internet routing. Mac 1 (`10.216.38.155`) acts as the authoritative name server for the custom `team1.test` zone using `dnsmasq`. It translates custom application domain names into the private IP address of Mac 2 (`10.216.38.9`), which serves as the ingress point (edge reverse proxy) for all HTTP/HTTPS traffic.

## DNS Query Flow
1. **Client Request:** A client (e.g., `curl` or a web browser) wants to access `http://app.team1.test`.
2. **DNS Resolution:** The client sends a DNS query for `app.team1.test` to the DNS server running on Mac 1 (`10.216.38.155`) over UDP Port 53.
3. **DNS Response:** `dnsmasq` processes the request, checks its static configuration, and replies with an `A` record pointing to Mac 2 (`10.216.38.9`).
4. **Connection:** The client establishes a TCP connection directly with Mac 2 using the resolved IP address to deliver the HTTP request.

## Hostname-to-IP Mapping
The `dnsmasq.conf` enforces the following static mappings:
- **Domain:** `app.team1.test` → **IP:** `10.216.38.9`
- **Domain:** `api.team1.test` → **IP:** `10.216.38.9`

## Testing Procedure
To verify that the DNS server is successfully resolving domains, you can use the `dig` command. You must specify the DNS server IP address directly to bypass the system's default DNS resolvers.

**Run these commands from either machine:**
```bash
dig @10.216.38.155 app.team1.test
dig @10.216.38.155 api.team1.test
```

## Expected Result
The queries should succeed with `status: NOERROR` and return an `ANSWER SECTION` containing the A record resolving to `10.216.38.9`.

Example snippet:
```text
;; ANSWER SECTION:
app.team1.test.		0	IN	A	10.216.38.9
```
