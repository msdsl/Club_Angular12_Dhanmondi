import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberbcListComponent } from './pages/memberbc-list/memberbc-list.component';
import { MemberbcCreateComponent } from './pages/memberbc-create/memberbc-create.component';
import { RecommendationApprovalComponent } from './pages/recommendation-approval/recommendation-approval.component';
import { FinalApprovalComponent } from './pages/final-approval/final-approval.component';

const routes: Routes = [
  {
    path: 'list',
    component: MemberbcListComponent,
  },
  {
    path: 'create',
    component: MemberbcCreateComponent,
  },
  {
    path: 'edit/:id',
    component: MemberbcCreateComponent,
  },
  {
    path: 'recommendation-approval',
    component: RecommendationApprovalComponent,
  },
  {
    path: 'final-approval',
    component: FinalApprovalComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberbcRoutingModule {}
