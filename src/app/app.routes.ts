import { Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';
import { OrderListComponent } from './order-list/order-list.component';

export const routes: Routes = [
    { path: '', redirectTo: '/booking', pathMatch: 'full' },
    { path: 'create-booking', component: OrderFormComponent },
    { path: 'booking', component: OrderListComponent }
];
