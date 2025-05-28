import WebSocket, { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });

  setInterval(() => {
    console.log("Printing ping in every 14 minutes");
  }, 840000);
});
