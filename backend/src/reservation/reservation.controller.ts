import {Controller , Get , Body, Query , Post} from "@nestjs/common";

import { Booking, ReservationService } from "./reservation.service";

@Controller("/api")
export class ReservationController {
    constructor (private readonly reservationService : ReservationService) { }
    // to get data of all the cities
    @Get("/allCities")
    async getCities(@Query() q) {
        return this.reservationService.getCities();
    }
    // to get data of all the users
    @Get("/allUsers")
    async getUsers(@Query() q){
        return this.reservationService.getUsers();
    }

    @Get("/allFlights")
    async getAllFlights(@Query() q){
        return this.reservationService.getAllFlights();
    }

    @Post("/addUser")
    async addUser(@Body() b){
        return this.reservationService.addUser(b.name);
    }

    @Post("/book")
    async bookTicket(@Body() req){
        return this.reservationService.bookTicket(req);
    }

    @Post("/search")
    async searchForFlight(@Body() req){
        return this.reservationService.searchForFlight(req);
    }

    @Post("/userDetails")
    async getUserDetails(@Body() req) {
        return this.reservationService.getUserDetails(req);
    }


}