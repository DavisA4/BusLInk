// Importē Mongoose bibliotēku, kas nodrošina vieglu darbu ar MongoDB datubāzēm
const mongoose = require("mongoose");

// Importē bcrypt bibliotēku, kas nodrošina funkcijas parolei šifrēšanai
const bcrypt = require("bcrypt");

// Izveido jaunu shēmu priekš 'driverSchema', izmantojot Mongoose shēmu konstruktoru
const driverSchema = new mongoose.Schema({
  // Definē 'company' lauku shēmā
  company: { 
    // Nosaka datu tipu šim laukam kā String
    type: String, 
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true 
  },
  // Definē 'email' lauku shēmā
  email: { 
    // Nosaka datu tipu šim laukam kā String
    type: String, 
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true, 
    // Pievieno unikālu ierobežojumu, lai šī lauka vērtība būtu unikāla datubāzē
    unique: true 
  },
  // Definē 'password' lauku shēmā
  password: { 
    // Nosaka datu tipu šim laukam kā String
    type: String, 
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true 
  },
  // Definē 'seatCount' lauku shēmā
  seatCount: { 
    // Nosaka datu tipu šim laukam kā Number
    type: Number, 
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true 
  },
  // Definē 'role' lauku shēmā
  role: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Šim laukam nav obligāti aizpildāma prasība
  },
  // Definē 'status' lauku shēmā
  status: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Nosaka iespējamo vērtību kopu priekš šī lauka
    enum: ["Aktīvs", "Neaktīvs"],
    // Definē noklusējuma vērtību, ja šis lauks netiek aizpildīts
    default: "Aktīvs",
  },
  // Definē 'created_at' lauku shēmā
  created_at: { 
    // Nosaka datu tipu šim laukam kā Date
    type: Date, 
    // Definē noklusējuma vērtību, kas būs pašreizējais datums un laiks, kad ieraksts tiek izveidots
    default: Date.now 
  },
});

// Pievieno middleware funkciju, kas tiks izsaukta pirms katra 'save' darbības
driverSchema.pre("save", async function (next) {
  try {
    // Ģenerē salt (random datu pievienojums), izmantojot 10 random apgriezienus
    const salt = await bcrypt.genSalt(10);
    // Šifrē šo objektu 'password' lauku, izmantojot ģenerēto randomu
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // Aizstāj sākotnējo paroli ar šifrēto paroli
    this.password = hashedPassword;
    // Turpina ar nākamo middleware vai saglabāšanas darbību
    next();
  } catch (error) {
    // Ja rodas kļūda, nodod to nākamajam middleware ar kļūdas objektu
    next(error);
  }
});

// Eksportē Mongoose modeli ar nosaukumu 'Driver', izmantojot iepriekš definēto shēmu 'driverSchema'
// 'mongoose.model' metode izveido un kompili Mongoose modeli no shēmas
module.exports = mongoose.model("Driver", driverSchema);
