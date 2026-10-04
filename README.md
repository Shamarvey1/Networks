# Private Network Service Platform

A Computer Networks course project using a two-machine setup on macOS.

## Architecture

This project is deployed across two macOS machines:

**Member 1 (Mac 1)**
- Private DNS server (`dnsmasq`)
- Client testing environments
- Node.js Backend A (Port 3001)

**Member 2 (Mac 2)**
- `nginx` reverse proxy and load balancer
- HTTPS/TLS termination edge
- Node.js Backend B (Port 3002)

## Directory Structure

- `services/`: Contains the Node.js backend services.
- `network/`: Contains configuration for network components (DNS, NGINX, TLS).
- `scripts/`: Client testing and network configuration scripts.
- `docs/`: Architecture and phase documentation.
- `evidence/`: Outputs, logs, and screenshots for project submission.
- `captures/`: Wireshark packet capture (`.pcap`) files.
