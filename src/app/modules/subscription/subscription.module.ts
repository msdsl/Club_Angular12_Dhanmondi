import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { ManageChargeComponent } from './pages/manage-charge/manage-charge.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SubscriptionPaymentListComponent } from './pages/subscription-payment-list/subscription-payment-list.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { SubscriptionPaymentComponent } from './pages/subscription-payment/subscription-payment.component';


@NgModule({
  declarations: [
    ManageChargeComponent,
    SubscriptionPaymentListComponent,
    SubscriptionPaymentComponent
  ],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    SharedModule,
    SweetAlert2Module.forChild(),
    NgxDocViewerModule,
  ]
})
export class SubscriptionModule { }
