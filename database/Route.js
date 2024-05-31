// Importē Mongoose bibliotēku, kas nodrošina vieglu darbu ar MongoDB datubāzēm
const mongoose = require("mongoose");

// Importē 'Driver' modeli no 'Driver' faila
const Driver = require("./Driver");

// Importē 'User' modeli no 'User' faila
const User = require("./User");

// Importē 'BusStop' modeli no 'BusStop' faila
const BusStop = require("./BusStop");

// Importē 'Reservation' modeli no 'Reservation' faila
const Reservation = require("./Reservation");

// Izveido jaunu shēmu priekš 'routeSchema', izmantojot Mongoose shēmu konstruktoru
const routeSchema = new mongoose.Schema({
  // Definē 'name' lauku shēmā
  name: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true,
  },
  // Definē 'date' lauku shēmā
  date: {
    // Nosaka datu tipu šim laukam kā Date
    type: Date,
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true,
  },
  // Definē 'driver' lauku shēmā
  driver: {
    // Nosaka datu tipu šim laukam kā ObjectId, kas ir atsauce uz citu dokumentu MongoDB datubāzē
    type: mongoose.Schema.Types.ObjectId,
    // Norāda, ka šis lauks atsaucas uz 'Driver' kolekciju
    ref: "Driver",
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true,
  },
  // Definē 'busStops' lauku shēmā kā masīvu
  busStops: [
    {
      // Nosaka datu tipu katram elementam kā ObjectId, kas ir atsauce uz citu dokumentu MongoDB datubāzē
      type: mongoose.Schema.Types.ObjectId,
      // Norāda, ka katrs elements atsaucas uz 'BusStop' kolekciju
      ref: "BusStop",
      // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
      required: true,
    },
  ],
  // Definē 'status_user' lauku shēmā
  status_user: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Nosaka iespējamo statusu kopu priekš šī lauka
    enum: [
      "Pieejams",
      "Nav pieejams",
      "Procesā",
      "Pilns",
      "Pabeigts",
      "Aktīvs",
    ],
    // Definē noklusējuma vērtību, ja šis lauks netiek aizpildīts
    default: "Pieejams",
  },
  // Definē 'status_admin' lauku shēmā
  status_admin: {
    // Nosaka datu tipu šim laukam kā String
    type: String,
    // Nosaka iespējamo vērtību kopu priekš šī lauka
    enum: ["Tukšs", "Aktīvs", "Pabeigts", "Atcelts", "Plānots"],
    // Definē noklusējuma vērtību, ja šis lauks netiek aizpildīts
    default: "Tukšs",
  },
  // Definē 'reservations' lauku shēmā kā masīvu
  reservations: [
    {
      // Nosaka datu tipu katram elementam kā ObjectId, kas ir atsauce uz citu dokumentu MongoDB datubāzē
      type: mongoose.Schema.Types.ObjectId,
      // Norāda, ka katrs elements atsaucas uz 'Reservation' kolekciju
      ref: "Reservation",
    },
  ],
  // Definē 'seatCount' lauku shēmā
  seatCount: {
    // Nosaka datu tipu šim laukam kā Number
    type: Number,
    // Pievieno validācijas noteikumu, ka šis lauks ir obligāti aizpildāms
    required: true,
    // Definē noklusējuma vērtību, ja šis lauks netiek aizpildīts
    default: 0,
  },
  // Definē 'created_at' lauku shēmā
  created_at: { 
    // Nosaka datu tipu šim laukam kā Date
    type: Date, 
    // Definē noklusējuma vērtību, kas būs pašreizējais datums un laiks, kad ieraksts tiek izveidots
    default: Date.now 
  },
});

// Eksportē Mongoose modeli ar nosaukumu 'Route', izmantojot iepriekš definēto shēmu 'routeSchema'
// 'mongoose.model' metode izveido un kompili Mongoose modeli no shēmas
module.exports = mongoose.model("Route", routeSchema);
