// Importē Mongoose bibliotēku, kas nodrošina vieglu darbu ar MongoDB datubāzēm
const mongoose = require('mongoose');

// Izveido jaunu shēmu priekš 'busStopSchema', izmantojot Mongoose shēmu konstruktoru
const busStopSchema = new mongoose.Schema({
  // Definē 'name' lauku shēmā
  name: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true
  },
  // Definē 'time' lauku shēmā
  time: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true
  },
  // Definē 'about' lauku shēmā
  about: {
    // Nosaka datu tipu šim laukam kā String
    type: String, 
    // Šim laukam nav obligāti aizpildāma prasība
  }
});

// Eksportē Mongoose modeli ar nosaukumu 'BusStop', izmantojot iepriekš definēto shēmu 'busStopSchema'
// 'mongoose.model' metode izveido un kompili Mongoose modeli no shēmas
module.exports = mongoose.model('BusStop', busStopSchema);
