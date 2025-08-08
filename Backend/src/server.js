/**
 * Live Auction platform  Server - Backend
 */
const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const auctionItemsFile = require("./auctionItems");
const { json } = require("stream/consumers");


// Initialize Express app
const app = express();
const PORT = 3000;

// global bid history storage
const bidHistory = [];

// Middleware
app.use(express.json());
app.use(cors());

// Create a HTTP Server by using the same express instance
const server = http.createServer(app);

// Create a WebSocket Server and attaching it to http server
const wss = new WebSocket.Server({ server })

/**
 * ==================== REST API ROUTES ====================
 */


/**
 * GET/api/
 */

app.get("/",(req, res) => {
  res.status(200).send("Hello, World!");
});

/**
 * GET/api/items - all items
 */


app.get("/api/items",
(req, res) => {
  res.status(200).json(auctionItemsFile.auctionItems);
});


/**
 * GET/api/:id - Give items based on ID
 */

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

/**
 * POST/api/bids - placed a bid 
 */

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
  bidHistory.push(newBid);

  res.status(201).json(newBid);
  // console.log(bidHistory);
});


/**
 * GET/api/history - shows Bid History 
 */

app.get("/api/history",(req, res) => {
  res.status(200).json(bidHistory);
});


/**
 * ==================== WEBSOCKET====================
 * realtime 
 */


// WebSocket connection handler 
wss.on("connection", (ws) => {
  console.log("Client Connected");

// Send current auction itesm to the cliend on joinng 
  ws.send(JSON.stringify({
    type: "INITIAL_DATA",
    items: auctionItemsFile.auctionItems,
  }));

// Handle message coming from client 
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message)
      // Handle real_time bid
      if(data.type === "NEW_BID") {
        const { itemId, bidAmount, bidder } = data;

        if ( !itemId || !bidAmount || !bidder ) {
          return ws.send(
            JSON.stringify({
              type: "ERROR",
             message: "Missing required fields"
          })
         );
         return;
        }

        const foundItem = auctionItemsFile.auctionItems.find(
          (item) => item.id === parseInt(itemId)
        );
        if (!foundItem) {
          ws.send(JSON.stringify({type: "ERROR", message: "Item not found" }));
          return;
        }

        if(parseInt(bidAmount) <= foundItem.currentBid) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Bid must be higher than current bid",
            })
          );
          return;
        }

        foundItem.currentBid = parseInt(bidAmount);
        const newBid = {
          id: bidHistory.length + 1,
          item: parseInt(itemId),
          bidder,
          amount: parseInt(bidAmount),
          timeStamp: new Date().toISOString(),
        };

        foundItem.bids.push(newBid);
        bidHistory.push(newBid);
        // Broadcast to all connected cleints 
        broadcastBidUpdate(foundItem, newBid);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({type: "ERROR", message: "Invalid Message format"}))
    }
  });

  // Handle Client disconnection
  ws.on("close", () => {
    console.log("Client disconnected", ws);
  });
});



/**
 * Func that Broadcast updates to all connected clients.
 * This is used to keep all clients in sync
 */

function broadcastBidUpdate(item, bid) {
  wss.clients.forEach((client) => {
    if(client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "BID_UPDATE",
          item,
          bid,
        })
      );
    }
  });
}


// Start the Server - listen to HTTP and WebSocket message to same port 
server.listen(PORT, () => {
    console.log(`Server UP & RUNNING on Port ${PORT}`);
    console.log(`REST API: http://localhost:${PORT}/api/items`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
});
