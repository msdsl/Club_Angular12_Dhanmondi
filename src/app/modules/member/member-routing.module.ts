import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberListComponent } from './pages/member-list/member-list.component';
import { MemberCreateComponent } from './pages/member-create/member-create.component';
import { MembershipTransferComponent } from './pages/membership-transfer/membership-transfer.component';

const routes: Routes = [
  {
    path: 'list',
    component: MemberListComponent,
  },
  {
    path: 'create',
    component: MemberCreateComponent,
  },
  {
    path: 'edit/:id',
    component: MemberCreateComponent,
  },
  {
    path: 'member-transfer',
    component: MembershipTransferComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberRoutingModule {}
