const express = require('express');
const productsRoutes = require("./routes/products");
const {connectDB, logout} = require('./connectionDataB');
require('dotenv').config();

const app = express();
const port = 3000;

let db = connectDB();


app.use("/api/", productsRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
