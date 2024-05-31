// Importē Mongoose bibliotēku, kas nodrošina vieglu darbu ar MongoDB datubāzēm
const mongoose = require("mongoose");

// Importē 'Route' modeli no 'Route' faila
const Route = require("./Route");

// Importē 'User' modeli no 'User' faila
const User = require("./User");

// Izveido jaunu shēmu priekš 'reservationSchema', izmantojot Mongoose shēmu konstruktoru
const reservationSchema = new mongoose.Schema({
  // Definē 'route' lauku shēmā
  route: {
    // Nosaka datu tipu šim laukam kā ObjectId, kas ir atsauce uz citu dokumentu MongoDB datubāzē
    type: mongoose.Schema.Types.ObjectId,
    // Norāda, ka šis lauks atsaucas uz 'Route' kolekciju
    ref: "Route",
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true,
  },
  // Definē 'user' lauku shēmā
  user: {
    // Nosaka datu tipu šim laukam kā ObjectId, kas ir atsauce uz citu dokumentu MongoDB datubāzē
    type: mongoose.Schema.Types.ObjectId,
    // Norāda, ka šis lauks atsaucas uz 'User' kolekciju
    ref: "User",
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true,
  },
  // Definē 'firstname' lauku shēmā
  firstname: { 
    // Nosaka datu tipu šim laukam kā String
    type: String, 
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true 
  },
  // Definē 'lastname' lauku shēmā
  lastname: { 
    // Nosaka datu tipu šim laukam kā String
    type: String, 
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true 
  },
  // Definē 'from_to' lauku shēmā
  from_to: { 
    // Nosaka datu tipu šim laukam kā Array
    type: Array, 
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true 
  },
  // Definē 'status_user' lauku shēmā
  status_user: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Nosaka iespējamo vērtību kopu priekš šī lauka
    enum: [
      "Rezervēts",
      "Atcelts",
    ],
    // Definē noklusējuma vērtību, ja šis lauks netiek aizpildīts
    default: "Rezervēts",
  },
  // Definē 'created_at' lauku shēmā
  created_at: { 
    // Nosaka datu tipu šim laukam kā Date
    type: Date, 
    // Definē noklusējuma vērtību, kas būs pašreizējais datums un laiks, kad ieraksts tiek izveidots
    default: Date.now 
  },
});

// Eksportē Mongoose modeli ar nosaukumu 'Reservation', izmantojot iepriekš definēto shēmu 'reservationSchema'
// 'mongoose.model' metode izveido un kompili Mongoose modeli no shēmas
module.exports = mongoose.model("Reservation", reservationSchema);
