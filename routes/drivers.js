// Importējam express bibliotēku, lai izveidotu maršrutu (router)
const express = require("express");
const router = express.Router();
// Importējam bcrypt bibliotēku, lai hasholētu paroli
const bcrypt = require("bcrypt");
// Importējam jsonwebtoken bibliotēku, lai strādātu ar JWT
const jwt = require("jsonwebtoken");
// Importējam Driver modeli no datu bāzes
const Driver = require("../database/Driver");
// Importējam dotenv konfigurāciju, lai izmantotu vidi mainīgos
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

// Maršruts, lai izrakstītos
router.post("/logout", (req, res) => {
  try {
    // Notīrām tokenu no sīkdatnēm
    res.clearCookie("token");
    // Atgriežam veiksmīgu izrakstīšanās ziņojumu
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai pievienotu jaunu vadītāju
router.post("/add-driver", async (req, res) => {
  try {
    // Iegūstam datus no pieprasījuma ķermeņa
    const { company, email, password, role, seatCount } = req.body;

    // Pārbaudām, vai e-pasts jau eksistē
    const existingUser = await Driver.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Izveidojam jaunu vadītāja objektu
    const newUser = new Driver({
      company,
      email,
      password,
      role,
      seatCount,
    });

    // Saglabājam jauno vadītāju datu bāzē
    await newUser.save();

    // Atgriežam veiksmīgas reģistrācijas ziņojumu
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai rediģētu esošu vadītāju, izmantojot JWT autentifikāciju
router.put("/edit-driver/:id", authenticateJWT, async (req, res) => {
  try {
    // Iegūstam lietotāja ID no URL parametriem
    const userId = req.params.id;
    // Iegūstam atjauninātos datus no pieprasījuma ķermeņa
    const { company, email, role, seatCount } = req.body;

    // Atjauninām vadītāja informāciju datu bāzē
    const updatedUser = await Driver.findByIdAndUpdate(
      userId,
      { company, email, role, seatCount },
      { new: true }
    );

    // Ja vadītājs nav atrasts, atgriežam 404 statusa kodu
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Atgriežam veiksmīgu atjaunināšanas ziņojumu
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai dzēstu vadītāju, izmantojot JWT autentifikāciju
router.delete("/delete-driver/:id", authenticateJWT, async (req, res) => {
  try {
    // Iegūstam lietotāja ID no URL parametriem
    const userId = req.params.id;
    // Dzēšam vadītāju no datu bāzes
    const deletedUser = await Driver.findByIdAndDelete(userId);
    // Ja vadītājs nav atrasts, atgriežam 404 statusa kodu
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Atgriežam veiksmīgu dzēšanas ziņojumu
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai deaktivizētu vadītāju, izmantojot JWT autentifikāciju
router.put("/deactivate-driver/:id", authenticateJWT, async (req, res) => {
  try {
    // Iegūstam lietotāja ID no URL parametriem
    const userId = req.params.id;

    // Atjauninām vadītāja statusu uz "Neaktīvs"
    const updatedUser = await Driver.findByIdAndUpdate(
      userId,
      { status: "Neaktīvs" },
      { new: true }
    );

    // Ja vadītājs nav atrasts, atgriežam 404 statusa kodu
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Atgriežam veiksmīgu deaktivizēšanas ziņojumu
    res
      .status(200)
      .json({ message: "User deactivated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai iegūtu visu vadītāju sarakstu
router.get("/drivers", async (req, res) => {
  try {
    // Iegūstam visus vadītājus no datu bāzes
    const users = await Driver.find();
    // Atgriežam vadītāju sarakstu
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Eksportējam router, lai to varētu izmantot citos failos
module.exports = router;
