import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VenueBookingListComponent } from './venue/pages/venue-booking-list/venue-booking-list.component';
import { VenueBookingCreateComponent } from './venue/pages/venue-booking-create/venue-booking-create.component';
import { EventTicketSaleListComponent } from './event/pages/event-ticket-sale-list/event-ticket-sale-list.component';
import { EventTicketSaleCreateComponent } from './event/pages/event-ticket-sale-create/event-ticket-sale-create.component';
import { EventTicketDetailsComponent } from './event/components/event-ticket-details/event-ticket-details.component';
import { ServiceTicketSaleListComponent } from './service/pages/service-ticket-sale-list/service-ticket-sale-list.component';
import { ServiceTicketSaleCreateComponent } from './service/pages/service-ticket-sale-create/service-ticket-sale-create.component';

const routes: Routes = [
  {
    path:'venue-booking/list',
    component: VenueBookingListComponent
  },
  {
    path:'venue-booking/create',
    component: VenueBookingCreateComponent
  },
  {
    path:'event-ticket/list',
    component: EventTicketSaleListComponent
  },
  {
    path:'event-ticket/create',
    component: EventTicketSaleCreateComponent
  },
  {
    path:'event-ticket/detail',
    component: EventTicketDetailsComponent
  },
  {
    path:'service-ticket/list',
    component: ServiceTicketSaleListComponent
  },
  {
    path:'service-ticket/create',
    component: ServiceTicketSaleCreateComponent
  },
  // {
  //   path:'slot-settings/create',
  //   component: SlotSettingsCreateComponent
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaleRoutingModule { }
