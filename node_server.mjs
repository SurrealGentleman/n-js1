import http from "node:http";

const LOGIN = "alexeev1one";
const port = Number(process.env.PORT || 3000);

function send(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  res.end(value);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET") {
    return send(res, 405, "Только GET");
  }

  const path = new URL(req.url, "http://localhost").pathname;

  if (path === "/login") {
    return send(res, 200, LOGIN);
  }

  const match = /^\/id\/([^/]+)$/.exec(path);

  if (!match) {
    return send(res, 404, "Маршрут не найден");
  }

  try {
    const id = decodeURIComponent(match[1]);

    const url =
      `https://nd.kodaktor.ru/users/${encodeURIComponent(id)}`;

    const upstream = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(20_000),
    });

    if (!upstream.ok) {
      return send(
        res,
        upstream.status === 404 ? 404 : 502,
        "Источник вернул ошибку"
      );
    }

    const data = await upstream.json();

    if (typeof data?.login !== "string") {
      return send(
        res,
        502,
        "В ответе нет строкового login"
      );
    }

    return send(res, 200, data.login);
  } catch {
    return send(
      res,
      502,
      "Ошибка обращения к источнику"
    );
  }
});

server.listen(port, "0.0.0.0");