const { StatusCodes } = require("http-status-codes");
const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const AppError = require("../utils/errors/app-error");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
const { Op } = require("sequelize");
const axios = require("axios");
const { ServerConfig } = require("../config");

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }
    
    async createBooking(data, transaction){
        const response = await this.model.create(data,{ transaction: transaction});
        return response;
    }

    async get(data,transaction){
        const response = await this.model.findByPk(data, { transaction: transaction });
        if(!response){
            throw new AppError("Not able to find the resource ", StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async update(id, data, transaction){
        const response = await this.model.update(data, {
            where: {
                id: id,
            }
        }, {transaction: transaction});
        return response;
    }

    async cancelOldBookings(timestamp){
        const bookings = await Booking.findAll({
            where: {
                [Op.and]:[
                    {
                        createdAt: {
                            [Op.lt] : timestamp
                        }
                    },
                    {
                        status : {
                            [Op.ne] : BOOKED,
                        }
                    },
                    {
                        status: {
                            [Op.ne] : CANCELLED,
                        }
                    }
                ]
            }
        });
        bookings.forEach(async (Booking) => {
            await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${Booking.dataValues.flightId}/seats`,{
                seats: Booking.dataValues.noOfSeats,
                dec: 0,
            });
        });
        const response = await Booking.update({status: CANCELLED},{
            where: {
                [Op.and]:[
                    {
                        createdAt: {
                            [Op.lt] : timestamp
                        }
                    },
                    {
                        status : {
                            [Op.ne] : BOOKED,
                        }
                    },
                    {
                        status: {
                            [Op.ne] : CANCELLED,
                        }
                    }
                ]
            }
        });
        return response;
    }
}

module.exports = BookingRepository;