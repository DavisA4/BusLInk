const cron = require("node-cron");
const moment = require("moment");
const Reservation = require("../database/Reservation");
const Route = require("../database/Route");
const Time = require("../database/Time");

// Izveido cron darbību, kas izpildīsies ik minūti
const cronJob = cron.schedule("* * * * *", async () => {
  try {
    // Iegūst laiku no datubāzes
    const timeFromDB = await Time.findOne();
    if (!timeFromDB) {
      console.error("Time not found in database");
      return;
    }

    // Pašreizējais laiks
    const currentTime = moment();

    // Iegūst visas maršrutu dati no datubāzes, iekļaujot autobusa pieturas
    const routes = await Route.find().populate("busStops");

    // Iterē caur visiem maršrutiem
    for (const route of routes) {
      if (!route.busStops.length) {
        console.error("No bus stops found for route:", route._id);
        continue;
      }

      // Pirmā un pēdējā autobusa pietura
      const firstBusStop = route.busStops[0];
      const lastBusStop = route.busStops[route.busStops.length - 1];

      // Maršruta sākuma un beigu laiks
      const routeStartDateTime = moment(route.date).set({
        hour: firstBusStop.time.split(":")[0],
        minute: firstBusStop.time.split(":")[1],
      });

      const routeEndDateTime = moment(route.date).set({
        hour: lastBusStop.time.split(":")[0],
        minute: lastBusStop.time.split(":")[1],
      });

      // Intervāla sākuma un beigu laiks
      const intervalStart = routeStartDateTime
        .clone()
        .subtract(1, "days")
        .set({
          hour: timeFromDB.time.split(":")[0],
          minute: timeFromDB.time.split(":")[1],
        });

      const intervalEnd = routeStartDateTime;

      // Aktīvās rezervācijas intervāla sākuma un beigu laiks
      const aktivsIntervalStart = routeStartDateTime;
      const aktivsIntervalEnd = routeEndDateTime;

      // Ja pašreizējais laiks atrodas intervāla ietvaros, atjauno rezervāciju statusu uz "Procesā"
      if (currentTime.isBetween(intervalStart, intervalEnd)) {
        await Reservation.updateMany(
          {
            route: route._id,
            status_user: "Rezervēts",
          },
          { $set: { status_user: "Procesā" } }
        );
      }

      // Ja pašreizējais laiks atrodas aktīvās rezervācijas intervāla ietvaros, atjauno rezervāciju statusu uz "Aktīvs"
      if (currentTime.isBetween(aktivsIntervalStart, aktivsIntervalEnd)) {
        await Reservation.updateMany(
          {
            route: route._id,
            status_user: "Procesā",
          },
          { $set: { status_user: "Aktīvs" } }
        );
      }
    }
  } catch (error) {
    console.error("Error updating reservation status:", error);
  }
});

module.exports = {
  cronJob,
};
