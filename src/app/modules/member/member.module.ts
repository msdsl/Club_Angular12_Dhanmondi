import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberRoutingModule } from './member-routing.module';
import { MemberListComponent } from './pages/member-list/member-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrudModule } from '../crud/crud.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MemberCreateComponent } from './pages/member-create/member-create.component';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { FamilyInfoComponent } from './components/family-info/family-info.component';
import { FeesComponent } from './components/fees/fees.component';
import { MemberLedgerComponent } from './components/member-ledger/member-ledger.component';
import { MembershipTransferComponent } from './pages/membership-transfer/membership-transfer.component';

@NgModule({
  declarations: [
    MemberListComponent,
    MemberCreateComponent,
    PersonalInfoComponent,
    FamilyInfoComponent,
    FeesComponent,
    MemberLedgerComponent,
    MembershipTransferComponent,
  ],
  imports: [
    CommonModule,
    MemberRoutingModule,
    SharedModule,
    CrudModule,
    SweetAlert2Module.forChild(),
  ],
})
export class MemberModule {}
