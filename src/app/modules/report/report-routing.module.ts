import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppDownloadComponent } from './pages/app-download/app-download.component';
import { EventTicketReportComponent } from './pages/event-ticket-report/event-ticket-report.component';
import { VenueBookingReportComponent } from './pages/venue-booking-report/venue-booking-report.component';
import { ServiceSaleReportComponent } from './pages/service-sale-report/service-sale-report.component';
import { MemberLedgerReportComponent } from './pages/member-ledger-report/member-ledger-report.component';
import { TopupReportComponent } from './pages/topup-report/topup-report.component';
import { MemberAttandanceReportComponent } from './pages/member-attandance-report/member-attandance-report.component';
import { SubscriptionReportComponent } from './pages/subscription-report/subscription-report.component';
import { RefundReportComponent } from './pages/refund-report/refund-report.component';
import { EmailLedgerReportComponent } from './pages/email-ledger-report/email-ledger-report.component';

const routes: Routes = [
  {
    path: 'app-download-report',
    component: AppDownloadComponent,
  },
  {
    path: 'event-ticket-report',
    component: EventTicketReportComponent,
  },
  {
    path: 'venue-booking-report',
    component: VenueBookingReportComponent,
  },
  {
    path: 'service-sale-report',
    component: ServiceSaleReportComponent,
  },
  {
    path: 'member-ledger-report',
    component: MemberLedgerReportComponent,
  },
  {
    path: 'top-up-report',
    component: TopupReportComponent,
  },
  {
    path: 'member-attendance-report',
    component: MemberAttandanceReportComponent,
  },
  {
    path: 'subscription-report',
    component: SubscriptionReportComponent,
  },
  {
    path: 'refund-report',
    component: RefundReportComponent,
  },
  {
    path: 'email-ledger',
    component: EmailLedgerReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
