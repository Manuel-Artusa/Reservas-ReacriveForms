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
  discount: number = 0;
  totalWhitDiscount : number = 0;

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
    this.bookingForm.valueChanges.subscribe(()=> this.calculateTotals())
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
  this.calculateTotals()
   
  } 
  get services():FormArray{
    return this.bookingForm.get('services') as FormArray
  }
  removeService(index:number){
    this.services.removeAt(index)
    this.calculateTotals()
  }
  generateOrderCode():string{
    const email = this.bookingForm.get('companyEmail')?.value
    const date = Date.now().toString().slice(-5)
    const partEmail = email.substring(0,3).toUpperCase();
    

    return partEmail+date
  }
  calculateTotals(){
    let total  = 0
    const totalPeople = this.bookingForm.get('totalPeople')?.value

    const vuenueId = this.bookingForm.get('venueId')?.value
    const venue = this.venues.find(v => v.id === vuenueId)
    const startTime = this.bookingForm.get('startTime')?.value
    const endTime = this.bookingForm.get('endTime')?.value

    if(venue && startTime && endTime){     
      const duration = calculateDurationInHours(startTime,endTime)
      total += duration *venue.pricePerHour
    }

    this.services.controls.forEach(serviceGroup => {
      const serviceId = serviceGroup.get('serviceId')?.value
      const quantity = serviceGroup.get('quantity')?.value
      const service = this.serviceList.find(s => s.id === serviceId)

      if(service){
        if(quantity >= service.minimumPeople){
          total += (service.pricePerPerson *quantity) 
        }
      }
    })
    this.totalAmount = total
    if(totalPeople >= 100){
      this.discount = total * 0.15
      this.totalWhitDiscount = total - this.discount
    }else{
      this.discount = 0 
    }
  }
  onSubmit():void{
    console.log(this.bookingForm.value)
    // if (this.bookingForm.valid){} encapsulando todo 
    const formValue = this.bookingForm.getRawValue()
    const serviceBooking : BookingService[] = formValue.services.map((s:BookingService)=>({
      serviceId :s.serviceId,
      quantity :s.quantity,
      pricePerPerson : s.pricePerPerson,
      startTime : s.startTime,
      endTime: s.endTime
    }))
    const booking:Booking = {
    bookingCode : this.generateOrderCode(),
    companyName: formValue.companyName,
    companyEmail: formValue.companyEmail,
    contactPhone: formValue.contactPhone,
    venueId: formValue.venueId,
    eventDate: formValue.eventDate,
    startTime: formValue.startTime,
    endTime: formValue.endTime,
    totalPeople: formValue.totalPeople,
    services: serviceBooking,
    totalAmount: this.totalWhitDiscount,
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
function calculateDurationInHours(startTime:string, endTime:string) {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;

  const durationInMinutes = endInMinutes - startInMinutes;
  const durationInHours = durationInMinutes / 60;

  return durationInHours;
}