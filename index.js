import express from "express";
import WebSocket, { WebSocketServer } from "ws";

var app = express();
app.listen(3333, () => {
  console.log("Server running on port 3333");
});

app.get("/ping", (req, res, next) => {
  res.json({ message: "Ping received" });
});

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});
