import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private http:HttpClient = inject(HttpClient)
  private url = 'http://localhost:3000/availability'

  checkAvailability(venueId: string, eventDate: string): Observable<{ available: boolean }> {
    return this.http.get<{ id: string, venueId: string, date: string, available: boolean }[]>(`${this.url}?venueId=${venueId}&eventDate=${eventDate}`)
      .pipe(
        map(response => {
          // Verificamos que el array no esté vacío y tomamos el primer elemento
          const availability = response.length > 0 ? response[0].available : true;
          return { available: availability };
        })
      );
  }
  constructor() { }
}
