// Importējam express bibliotēku un izveidojam jaunu router objektu
const express = require("express");
const router = express.Router();
// Importējam jsonwebtoken bibliotēku JWT pārvaldībai
const jwt = require("jsonwebtoken");
// Importējam Time modeli no datu bāzes
const Time = require("../database/Time");
// Ielādējam vidi mainīgos no .env faila
require("dotenv").config();

// Middleware funkcija, lai autentificētu JWT
function authenticateJWT(req, res, next) {
  // Iegūstam tokenu no sīkdatnēm
  const token = req.cookies.token;

  // Ja tokena nav, atgriežam 401 statusa kodu
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verificējam tokenu ar JWT
  jwt.verify(token, process.env.JWT, (err, user) => {
    // Ja ir kļūda, atgriežam 403 statusa kodu
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Saglabājam lietotāju pieprasījumā un turpinām
    req.user = user;
    next();
  });
}

// Maršruts, lai saglabātu laika iestatījumus
router.post("/save-time", async (req, res) => {
  try {
    // Iegūstam laiku no pieprasījuma ķermeņa
    const { time } = req.body;

    // Pārbaudām, vai ir jau saglabāts laika iestatījums
    let existingTimeSetting = await Time.findOne();

    // Ja laika iestatījums jau eksistē, atjauninām to
    if (existingTimeSetting) {
      existingTimeSetting.time = time;
      await existingTimeSetting.save();
    } else {
      // Ja laika iestatījums neeksistē, izveidojam jaunu
      existingTimeSetting = new Time({ time });
      await existingTimeSetting.save();
    }

    // Atgriežam veiksmīgu atbildi
    res.status(201).json({ message: "Time saved successfully" });
  } catch (error) {
    // Kļūdas gadījumā atgriežam kļūdas atbildi
    console.error("Error saving time:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai iegūtu laika iestatījumus
router.get("/get-time", async (req, res) => {
  try {
    // Iegūstam laika iestatījumus no datu bāzes, atgriežot tikai 'time' lauku
    const time = await Time.find({}, { time: 1, _id: 0 });
    // Atgriežam veiksmīgu atbildi ar laika iestatījumiem
    res.status(200).json(time);
    console.log(time);
  } catch (error) {
    // Kļūdas gadījumā atgriežam kļūdas atbildi
    console.error("Error fetching time:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Eksportējam maršrutus (router), lai tos izmantotu citos failos
module.exports = router;
