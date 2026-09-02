import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardMeetingComponent } from './pages/board-meeting/board-meeting.component';

const routes: Routes = [
  {
    path: 'list',
    component: BoardMeetingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BoardMeetingRoutingModule {}
