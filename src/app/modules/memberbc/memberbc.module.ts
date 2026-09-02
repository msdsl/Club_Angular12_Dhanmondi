import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberbcRoutingModule } from './memberbc-routing.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrudModule } from '../crud/crud.module';
import { MemberbcListComponent } from './pages/memberbc-list/memberbc-list.component';
import { MemberbcCreateComponent } from './pages/memberbc-create/memberbc-create.component';
import { BcpersonalInfoComponent } from './components/bcpersonal-info/bcpersonal-info.component';
import { BcfeesComponent } from './components/bcfees/bcfees.component';
import { BcfamilyComponent } from './components/bcfamily/bcfamily.component';
import { BcmemberLedgerComponent } from './components/bcmember-ledger/bcmember-ledger.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { RecommendationApprovalComponent } from './pages/recommendation-approval/recommendation-approval.component';
import { FinalApprovalComponent } from './pages/final-approval/final-approval.component';

@NgModule({
  declarations: [
    MemberbcListComponent,
    BcpersonalInfoComponent,
    MemberbcCreateComponent,
    BcfeesComponent,
    BcfamilyComponent,
    BcmemberLedgerComponent,
    RecommendationApprovalComponent,
    FinalApprovalComponent
  ],
  imports: [
    CommonModule,
    MemberbcRoutingModule,
    SharedModule,
    CrudModule,
    SweetAlert2Module.forChild(),
    NgxDocViewerModule
  ],
})
export class MemberbcModule {}
