const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
 


app.get("/",(req, res) => {
  res.status(200).send("Hello, World!");
});

app.listen(PORT, () => {
    console.log("Server UP & RUNNING on Port ${PORT} ")
});
