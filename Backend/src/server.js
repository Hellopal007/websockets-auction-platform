const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const auctionItemsFile = require("./auctionItems");
const { json } = require("stream/consumers");

const app = express();
const PORT = 3000;

const bidHistory = []

app.use(express.json());
app.use(cors());

// Crete a HTTP Server
const server = http.createServer(app);

// Create a WebSocket Server
const wss = new WebSocket.Server({ server })

// WebSocket connection handler 
wss.on("connection", (ws) => {
  console.log("Client Connected");

  ws.send(JSON.stringify({message:" Hello from WS! "}));

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
 

app.get("/",(req, res) => {
  res.status(200).send("Hello, World!");
});

app.get("/api/items",
(req, res) => {
  res.status(200).json(auctionItemsFile );
});

app.get("/api/items/:id", (req, res) => {
  const reqID = parseInt(req.params.id);
  console.log(reqID);
const item = auctionItemsFile.auctionItems.find((item) => item.id === reqID);
  if (!item){
    return res.status(404).json({
      error: "item not found",
    });
  }
  res.status(200).json(item);
}) ;

app.post("/api/bids", (req,res) => {
  const { itemId, bidAmount, bidder } = req.body;

  if ( !itemId || !bidAmount || !bidder ) {
    return res.status(400).json({ error: "Missing required field" });
  }

  const foundItem = auctionItemsFile.auctionItems.find(
    (item) => item.id === parseInt(itemId)
  );

  if (!foundItem) {
    return res.status(404).json({error: "item not found "});
  }

  if (parseInt(bidAmount) <= foundItem.currentBid) {
    return res.status(400).json({error:"bid much be higher than current bid"});
  }

  foundItem.currentBid = parseInt(bidAmount); //update the item with new bid 
  const newBid = {
    id: bidHistory.length + 1,
    item: parseInt(itemId),
    bidder,
    amount: parseInt(bidAmount),
    timeStamp: new Date().toISOString(),
  };

  foundItem.bids.push(newBid);
  bidHistory.push(newBid)

  res.status(201).json(newBid)
  console.log(bidHistory);
});

server.listen(PORT, () => {
    console.log(`Server UP & RUNNING on Port ${PORT}`);
    console.log(`REST API: http://localhost:${PORT}/api/items`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
});
