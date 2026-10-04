const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Explicit route map for clean URLs
const ROUTE_MAP = {
  '/': 'index.html',
  '/index': 'index.html',
  '/index.html': 'index.html',
  '/register': 'register.html',
  '/register.html': 'register.html',
  '/admin': 'admin.html',
  '/admin.html': 'admin.html'
};

const server = http.createServer((req, res) => {
  const rawPath = req.url.split('?')[0];
  // Normalize trailing slashes (except for root '/')
  const cleanPath = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;

  let relativeFilePath = null;

  // 1. Check explicit route map
  if (ROUTE_MAP[cleanPath]) {
    relativeFilePath = ROUTE_MAP[cleanPath];
  } else {
    // 2. Check if direct file exists (e.g. static assets /css/..., /js/..., /logo.png)
    const directPath = path.join(__dirname, cleanPath);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      relativeFilePath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
    } else {
      // 3. Check if file with .html extension exists
      const htmlCandidate = path.join(__dirname, cleanPath + '.html');
      if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
        relativeFilePath = cleanPath.startsWith('/') ? cleanPath.slice(1) + '.html' : cleanPath + '.html';
      }
    }
  }

  if (!relativeFilePath) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1><p>The requested route does not exist.</p>');
    return;
  }

  const fullPath = path.join(__dirname, relativeFilePath);
  const ext = path.extname(fullPath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`NSU PODIUM Server active at http://localhost:${PORT}`);
});
