const axios  = require("axios");

const { BookingRepository } = require("../repositories");

const db = require("../models");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

async function createBooking(data){
    return new Promise((reject, resolve) => {
        // console.log("Inside Service");
        const result = db.sequelize.transaction(async function bookingImpl(t) {
            console.log("Booking Impl");
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            // console.log(flight);
            const flightData = flight.data.data;
            if(data.noOfSeats > flightData.totalSeats){
                reject(new AppError('Not enough seats available', StatusCodes.BAD_REQUEST));
            }
            resolve(true);
        });
    });
}

module.exports = {
    createBooking
}