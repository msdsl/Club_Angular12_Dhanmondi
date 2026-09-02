import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { AppDownloadComponent } from './pages/app-download/app-download.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { EventTicketReportComponent } from './pages/event-ticket-report/event-ticket-report.component';
import { VenueBookingReportComponent } from './pages/venue-booking-report/venue-booking-report.component';
import { ServiceSaleReportComponent } from './pages/service-sale-report/service-sale-report.component';
import { MemberLedgerReportComponent } from './pages/member-ledger-report/member-ledger-report.component';
import { TopupReportComponent } from './pages/topup-report/topup-report.component';
import { MemberAttandanceReportComponent } from './pages/member-attandance-report/member-attandance-report.component';
import { SubscriptionReportComponent } from './pages/subscription-report/subscription-report.component';
import { RefundReportComponent } from './pages/refund-report/refund-report.component';
import { EmailLedgerReportComponent } from './pages/email-ledger-report/email-ledger-report.component';

@NgModule({
  declarations: [
    AppDownloadComponent,
    EventTicketReportComponent,
    VenueBookingReportComponent,
    ServiceSaleReportComponent,
    MemberLedgerReportComponent,
    TopupReportComponent,
    MemberAttandanceReportComponent,
    SubscriptionReportComponent,
    RefundReportComponent,
    EmailLedgerReportComponent,
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule,
    NgxDocViewerModule,
  ],
})
export class ReportModule {}
