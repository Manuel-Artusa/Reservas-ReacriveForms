import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Booking } from '../../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private http: HttpClient = inject(HttpClient)
  private readonly url = 'http://localhost:3000/bookings'

  getBookings():Observable<Booking[]>{
    return this.http.get<Booking[]>(this.url)
  }
  postBooking(booking:Booking):Observable<Booking>{
    return this.http.post<Booking>(this.url,booking)
  }
  constructor() { }
}
