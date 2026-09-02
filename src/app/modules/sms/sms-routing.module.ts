import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmsLogComponent } from './sms-log/sms-log.component';
import { CustomSmsComponent } from './custom-sms/custom-sms.component';
import { MemberSmsComponent } from './member-sms/member-sms.component';

const routes: Routes = [
  { path: 'sms-log', component: SmsLogComponent },
  {
    path: 'custom-sms',
    component: CustomSmsComponent,
  },
  {
    path: 'member-sms',
    component: MemberSmsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmsRoutingModule {}
