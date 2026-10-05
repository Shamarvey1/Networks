# Private DNS Server

## 1. Purpose of the Private DNS
The private DNS server allows our client applications to communicate using human-readable domain names (like `app.team1.test`) rather than hardcoded IP addresses. The DNS server resolves these custom domains to the specific IP address of the edge server. This emulates how real-world public DNS systems operate, routing traffic to our project's entry point.

## 2. Mac 1 DNS Server IP
- **IP Address:** `10.216.38.155`
- Mac 1 will host the `dnsmasq` service on UDP Port 53.

## 3. Mac 2 Edge IP
- **IP Address:** `10.216.38.9`
- Mac 2 will act as the reverse proxy (nginx). All domain traffic should be directed here.

## 4. Required DNS Records
The following custom A records are configured in `dnsmasq.conf`:
- `app.team1.test` → `10.216.38.9`
- `api.team1.test` → `10.216.38.9`

## 5. How dnsmasq Will Be Tested
To test the private DNS server without disrupting the macOS system-level network configuration, we will use the `dig` command. By using `dig @<DNS_IP>`, we can explicitly query our local `dnsmasq` instance instead of the default internet provider DNS.

## 6. Expected `dig` Output
When you query the private DNS server for `app.team1.test`, you should see an `A` record pointing to Mac 2:

```text
; <<>> DiG 9.10.6-P1 <<>> @10.216.38.155 app.team1.test
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 48115
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;app.team1.test.			IN	A

;; ANSWER SECTION:
app.team1.test.		0	IN	A	10.216.38.9
```
