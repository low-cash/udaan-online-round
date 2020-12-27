import { Injectable , Query} from "@nestjs/common"
import { callbackify } from "util";

import * as data from './data.json'

@Injectable()
export class City{
    name: string  ;
    id: number ;
    static count : number = 0;
    constructor(name : string ){
        this.name = name ;
        this.id = ++City.count;
    }

}
@Injectable()
export class Flight{
    static counter : number  = 0;
    id : number ;
    airlineName: string ;
    source : City ;
    destination: City ;
    freq : number[] = [];
    capacity: number ;
    bookedSeats : Map< string , number >;
    startTime : string;
    endTime :string ;

    constructor(comp: string , source: City , desc : City , c : number , freq : number[], end: string, start: string){
        this.id = Flight.counter++ ;
        this.airlineName = comp;
        this.source = source;
        this.destination = desc;
        this.capacity = c ;
        this.freq = freq;
        this.bookedSeats = new Map <string , number >() ;
        this.startTime = start;
        this.endTime = end;
    }

    getDetails(){
        let days : string[] = ["Sun", "Mon" , "Tues" , "Wed", "Thurs" , "Fri" , "Sat"];
        let working : string[] = [];
        this.freq.forEach( (value : number , index : number) => {
            if(value === 1){
                working.push(days[index]);
            }
        })
        console.log(working);
        return{
            id : this.id,
            source: this.source,
            destination : this.destination,
            airline : this.airlineName,
            frequency : working,
            startTime : this.startTime,
            endTime : this.endTime,
            capacity : this.capacity
        }
    }

}
@Injectable()
export class User{
    static numberOfUser : number = 0;
    name: string ;
    id : number ;
    bookings: Map< number , Booking >;
    constructor(name : string ){
        this.name = name;
        this.id = User.numberOfUser++;
        this.bookings = new Map < number , Booking>();
    }

    getDetails(){
        let result : any[] = [];
        this.bookings.forEach((value : Booking) => {
            result.push(value);
        })
        if(result.length === 0){
            return{
                message : "No bookings"
            }
        }
        else return result;
    }
}
@Injectable()
export class Booking {
    static numberOfBookings : number = 0;
    bookingID: number ;
    flight : number ;
    user: number ;
    seats: number ;
    date : string ;
    constructor(f: number , user: number , cnt : number, date : string ){
        this.flight = f;
        this.user = user;
        this.seats = cnt;
        this.bookingID = ++Booking.numberOfBookings;
        this.date = date;
    }
}


@Injectable()
export class ReservationService{
    users : Map < number , User> ;
    flights : Map< number , Flight > ;

    cities: City[]=[];

    constructor() {
        this.cities = [];
        this.users = new Map<number , User >();
        this.flights = new Map<number , Flight >();
        for(let i =1 ; i <= 10 ; i++){
            this.cities.push(new City("City" + i.toString()));
        }
        data.forEach( val => {
            let createNewFlight = new Flight(val.airline , this.cities[val.source] , this.cities[val.destination] , val.capacity, val.frequency, val.endTime, val.startTime);
            this.flights.set(createNewFlight.id , createNewFlight);
            console.log(createNewFlight);
        })

        this.addUser("Lokesh");
    }

    getCities() : any {
        return this.cities;
    }

    getUsers(): any {
        let res : any[] = [];

        this.users.forEach( (value : User ) => {
            res.push({
                id : value.id,
                name : value.name
            });
        }
        )
        if( res.length === 0){
            return{
                message : "No users in data, add users"
            }
        }
        else return res;
    }

    addUser(name: string) {
        let newUser = new User(name);
        this.users.set(newUser.id , newUser);
        return { "success" : true }
    }

    bookTicket(req: any){
        let fID : number = req.flightID ;
        let userID: number = req.userID;
        let date = new Date(req.date);
        let day = date.getDay();
        if(this.flights.has(fID) === false ){
            return{
                success: false,
                message: "FlightID not valid , check the list of flights and select correct ID"
            }
        }
        if( this.users.has(userID) === false ){
            return{
                success: false,
                message: "UserID not valid , check the list of users and select correct ID or add new user"
            }
        }

        let flight = this.flights.get(fID);
        if( flight.freq[day] === 0 ){
            return {
                success : false,
                message: "This flight doesn't run on this day, check flight details"
            }
        }
        let booked : number = 0;
        if (flight.bookedSeats.has(req.date) === true ){
            booked = flight.bookedSeats.get(req.date);
        }
        let cap = flight.capacity;
        if(cap - booked >= req.count){
            flight.bookedSeats.set(req.date , booked + req.count );
            let newBooking = new Booking(fID , userID , req.count, req.date);

            this.users.get(userID).bookings.set(newBooking.bookingID , newBooking);
            return {
                success : false,
                message  : "Flight booked !!!",
                totalBooked : booked + req.count
            }
        }
        else{
            return{
                success : false,
                message  : "Not enough seats for this date",
                totalBooked : booked
            }
        }
    }

    searchForFlight(req : any){
        let src = req.source;
        let desc = req.des;
        let date = new Date(req.date);

        let day = date.getDay();
        let result : any[] = [];

        this.flights.forEach((value : Flight) =>{
            if(value.source.name === src && value.destination.name === desc && value.freq[day] === 1 ){
                result.push(value.getDetails());
            }
        })

        if( result.length == 0 ) return { "message" : "No flights found, check spellings for cities and flight data"};
        else return result;
    }

    getAllFlights(){
        console.log("All Flights requested");

        let res : any[] = [];
        this.flights.forEach( (value : Flight) => {
            res.push(value.getDetails());
        })
        return res;
    }

    getUserDetails( req : any) {
        let userID: number = req.userID;
        if( this.users.has(userID) === false ){
            return{
                success: false,
                message: "UserID not valid , check the list of users and select correct ID or add new user"
            }
        }
        return this.users.get(userID).getDetails();

    }
}