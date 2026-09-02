import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcmanageChargeComponent } from './pages/bcmanage-charge/bcmanage-charge.component';
import { BcsubscriptionPaymentListComponent } from './pages/bcsubscription-payment-list/bcsubscription-payment-list.component';
import { BcsubscriptionPaymentComponent } from './pages/bcsubscription-payment/bcsubscription-payment.component';

const routes: Routes = [
  {
    path: 'manage-charge',
    component: BcmanageChargeComponent,
  },
  {
    path: 'payment-list',
    component: BcsubscriptionPaymentListComponent,
  },
  {
    path: 'payment',
    component: BcsubscriptionPaymentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BcsubscriptionRoutingModule {}
