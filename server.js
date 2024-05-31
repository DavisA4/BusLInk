const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const usersRoute = require("./routes/users");
const driversRoute = require("./routes/drivers");
const settingsRoute = require("./routes/time");
const routesRoute = require("./routes/routes");
const cronJob = require("./src/cron");
require("dotenv").config();

const uri =
  "mongodb+srv://admin:adminpass@prakse.ad7by7w.mongodb.net/?retryWrites=true&w=majority&appName=prakse";

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

cronJob.cronJob.start();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected");
  } catch (error) {
    console.error(error);
  }
}

connect();

app.use("/api/users", usersRoute);
app.use("/api/drivers", driversRoute);
app.use("/api/settings", settingsRoute);
app.use("/api/routes", routesRoute);

app.listen(8000, () => {
  console.log(`Server is running on port 8000`);
});
