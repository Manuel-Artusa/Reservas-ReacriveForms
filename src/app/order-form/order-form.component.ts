import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent {
  bookingForm:FormGroup

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

}
