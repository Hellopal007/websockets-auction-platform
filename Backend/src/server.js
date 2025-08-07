const express = require("express");
const cors = require("cors");
const auctionItems = require("./auctionItems");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
 
app.get("/",(req, res) => {
  res.status(200).send("Hello, World!");
});

app.get("/api/items",
(req, res) => {
  res.status(200).json(auctionItems);
})

app.get("/api/items/:id", (req, res) => {
  const reqID = req.params.id;
  console.log(reqID);
  // const item = auctionItems.find(item) => item.id 
  // === )
} );

app.listen(PORT, () => {
    console.log("Server UP & RUNNING on Port ${PORT} ")
});
