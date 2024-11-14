import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Booking, BookingService, Venue } from '../../interfaces';
import { BookingsService } from '../service/bookings.service';
import { VenueService } from '../service/venue.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CurrencyPipe,FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {



  bookingService: BookingsService = inject(BookingsService)
  venueService:VenueService = inject(VenueService)
  bookings:Booking[] = []
  filteredBookings:Booking[] =[]
  venues:Venue[] = []
  searchTerm:string =  '';
  ngOnInit(): void {
    this.loadBookings()
    this.loadVenues()
  }
  loadBookings() {
    this.bookingService.getBookings().subscribe({
      next:(bookings:Booking[])=>{
        this.bookings = bookings
        this.filteredBookings = bookings
      },
      error(err){
        alert('error al cargar los bookings')
      }
    })
  }
  loadVenues(){
    this.venueService.getVenues().subscribe({
      next:(venues:Venue[])=>{
        this.venues = venues
      },
      error(err){
        alert('error al cargar las venues')
      }
    })
  }
  getVenueName(id: string) {
    const venue = this.venues.find((v)=> v.id === id)
    return venue?.name
  }
  filterBooking() {
    if(!this.searchTerm.trim()){
      this.filteredBookings= this.bookings
      return;
    }
    const toLower = this.searchTerm.toLowerCase().trim()
    this.filteredBookings = this.bookings.filter(booking => 
      booking.companyEmail.toLowerCase().includes(toLower)||
      booking.bookingCode?.toLowerCase().includes(toLower)
    )
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}
