import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardMeetingRoutingModule } from './board-meeting-routing.module';
import { BoardMeetingComponent } from './pages/board-meeting/board-meeting.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrudModule } from '../crud/crud.module';

@NgModule({
  declarations: [BoardMeetingComponent],
  imports: [
    CommonModule,
    BoardMeetingRoutingModule,
    NgbModule,
    SharedModule,
    CrudModule,
    SweetAlert2Module.forChild(),
  ],
})
export class BoardMeetingModule {}
