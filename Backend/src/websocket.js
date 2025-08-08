// NOTE: LEARNING ONLY NOT THE PART OF CODE
const http = require("http");
const WebSocket = require("ws");

const PORT = 3001;


// Crete a HTTP Server
const server = http.createServer((req, res) => {
    res.writeHead(200, {"Content-type": "Plain/text"});
    res.end("WebSocket Server Running");
});

// Create a WebSocket Server
const wss = new WebSocket.Server({ server });


// WebSocket connection handler 
wss.on("connection", (ws) => {
  console.log("Client Connected");

  ws.send(JSON.stringify({message:" Hello from WS! "}));

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
 
server.listen(PORT, () => {
    console.log(`Server UP & RUNNING on Port ${PORT}`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
});
 