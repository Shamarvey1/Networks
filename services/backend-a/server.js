const http = require('http');

// --- Network Configuration ---
// The server will listen on TCP port 3001.
const PORT = 3001;

// Binding to '0.0.0.0' tells the server to listen on all available IPv4 network interfaces.
// This is critical because binding to '127.0.0.1' (localhost) would only allow connections
// from the same machine (Mac 1). By using '0.0.0.0', Mac 2 can route traffic over the LAN
// to reach this server instance.
const HOST = '0.0.0.0';

// Create the HTTP server using Node.js built-in networking capabilities.
const server = http.createServer((req, res) => {
  // --- HTTP Response Headers ---
  // Always attach a custom header to identify the origin of the response.
  // This will be useful for verifying load balancer behavior from Mac 2 later.
  res.setHeader('X-Backend', 'A');
  
  // By default, our endpoints respond with JSON data.
  res.setHeader('Content-Type', 'application/json');

  // --- HTTP Request Handling ---
  
  // 1. Root Endpoint
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      message: 'Hello from Backend A',
      backend: 'A'
    }));
    return;
  }

  // 2. Status Endpoint
  if (req.method === 'GET' && req.url === '/api/status') {
    // Injecting a Cache-Control header here allows us to test HTTP caching 
    // at the nginx reverse proxy level (on Mac 2) during a later phase.
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.writeHead(200);
    res.end(JSON.stringify({
      backend: 'A',
      status: 'ok'
    }));
    return;
  }

  // 3. Handle unknown routes
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// --- Server Socket / Listening ---
// Open the server socket to listen for incoming connections.
server.listen(PORT, HOST, () => {
  console.log(`[Backend A] Server socket listening on http://${HOST}:${PORT}`);
  console.log(`[Backend A] Accessible across the LAN to other devices on this subnet.`);
});
