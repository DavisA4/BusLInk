// Importējam express bibliotēku, lai izveidotu maršrutu (router)
const express = require("express");
const router = express.Router();
// Importējam Route modeli no datu bāzes
const Route = require("../database/Route");
// Importējam jsonwebtoken bibliotēku, lai strādātu ar JWT
const jwt = require("jsonwebtoken");
// Importējam BusStop modeli no datu bāzes
const BusStop = require("../database/BusStop");
// Importējam Reservation modeli no datu bāzes
const Reservation = require("../database/Reservation");
// Importējam Time modeli no datu bāzes
const Time = require("../database/Time");
// Importējam moment bibliotēku, lai strādātu ar datumiem un laikiem
const moment = require("moment");
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

// Maršruts, lai iegūtu visus maršrutus
router.get("/routes", async (req, res) => {
  try {
    // Iegūstam visus maršrutus no datu bāzes un papildinām ar saistītajiem dokumentiem
    const routes = await Route.find()
      .populate("driver")
      .populate("busStops")
      .populate({
        path: "reservations",
        select: "firstname lastname from_to status_user",
        populate: {
          path: "user",
          model: "User",
          select: "name",
        },
      });
    // Atgriežam maršrutus ar statusa kodu 200
    res.status(200).json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai pievienotu jaunu maršrutu
router.post("/add-route", async (req, res) => {
  try {
    // Iegūstam datus no pieprasījuma ķermeņa
    const {
      name,
      date,
      driver,
      busStops,
      seat_count,
      status_user,
      status_admin,
    } = req.body;

    // Saglabājam katru jauno pieturu datu bāzē un iegūstam to ID
    const busStopDocs = await Promise.all(
      busStops.map(async (busStop) => {
        const newBusStop = new BusStop(busStop);
        await newBusStop.save();
        return newBusStop._id;
      })
    );

    // Izveidojam jaunu maršruta objektu
    const newRoute = new Route({
      name,
      date,
      driver,
      busStops: busStopDocs,
      seatCount: seat_count,
      status_user,
      status_admin,
    });

    // Saglabājam jauno maršrutu datu bāzē
    await newRoute.save();
    res.status(201).json({ message: "Route added successfully" });
  } catch (error) {
    console.error("Error adding route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai rezervētu maršrutu, izmantojot JWT autentifikāciju
router.post("/apply-route", authenticateJWT, async (req, res) => {
  try {
    // Iegūstam datus no pieprasījuma ķermeņa
    const { routeId, firstname, lastname, from_to } = req.body;
    // Iegūstam lietotāja ID no autentificētā lietotāja
    const { userId } = req.user;

    // Atrodam maršrutu pēc ID
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Pārbaudām, vai lietotājs jau ir veicis rezervāciju
    const existingReservation = await Reservation.findOne({
      route: routeId,
      user: userId,
    });

    if (existingReservation) {
      return res
        .status(400)
        .json({ message: "You have already reserved this route" });
    }

    // Izveidojam jaunu rezervācijas objektu
    const reservation = new Reservation({
      route: routeId,
      user: userId,
      firstname,
      lastname,
      from_to,
      status_user: "Rezervēts", // Iestatām sākotnējo rezervācijas statusu
    });

    // Saglabājam rezervāciju datu bāzē
    await reservation.save();

    // Pievienojam rezervācijas ID maršrutam
    route.reservations.push(reservation._id);

    // Pārbaudām, vai visas sēdvietas ir aizņemtas
    const allSeatsTaken = route.reservations.length >= route.seatCount;

    // Ja visas sēdvietas ir aizņemtas, atjauninām maršruta statusu uz "Pilns"
    if (allSeatsTaken) {
      route.status_user = "Pilns";
    } else {
      route.status_admin = "Plānots";
    }

    // Saglabājam atjaunināto maršrutu datu bāzē
    await route.save();

    res
      .status(200)
      .json({ message: "Route reserved successfully", reservation });
  } catch (error) {
    console.error("Error reserving route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai atjauninātu esošu maršrutu
router.put("/update-route/:id", async (req, res) => {
  try {
    // Iegūstam maršruta ID no URL parametriem
    const routeId = req.params.id;
    // Iegūstam atjauninātos datus no pieprasījuma ķermeņa
    const {
      name,
      date,
      driver,
      busStops,
      seat_count,
      status_user,
      status_admin,
    } = req.body;

    // Atrodam maršrutu pēc ID un papildinām ar saistītajiem busStops
    const route = await Route.findById(routeId).populate("busStops");
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Iegūstam pirmās pieturas laiku un datumu
    const firstBusStop = await BusStop.findById(route.busStops[0]);
    const routeStartDateTime = moment(route.date).set({
      hour: firstBusStop.time.split(":")[0],
      minute: firstBusStop.time.split(":")[1],
    });

    // Iegūstam izpildes termiņu no datu bāzes
    const timeFromDB = await Time.findOne();
    if (!timeFromDB) {
      return res
        .status(500)
        .json({ message: "Internal server error: time not found in database" });
    }

    // Aprēķinām cutoff laiku
    const cutoffTime = routeStartDateTime.subtract(24, "hours").set({
      hour: timeFromDB.time.split(":")[0],
      minute: timeFromDB.time.split(":")[1],
    });

    // Pārbaudām, vai pašreizējais laiks ir pēc cutoff laika
    const currentTime = moment();
    if (currentTime.isAfter(cutoffTime)) {
      return res.status(403).json({
        message: `Nevar rediģēt reisu pēc iepriekšējas dienas ${timeFromDB.time}`,
      });
    }

    // Saglabājam atjauninātos pieturas dokumentus datu bāzē
    const updatedBusStopDocs = await Promise.all(
      busStops.map(async (busStop) => {
        const time =
          typeof busStop.time === "string"
            ? busStop.time
            : busStop.time.toString();

        if (busStop._id) {
          await BusStop.findByIdAndUpdate(busStop._id, {
            name: busStop.name,
            time: time,
            about: busStop.about,
          });
          return busStop._id;
        } else {
          const newBusStop = new BusStop({ ...busStop, time: time });
          await newBusStop.save();
          return newBusStop._id;
        }
      })
    );

    // Atjauninām maršruta objektu
    const updatedRoute = await Route.findByIdAndUpdate(routeId, {
      name,
      date,
      driver,
      busStops: updatedBusStopDocs,
      seatCount: seat_count,
      status_user,
      status_admin,
    });

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json({ message: "Route updated successfully" });
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Maršruts, lai atceltu rezervāciju, izmantojot JWT autentifikāciju
router.post("/cancel-reservation", authenticateJWT, async (req, res) => {
  try {
    // Iegūstam rezervācijas ID no pieprasījuma ķermeņa
    const { reservationId } = req.body;
    // Iegūstam lietotāja ID no autentificētā lietotāja
    const { userId } = req.user;

    // Atrodam rezervāciju pēc ID un papildinām ar maršrutu
    const reservation = await Reservation.findById(reservationId).populate(
      "route"
    );
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Pārbaudām, vai lietotājs atceļ savu rezervāciju
    if (reservation.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own reservations" });
    }

    // Atrodam maršrutu pēc ID un papildinām ar pieturām
    const route = await Route.findById(reservation.route._id).populate(
      "busStops"
    );
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Iegūstam izpildes termiņu no datu bāzes
    const timeFromDB = await Time.findOne();
    if (!timeFromDB) {
      return res
        .status(500)
        .json({ message: "Internal server error: time not found in database" });
    }

    // Aprēķinām cutoff laiku, atņemot izpildes termiņu no maršruta sākuma laika
    const cancellationCutoffDate = moment(route.date).subtract(
      timeFromDB.time,
      "hours"
    );

    // Pārbaudām pašreizējo laiku salīdzinājumā ar cutoff laiku
    const currentTime = moment();
    if (currentTime.isBefore(cancellationCutoffDate)) {
      // Ja atcelšana notiek pirms cutoff laika, dzēšam rezervāciju
      await Reservation.findByIdAndDelete(reservationId);
      route.reservations.pull(reservationId);
      if (route.reservations.length === 0) {
        route.status_admin = "Tukšs";
      }
      await route.save();
      res.status(200).json({ message: "Reservation cancelled successfully" });
    } else {
      // Ja atcelšana notiek pēc cutoff laika, atjauninām rezervācijas statusu
      reservation.status_user = "Atcelts";
      await reservation.save();
      res
        .status(200)
        .json({ message: "Reservation status updated to 'Atcelts'" });
    }
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Eksportējam maršrutus (router), lai tos izmantotu citos failos
module.exports = router;
