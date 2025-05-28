import express from "express";
import WebSocket, { WebSocketServer } from "ws";

const EXPRESS_PORT = process.env.EXPRESS_PORT || 3333;
var app = express();
app.listen(EXPRESS_PORT, () => {
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
