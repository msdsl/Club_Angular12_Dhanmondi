import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmsRoutingModule } from './sms-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CrudModule } from '../crud/crud.module';
import { SmsLogComponent } from './sms-log/sms-log.component';
import { CustomSmsComponent } from './custom-sms/custom-sms.component';
import { MemberSmsComponent } from './member-sms/member-sms.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [SmsLogComponent, CustomSmsComponent, MemberSmsComponent],
  imports: [
    CommonModule,
    SmsRoutingModule,
    SharedModule,
    NgbModule,
    NgbPagination,
    CrudModule,
    SweetAlert2Module.forChild(),
  ],
})
export class SmsModule {}
