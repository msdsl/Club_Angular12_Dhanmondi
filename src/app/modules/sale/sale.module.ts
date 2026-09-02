import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaleRoutingModule } from './sale-routing.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CrudModule } from '../crud/crud.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/@shared/AlertService';
import { ToastrModule } from 'ngx-toastr';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { VenueBookingListComponent } from './venue/pages/venue-booking-list/venue-booking-list.component';
import { VenueBookingCreateComponent } from './venue/pages/venue-booking-create/venue-booking-create.component';
import { EventTicketSaleListComponent } from './event/pages/event-ticket-sale-list/event-ticket-sale-list.component';
import { EventTicketSaleCreateComponent } from './event/pages/event-ticket-sale-create/event-ticket-sale-create.component';
import { EventTicketDetailsComponent } from './event/components/event-ticket-details/event-ticket-details.component';
import { ServiceTicketSaleListComponent } from './service/pages/service-ticket-sale-list/service-ticket-sale-list.component';
import { ServiceTicketSaleCreateComponent } from './service/pages/service-ticket-sale-create/service-ticket-sale-create.component';

@NgModule({
  declarations: [
    VenueBookingListComponent,
    VenueBookingCreateComponent,
    EventTicketSaleListComponent,
    EventTicketSaleCreateComponent,
    EventTicketDetailsComponent,
    ServiceTicketSaleListComponent,
    ServiceTicketSaleCreateComponent,
  ],
  imports: [
    CommonModule,
    SaleRoutingModule,
    NgbModule,
    NgbTimepickerModule,
    SharedModule,
    CrudModule,
    SweetAlert2Module.forChild(),
    ToastrModule.forRoot(),
    NgxDocViewerModule,
  ],
  providers: [AlertService],
})
export class SaleModule {}
