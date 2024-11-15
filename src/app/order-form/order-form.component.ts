import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { VenueService } from '../service/venue.service';
import { Service, Venue, BookingService, Booking } from '../../interfaces';
import { ServiceService } from '../service/service.service';
import { BookingsService } from '../service/booking.service';
import { map, of } from 'rxjs';
import { AvailabilityService } from '../service/availability.service';


@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent implements OnInit {
  ngOnInit(): void {
    this.loadServices();
    this.loadVenues();
    this.bookingForm.valueChanges.subscribe(() => this.calculateTotals())
  }
  bookingServices: BookingsService = inject(BookingsService);
  venueServices: VenueService = inject(VenueService);
  availabilityService : AvailabilityService = inject(AvailabilityService)
  venuesList: Venue[] = [];
  serviceServices: ServiceService = inject(ServiceService);
  serviceList: Service[] = [];
  bookingForm: FormGroup;
  router: Router = inject(Router);
  totalAmount:number = 0;
  discount:number = 0;
  totalWhitDiscount:number = 0;
  totalService:number = 0;

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      companyName: ['', Validators.required],
      companyEmail: ['',[ Validators.required,Validators.email],[]],
      companyPhone: ['', Validators.required],
      venueId: ['', Validators.required],
      eventDate: ['', Validators.required],
      starTime: ['', Validators.required],
      endTime: ['', Validators.required],
      totalPeople: ['', Validators.required],
      services: this.fb.array([]),
    });
  }
  checkAvailability(control: AbstractControl) {
    const venueId = this.bookingForm.get('eventDate')?.value;
    const eventDate = control.value; 

    if (!venueId || !eventDate) {
      return of({ required: true });
    }
    return this.availabilityService.checkAvailability(venueId, eventDate).pipe(
      map(Available => (Available ? null : { notAvailable: true }))
    );
  }

  addServices() {
    const serviceGroup = this.fb.group({
      serviceId: ['', Validators.required],
      quantity: ['', Validators.required],
      starTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
    this.services.push(serviceGroup);
  }
  get services(): FormArray {
    return this.bookingForm.get('services') as FormArray;
  }
  goLista() {
    this.router.navigate(['booking']);
  }
  loadVenues(): void {
    this.venueServices.getVenues().subscribe({
      next: (venues: Venue[]) => {
        this.venuesList = venues;
      },
      error() {
        alert('error al cargar las venues');
      },
    });
  }
  loadServices(): void {
    this.serviceServices.getServices().subscribe({
      next: (services: Service[]) => {
        this.serviceList = services;
      },
      error() {
        alert('error al cargar las services');
      },
    });
  }
  onSubmit() {
    console.log(this.bookingForm.value);
    const formValue = this.bookingForm.getRawValue();
    const bookingService: BookingService[] = formValue.services.map(
      (service: BookingService) => ({
        serviceId: service.serviceId,
        quantity: service.quantity,
        pricePerPerson: service.pricePerPerson,
        startTime: service.startTime,
        endTime: service.endTime,
      })
    );

    const booking: Booking = {
      companyName: formValue.companyName,
      companyEmail: formValue.companyEmail,
      contactPhone: formValue.contactPhone,
      venueId: formValue.venueId,
      eventDate: formValue.eventDate,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      totalPeople: formValue.totalPeople,
      services: bookingService,
      status: 'pending',
      createdAt: new Date(),
      totalAmount: this.totalWhitDiscount,
      bookingCode: this.generateBookingCode()
    };
    this.bookingServices.postBooking(booking).subscribe({
      next: (response) => {
        console.log('tremenda pa', response);
        alert('se subio como tu hermana');
        this.bookingForm.reset();
        this.services.clear();
      },
      error() {
        alert('ta mal');
      },
    });
  }
  calculateTotals():void{
    let total = 0;    
    const totalPeople = this.bookingForm.get('totalPeople')?.value


    const startTime = this.bookingForm.get('starTime')?.value
    const endTime = this.bookingForm.get('endTime')?.value
    const venueId = this.bookingForm.get('venueId')?.value
    const venue = this.venuesList.find(v => v.id === venueId)

    if(venue && startTime && endTime){
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      const eventDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      total += eventDuration *venue.pricePerHour
    }
    this.services.controls.forEach(serviceGroup => {
      const serviceId = serviceGroup.get('serviceId')?.value
      const quantity = serviceGroup.get('quantity')?.value

      const service = this.serviceList.find(s => s.id === serviceId)
      this.totalService = total
      if(service){
        if(service.minimumPeople <= quantity){
          total += (quantity * service.pricePerPerson)
          
        }
      }
    });
    this.totalAmount = total
    if(totalPeople >= 100){
      this.discount = total * 0.15
      this.totalWhitDiscount = total -this.discount
    }else{
      this.discount = 0
      this.totalWhitDiscount = total
    }

  }
  removeService(index: number){
    this.services.removeAt(index)
  }
  generateBookingCode():string{
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}
