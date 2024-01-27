const express = require("express");

const { InfoController, BookingController } = require("../../controller");

const router = express.Router();

const bookingRoutes = require("./booking");

router.get("/info", InfoController.info);

router.use("/bookings", bookingRoutes);

module.exports = router;
