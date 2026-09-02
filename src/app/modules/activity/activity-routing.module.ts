import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityListComponent } from './pages/activity-list/activity-list.component';
import { ActivityTypeComponent } from './pages/activity-type/activity-type.component';
import { ActivityTicketTypeComponent } from './pages/activity-ticket-type/activity-ticket-type.component';
import { ActivityTicketListComponent } from './pages/activity-ticket-list/activity-ticket-list.component';
import { ActivityTicketCreateComponent } from './pages/activity-ticket-create/activity-ticket-create.component';

const routes: Routes = [
  {
    path:'list',
    component:ActivityListComponent,
  },
  {
    path:'type',
    component:ActivityTypeComponent,
  },
  {
    path:'ticket-type',
    component:ActivityTicketTypeComponent,
  },
  {
    path:'ticket/list',
    component:ActivityTicketListComponent,
  },
  {
    path:'ticket/create',
    component:ActivityTicketCreateComponent,
  },
  {
    path:'ticket/edit/:ticketTypeId/:id',
    component:ActivityTicketCreateComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityRoutingModule { }
