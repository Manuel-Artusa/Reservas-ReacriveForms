import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../service/service.service';
import { Booking, BookingService, Service, Venue } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { VenueService } from '../service/venue.service';
import { getRandomValues } from 'crypto';
import { BookingsService } from '../service/bookings.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent implements OnInit{
  serviceService:ServiceService = inject(ServiceService)
  serviceList:Service[] = []
  venueService:VenueService = inject(VenueService)
  venues:Venue[] = []
  bookingService:BookingsService = inject(BookingsService)

  bookingForm:FormGroup
  totalAmount: number =0;

  constructor(private fb:FormBuilder){ 
    this.bookingForm = this.fb.group({
      companyName:['',Validators.required],
      companyEmail:['',Validators.required],
      contactPhone:['',Validators.required],
      venueId:['',Validators.required],
      eventDate:['',Validators.required],
      startTime:['',Validators.required],
      endTime:['',Validators.required],
      totalPeople:['',Validators.required],
      services: this.fb.array([]),
    })

  }
  ngOnInit(): void {
    this.loadServices()
    this.loadVenues()
  }
  loadServices() {
    this.serviceService.getServices().subscribe({
      next:(services:Service[])=>{
        this.serviceList = services
      },
      error(err){
        alert('error al cargar los services')
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
  addService(){
    const serviceGroup = this.fb.group({
      serviceId:['',Validators.required],
      quantity:['',Validators.required],
      startTime:['',Validators.required],
      endTime:['',Validators.required],
  })
  this.services.push(serviceGroup)

  }
  get services():FormArray{
    return this.bookingForm.get('services') as FormArray
  }
  onSubmit():void{
    console.log(this.bookingForm.value)
    const formValue = this.bookingForm.getRawValue()
    const serviceBooking : BookingService[] = formValue.services.map((s:BookingService)=>({
      serviceId :s.serviceId,
      quantity :s.quantity,
      pricePerPerson : s.pricePerPerson,
      startTime : s.startTime,
      endTime: s.endTime
    }))
    const booking:Booking = {
    bookingCode : '',
    companyName: formValue.companyName,
    companyEmail: formValue.companyEmail,
    contactPhone: formValue.contactPhone,
    venueId: formValue.venueId,
    eventDate: formValue.eventDate,
    startTime: formValue.startTime,
    endTime: formValue.endTime,
    totalPeople: formValue.totalPeople,
    services: serviceBooking,
    totalAmount: this.totalAmount,
    status: 'pending' ,
    createdAt: new Date(),
    }
    
    this.bookingService.postBooking(booking).subscribe({
      next:(response)=>{
        alert('se creo exitosamente')
        this.bookingForm.reset()
        this.services.clear()


      },
      error(err){
        alert('error al crear el booking')
      }
    })
  }
  
}
