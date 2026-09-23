import { createServer } from 'node:http';
import { get } from 'node:https';

const LOGIN = 'alexeev1one';

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/login') {
    return res.end(LOGIN);
  }

  const match = req.url.match(/^\/id\/([^/?]+)$/);

  if (req.method === 'GET' && match) {
    const N = match[1];

    get(`https://nd.kodaktor.ru/users/${encodeURIComponent(N)}`, response => {
      let data = '';

      response.setEncoding('utf8');

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const { login } = JSON.parse(data);
          res.end(String(login));
        } catch {
          res.statusCode = 500;
          res.end('Error');
        }
      });
    }).on('error', () => {
      res.statusCode = 500;
      res.end('Error');
    });

    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0');