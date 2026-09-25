const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  // CORS & Mobile friendly headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse path
  let safePath = decodeURI(req.url.split('?')[0]);
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(BASE_DIR, safePath);

  // Security check: ensure path is within BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Prohibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Recurso no encontrado</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Optimización de rendimiento: Caché para imágenes y fuentes, no-cache para CSS/JS/HTML
    let cacheControl = 'no-cache, no-store, must-revalidate';
    if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.woff2', '.woff', '.ico'].includes(ext)) {
      cacheControl = 'public, max-age=604800, immutable'; // 7 días en caché de navegador
    } else {
      cacheControl = 'no-cache, no-store, must-revalidate'; // CSS, JS y HTML siempre frescos
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': cacheControl
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Aura Beauty activo en el puerto ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Móvil en red Wi-Fi: http://192.168.1.72:${PORT}`);
});
