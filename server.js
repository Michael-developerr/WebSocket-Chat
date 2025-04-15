const http = require('http');
const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const clients = new Set();


app.use(express.static('public'));


wss.on('connection', (ws) => {
  console.log('Новое подключение');
  clients.add(ws);


  ws.on('message', (message) => {
    console.log(`Получено сообщение: ${message}`);

 
    const truncatedMessage = message.toString().slice(0, 50);

 
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(truncatedMessage);
        client.send(`вы оптравили сообщение ${truncatedMessage}`)
      }
    });
  });


  ws.on('close', () => {
    console.log('Подключение закрыто');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('Ошибка WebSocket:', error);
  });
});


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    clients: clients.size
  });
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`WebSocket доступен по адресу ws://localhost:${PORT}`);
});