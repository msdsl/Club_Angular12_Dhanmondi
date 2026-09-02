import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageChargeComponent } from './pages/manage-charge/manage-charge.component';
import { SubscriptionPaymentListComponent } from './pages/subscription-payment-list/subscription-payment-list.component';
import { SubscriptionPaymentComponent } from './pages/subscription-payment/subscription-payment.component';

const routes: Routes = [
  {
    path:'manage-charge',
    component:ManageChargeComponent
  },
  {
    path:'payment-list',
    component:SubscriptionPaymentListComponent
  },
  {
    path:'payment',
    component:SubscriptionPaymentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
