const express = require("express");
const app = express();
app.use(express.json())
require('dotenv').config();

const registerUserRouter = require("./registerUserRouter")
const loginRouter = require("./loginRouter")
const addTrainRouter = require("./addTrainRouter")
const getTrainRouter = require("./getTrainRouter")
const bookSeatRouter = require("./bookSeatRouter")
const bookingDetailsRouter = require("./bookingDetailsRouter")

app.use("/api", registerUserRouter)
app.use("/api", loginRouter)
app.use("/api/trains", addTrainRouter, getTrainRouter, bookSeatRouter)
app.use("/api", bookingDetailsRouter)

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});



const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});