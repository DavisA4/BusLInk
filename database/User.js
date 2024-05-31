// Importējam mongoose bibliotēku, lai strādātu ar MongoDB datu bāzi
const mongoose = require("mongoose");
// Importējam bcrypt bibliotēku, lai hasholētu paroli
const bcrypt = require("bcrypt");

// Definējam lietotāja shēmu ar mongoose.Schema metodi
const userSchema = new mongoose.Schema({
  // Lietotāja vārds, obligāts lauks
  firstname: { type: String, required: true },
  // Lietotāja uzvārds, obligāts lauks
  lastname: { type: String, required: true },
  // Lietotāja e-pasta adrese, obligāts un unikāls lauks
  email: { type: String, required: true, unique: true },
  // Lietotāja parole, obligāts lauks
  password: { type: String, required: true },
  // Lietotāja loma, ar iespējamiem vērtībām "Pasažieris" vai "Menedžeris", noklusēti "Pasažieris"
  role: {
    type: String,
    enum: ["Pasažieris", "Menedžeris"],
    default: "Pasažieris",
  },
  // Lietotāja statuss, ar iespējamiem vērtībām "Aktīvs" vai "Neaktīvs", noklusēti "Aktīvs"
  status: {
    type: String,
    enum: ["Aktīvs", "Neaktīvs"],
    default: "Aktīvs",
  },
  // Lietotāja konta izveides datums, noklusēti pašreizējais datums un laiks
  created_at: { type: Date, default: Date.now },
});

// Pirms saglabāt lietotāja datus datu bāzē, izpildām šo funkciju
userSchema.pre("save", async function (next) {
  try {
    // Ģenerējam sāli ar stiprumu 10
    const salt = await bcrypt.genSalt(10);
    // Hashjam lietotāja paroli ar ģenerēto randomu
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // Aizstājam oriģinālo paroli ar hasholēto paroli
    this.password = hashedPassword;
    
    next();
  } catch (error) {
   
    next(error);
  }
});

// Eksportējam User modeli, kas balstīts uz userSchema, lai to varētu izmantot citās failos
module.exports = mongoose.model("User", userSchema);
