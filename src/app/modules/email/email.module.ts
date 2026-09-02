import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailRoutingModule } from './email-routing.module';
import { CustomEmailComponent } from './custom-email/custom-email.component';
import { MemberEmailComponent } from './member-email/member-email.component';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrudModule } from '../crud/crud.module';

@NgModule({
  declarations: [CustomEmailComponent, MemberEmailComponent],
  imports: [
    SharedModule,
    NgbModule,
    NgbPagination,
    CrudModule,
    SweetAlert2Module.forChild(),
    CommonModule,
    EmailRoutingModule,
  ],
})
export class EmailModule {}
