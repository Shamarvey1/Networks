const http = require('http');

const PORT = 3002;
const HOST = '0.0.0.0';

const server = http.createServer((req, res) => {
  // Every response from Backend B must include X-Backend: B
  res.setHeader('X-Backend', 'B');

  // Parse request URL
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // Endpoint: GET /
  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      backend: 'B',
      message: 'Node.js Backend B running on Mac 2'
    }));
    return;
  }

  // Endpoint: GET /api/status
  if (req.method === 'GET' && pathname === '/api/status') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    });
    res.end(JSON.stringify({
      backend: 'B',
      status: 'ok'
    }));
    return;
  }

  // 404 handler for any other route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    backend: 'B',
    error: 'Not Found'
  }));
});

server.listen(PORT, HOST, () => {
  console.log(`Backend B listening on http://${HOST}:${PORT}`);
  console.log(`Bound to ${HOST}, accessible on Mac 2 IP (10.216.38.9:${PORT})`);
});
