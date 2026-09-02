import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeRoutingModule } from './committee-routing.module';
import { CommitteeCategoryComponent } from './pages/committee-category/committee-category.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrudModule } from '../crud/crud.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CommitteeListComponent } from './pages/committee-list/committee-list.component';
import { CommitteeCreateComponent } from './pages/committee-create/committee-create.component';
import { ExecutiveListComponent } from './pages/executive-list/executive-list.component';
import { ExecutiveCreateComponent } from './pages/executive-create/executive-create.component';


@NgModule({
  declarations: [
    CommitteeCategoryComponent,
    CommitteeListComponent,
    CommitteeCreateComponent,
    ExecutiveListComponent,
    ExecutiveCreateComponent
  ],
  imports: [
    CommonModule,
    CommitteeRoutingModule,
    SharedModule,
    CrudModule,
    SweetAlert2Module.forChild(),
  ]
})
export class CommitteeModule { }
