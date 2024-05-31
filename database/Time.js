// Importē Mongoose bibliotēku, kas nodrošina vieglu darbu ar MongoDB datubāzēm
const mongoose = require("mongoose");

// Izveido jaunu shēmu priekš 'timeSchema', izmantojot Mongoose shēmu konstruktoru
const timeSchema = new mongoose.Schema({
  // Definē 'time' lauku shēmā
  time: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true
  }
});

// Eksportē Mongoose modeli ar nosaukumu 'Time', izmantojot iepriekš definēto shēmu 'timeSchema'
// 'mongoose.model' metode izveido un kompili Mongoose modeli no shēmas
module.exports = mongoose.model("Time", timeSchema);
