const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const modelAreaPersonaleSchema = require('./models/modelAreaPersonale');
const AreaPersonaleRoutes = require("./routes/AreaPersonale");
const EventiRoutes = require("./routes/Eventi");
const authRoutes = require("./routes/AuthRoutes");
const newsRoutes = require("./routes/newsRoutes");

const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/AreaPersonale", AreaPersonaleRoutes);
app.use("/api/Eventi", EventiRoutes);

app.use("/", newsRoutes);


app.use(cookieParser());
app.use("/", authRoutes);

mongoose.connect("mongodb+srv://web:web@sito.v46sfqa.mongodb.net/?retryWrites=true&w=majority&appName=sito")
.then( () => {
  console.log("database connected per il caricamento degli eventi")
  app.listen(3000, () => {
      console.log("listening on port 3000")
  })
}).catch((err) => {
  console.log(err)
})

app.use(cors({
  origin:["http://localhost:3000"],
  method:["GET", "POST"],
  credentials:true,
}));
