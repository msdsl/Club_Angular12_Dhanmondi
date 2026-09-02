import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BcsubscriptionRoutingModule } from './bcsubscription-routing.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { SharedModule } from 'src/app/shared/shared.module';
import { BcmanageChargeComponent } from './pages/bcmanage-charge/bcmanage-charge.component';
import { BcsubscriptionPaymentComponent } from './pages/bcsubscription-payment/bcsubscription-payment.component';
import { BcsubscriptionPaymentListComponent } from './pages/bcsubscription-payment-list/bcsubscription-payment-list.component';

@NgModule({
  declarations: [
    BcmanageChargeComponent,
    BcsubscriptionPaymentComponent,
    BcsubscriptionPaymentListComponent,
  ],
  imports: [
    CommonModule,
    BcsubscriptionRoutingModule,
    SharedModule,
    SweetAlert2Module.forChild(),
    NgxDocViewerModule,
  ],
})
export class BcsubscriptionModule {}
