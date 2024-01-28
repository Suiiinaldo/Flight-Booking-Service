const axios  = require("axios");

const { BookingRepository } = require("../repositories");

const db = require("../models");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const bookingRepository = new BookingRepository();
const ENUMS = require("../utils/common/enums");
const {BOOKED, CANCELLED} = ENUMS.BOOKING_STATUS;

async function createBooking(data){
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        if(data.noOfSeats > flightData.totalSeats){
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
        // console.log(bookingPayload);
        const booking = await bookingRepository.create(bookingPayload,transaction);
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats,
        });
        await transaction.commit();
        return booking;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try {
        console.log("Inside Service");
        const bookingDetails = await bookingRepository.get(data.userId,transaction);
        console.log(bookingDetails);
        if(bookingDetails.status == CANCELLED){
            throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        console.log(bookingTime," ",currentTime);
        if(currentTime - bookingTime > 300000){
            await bookingRepository.update(data.bookingId, { status: CANCELLED}, { transaction: transaction});
            throw new AppError("The booking has expired ", StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError("The amount of payment does not match", StatusCodes.BAD_REQUEST);
        }

        if(bookingDetails.userId != data.userId){
            throw new AppError("The user corresponding to the booking does not match", StatusCodes.BAD_REQUEST);
        }

        //Now we assume the booking is done

        await bookingRepository.update(data.bookingId, { status: BOOKED}, { transaction: transaction});
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking,
    makePayment
}