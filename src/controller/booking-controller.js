const { BookingService } = require("../services");
const { StatusCodes} = require("http-status-codes");
const { SuccessResponse, ErrorResponse} = require("../utils/common");
const { ServerConfig } = require("../config");
const jwt = require("jsonwebtoken");

/*
 * POST : /bookings 
 * req-body : {flightId: 1, userId: 1 , noOfSeats : 2 }
 */
async function createBooking(req,res){
    try {
        // console.log("Inside Controller");
        // console.log(req.body);
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats,
        });
        SuccessResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);   
    } catch (error) {
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

async function makePayment(req,res){
    try {
        // console.log("Inside controller")
        const recepientUser =jwt.verify(req.headers['x-access-token'],ServerConfig.JWT_SECRET);
        // console.log(recepientUser);
        const response = await BookingService.makePayment({
            totalCost: req.body.totalCost,
            userId: req.body.userId,
            bookingId: req.body.bookingId,
            email: recepientUser.email,
        })
        SuccessResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
        console.log(error);
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    makePayment
}