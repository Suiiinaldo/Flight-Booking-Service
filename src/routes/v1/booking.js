const express = require("express");
const { BookingController } = require("../../controller");

const router = express.Router();


router.post("/",
            BookingController.createBooking);

module.exports = router;
