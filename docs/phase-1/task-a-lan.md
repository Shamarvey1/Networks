# Task A: LAN Setup and Connectivity

## Overview
Both machines must be connected to the same private Local Area Network (LAN). Being on the same LAN ensures that the two Macs can route traffic directly to each other using their local IP addresses. This is critical for the project so that Mac 1 can act as the DNS server and Mac 2 can act as the reverse proxy for services hosted on both machines, all without relying on external internet routing.

## Required Connectivity Tests

Run the following commands to verify bidirectional communication between the two machines and the local network. Save the terminal output as evidence.

### 1. Mac 1 to Mac 2
Verify that Mac 1 can reach Mac 2.
```bash
ping -c 4 <MAC2_IP>
```

### 2. Mac 2 to Mac 1
Verify that Mac 2 can reach Mac 1.
```bash
ping -c 4 <MAC1_IP>
```

### 3. Both Macs to Default Gateway
Verify that both machines have general network connectivity by pinging their default gateways.

**From Mac 1:**
```bash
ping -c 4 <MAC1_GATEWAY>
```

**From Mac 2:**
```bash
ping -c 4 <MAC2_GATEWAY>
```
