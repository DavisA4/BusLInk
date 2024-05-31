const express = require("express"); // Importē Express, kas ļaus veidot web serveri
const router = express.Router(); // Izveido Express maršrutētāju, lai definētu maršrutus
const bcrypt = require("bcrypt"); // Importē bibliotēku "bcrypt", kas nodrošina paroļu šifrēšanu
const jwt = require("jsonwebtoken"); // Importē bibliotēku "jsonwebtoken", kas ģenerē un verificē JWT
const User = require("../database/User"); // Importē User modeli no datu bāzes
const Driver = require("../database/Driver"); // Importē Driver modeli no datu bāzes
const Reservation = require("../database/Reservation"); // Importē Reservation modeli no datu bāzes
require("dotenv").config(); // Importē bibliotēku "dotenv" un konfigurē vides mainīgos

// Funkcija, kas pārbauda JWT autentifikāciju
function authenticateJWT(req, res, next) {
  const token = req.cookies.token; // Iegūst JWT token no sīkdatnēm

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // Ja nav tokena, atgriež kļūdas ziņojumu
  }

  jwt.verify(token, process.env.JWT, (err, user) => { // Verificē JWT ar slepeno atslēgu
    if (err) {
      return res.status(403).json({ message: "Forbidden" }); // Ja verifikācija neizdodas, atgriež kļūdas ziņojumu
    }

    req.user = user; // Ja verifikācija izdodas, pievieno lietotāja informāciju pieprasījumam
    next(); // Turpina izpildi
  });
}

// Maršruts lietotāja pieteikšanai
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; // Iegūst epastu un paroli no pieprasījuma

    let user = await User.findOne({ email }); // Meklē lietotāju pēc epasta datu bāzē
    if (!user) {
      user = await Driver.findOne({ email }); // Ja lietotājs nav atrasts, meklē starp šoferiem
      if (!user) {
        return res.status(401).json({ message: "User not found" }); // Ja lietotājs netika atrasts, atgriež kļūdas ziņojumu
      }
    }
    if (user.status === "Neaktīvs") {
      return res.status(403).json({ message: "User is deactivated" }); // Ja lietotājs ir deaktivizēts, atgriež kļūdas ziņojumu
    }

    const passwordMatch = await bcrypt.compare(password, user.password); // Pārbauda paroles atbilstību
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" }); // Ja parole nesakrīt, atgriež kļūdas ziņojumu
    }

    const token = jwt.sign(
      { // Izveido JWT, iekļaujot lietotāja informāciju
        userId: user._id,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      process.env.JWT // Izmanto vides mainīgo kā slepeno atslēgu
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      // secure: true,
    }); // Iestata JWT kā sīkdatni

    res.status(200).json({ message: "Login successful", token }); // Atgriež veiksmīgu pieteikšanās ziņojumu
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" }); // Ja notiek kļūda, atgriež kļūdas ziņojumu
  }
});

// Maršruts izrakstīšanās funkcijai
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token"); // Notīra JWT sīkdatni
    res.status(200).json({ message: "Logout successful" }); // Atgriež izrakstīšanās apstiprinājumu
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" }); // Ja notiek kļūda, atgriež kļūdas ziņojumu
  }
});

// Maršruts, lai iegūtu lietotāja epasta informāciju
router.get("/get-email", authenticateJWT, async (req, res) => {
  try {
    const { email, role, firstname, lastname, userId } = req.user; // Iegūst lietotāja informāciju no pieprasījuma
    res.status(200).json({ email, role, firstname, lastname, userId }); // Atgriež lietotāja informāciju
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" }); // Ja notiek kļūda, atgriež kļūdas ziņojumu
  }
});

// Maršruts, lai pievienotu jaunu lietotāju
router.post("/add-user", async (req, res) => {
  try {
    const { email, password, firstname, lastname, role } = req.body; // Iegūst jaunā lietotāja datus no pieprasījuma

    const existingUser = await User.findOne({ email }); // Pārbauda, vai lietotājs ar šādu epastu jau pastāv
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" }); // Ja lietotājs pastāv, atgriež kļūdas ziņojumu
    }

    const newUser = new User({ // Izveido jaunu User objektu ar saņemtajiem datiem
      email,
      password,
      firstname,
      lastname,
      role,
    }); // Izveido jaunu lietotāju, izmantojot modeļa konstruktoru
    
    await newUser.save(); // Saglabā jauno lietotāju datu bāzē
    
    res.status(201).json({ message: "User registered successfully" }); // Atgriež veiksmīgu reģistrācijas apstiprinājumu
    } catch (error) { // Ja notiek kļūda
    console.error(error); // Izvada kļūdu konsolē
    res.status(500).json({ message: "Internal server error" }); // Atgriež kļūdas ziņojumu
    }
    });
    
    router.put("/edit-user/:id", authenticateJWT, async (req, res) => {
    try {
    const userId = req.params.id; // Iegūst lietotāja ID no pieprasījuma parametriem
    const { email, firstname, lastname, role } = req.body; // Iegūst jaunās lietotāja datus no pieprasījuma
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, firstname, lastname, role }, // Atjauno lietotāja datus ar jaunajiem datiem
      { new: true } // Atgriež atjaunināto lietotāja ierakstu
    ); 
    
    if (!updatedUser) { // Ja lietotājs netika atrasts
      return res.status(404).json({ message: "User not found" }); // Atgriež kļūdas ziņojumu
    }
    
    res.status(200).json({ message: "User updated successfully", user: updatedUser }); // Atgriež veiksmīgu atjaunināšanas apstiprinājumu
    } catch (error) { // Ja notiek kļūda
    console.error(error); // Izvada kļūdu konsolē
    res.status(500).json({ message: "Internal server error" }); // Atgriež kļūdas ziņojumu
    }
    });
    
    router.delete("/delete-user/:id", authenticateJWT, async (req, res) => {
    try {
    const userId = req.params.id; // Iegūst lietotāja ID no pieprasījuma parametriem
    
    const userReservations = await Reservation.find({ user: userId }); // Pārbauda, vai lietotājam ir rezervācijas
    if (userReservations.length > 0) { // Ja ir aktīvas rezervācijas
      return res.status(400).json({ message: "Cannot delete user with active reservations" }); // Atgriež kļūdas ziņojumu
    }
    
    const deletedUser = await User.findByIdAndDelete(userId); // Dzēš lietotāju pēc ID
    if (!deletedUser) { // Ja lietotājs netika atrasts
      return res.status(404).json({ message: "User not found" }); // Atgriež kļūdas ziņojumu
    }
    res.status(200).json({ message: "User deleted successfully" }); // Atgriež veiksmīgu dzēšanas apstiprinājumu
    } catch (error) { // Ja notiek kļūda
    console.error(error); // Izvada kļūdu konsolē
    res.status(500).json({ message: "Internal server error" }); // Atgriež kļūdas ziņojumu
    }
    });
    
    router.put("/toggle-user-status/:id", authenticateJWT, async (req, res) => {
    try {
    const userId = req.params.id; // Iegūst lietotāja ID no pieprasījuma parametriem
    
    const user = await User.findById(userId); // Atroda lietotāju pēc ID
    if (!user) { // Ja lietotājs netika atrasts
      return res.status(404).json({ message: "User not found" }); // Atgriež kļūdas ziņojumu
    }
    
    user.status = user.status === "Aktīvs" ? "Neaktīvs" : "Aktīvs"; // Nomaina lietotāja statusu
    await user.save(); // Saglabā izmaiņas datu bāzē
    
    res.status(200).json({ message: `User status updated to ${user.status}`, user }); // Atgriež veiksmīgu statusa maiņas apstiprinājumu
    } catch (error) { // Ja notiek kļūda
    console.error("Error toggling user status:", error); // Izvada kļūdu konsolē
    res.status(500).json({ message: "Internal server error" }); // Atgriež kļūdas ziņojumu
    }
    });
    
    router.get("/users", authenticateJWT, async (req, res) => {
    try {
    const users = await User.find(); // Atrod visus lietotājus
    res.status(200).json(users); // Atgriež visus lietotājus
    } catch (error) { // Ja notiek kļūda
    console.error(error); // Izvada kļūdu konsolē
    res.status(500).json({ message: "Internal server error" }); // Atgriež kļūdas ziņojumu
    }
    });
    
    module.exports = router; // Eksportē maršrutētāju
    