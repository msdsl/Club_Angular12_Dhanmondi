import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomEmailComponent } from './custom-email/custom-email.component';
import { MemberEmailComponent } from './member-email/member-email.component';

const routes: Routes = [
  {
    path: 'custom-email',
    component: CustomEmailComponent,
  },
  {
    path: 'member-email',
    component: MemberEmailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmailRoutingModule {}
