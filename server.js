const http = require('http');
const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Хранилище клиентов
const clients = new Set();

// Middleware для статических файлов (если нужно обслуживать фронтенд)
app.use(express.static('public'));

// WebSocket подключения
wss.on('connection', (ws) => {
  console.log('Новое подключение');
  clients.add(ws);

  // Обработка сообщений от клиента
  ws.on('message', (message) => {
    console.log(`Получено сообщение: ${message}`);

    // Ограничение длины сообщения (50 символов)
    const truncatedMessage = message.toString().slice(0, 50);

    // Рассылка всем подключенным клиентам
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(truncatedMessage);
        client.send(`вы оптравили сообщение ${truncatedMessage}`)
      }
    });
  });

  // Обработка закрытия соединения
  ws.on('close', () => {
    console.log('Подключение закрыто');
    clients.delete(ws);
  });

  // Обработка ошибок
  ws.on('error', (error) => {
    console.error('Ошибка WebSocket:', error);
  });
});

// HTTP маршрут для проверки работы сервера
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    clients: clients.size
  });
});

// Запуск сервера
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`WebSocket доступен по адресу ws://localhost:${PORT}`);
});