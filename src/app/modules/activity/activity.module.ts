import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityListComponent } from './pages/activity-list/activity-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrudModule } from '../crud/crud.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ActivityTypeComponent } from './pages/activity-type/activity-type.component';
import { ActivityTicketTypeComponent } from './pages/activity-ticket-type/activity-ticket-type.component';
import { ActivityTicketListComponent } from './pages/activity-ticket-list/activity-ticket-list.component';
import { ActivityTicketCreateComponent } from './pages/activity-ticket-create/activity-ticket-create.component';
import { VenueActivityTicketComponent } from './components/venue-activity-ticket/venue-activity-ticket.component';
import { EventActivityTicketComponent } from './components/event-activity-ticket/event-activity-ticket.component';
import { ServiceActivityTicketComponent } from './components/service-activity-ticket/service-activity-ticket.component';


@NgModule({
  declarations: [
    ActivityListComponent,
    ActivityTypeComponent,
    ActivityTicketTypeComponent,
    ActivityTicketListComponent,
    ActivityTicketCreateComponent,
    VenueActivityTicketComponent,
    EventActivityTicketComponent,
    ServiceActivityTicketComponent
  ],
  imports: [
    CommonModule,
    ActivityRoutingModule,
    SharedModule,
    CrudModule,
    SweetAlert2Module.forChild(),
  ]
})
export class ActivityModule { }
