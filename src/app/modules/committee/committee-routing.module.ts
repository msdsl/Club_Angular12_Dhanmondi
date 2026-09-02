import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteeCategoryComponent } from './pages/committee-category/committee-category.component';
import { CommitteeListComponent } from './pages/committee-list/committee-list.component';
import { CommitteeCreateComponent } from './pages/committee-create/committee-create.component';
import { ExecutiveListComponent } from './pages/executive-list/executive-list.component';
import { ExecutiveCreateComponent } from './pages/executive-create/executive-create.component';

const routes: Routes = [
  {
    path:'category',
    component: CommitteeCategoryComponent
  },
  {
    path:'list',
    component: CommitteeListComponent
  },
  {
    path:'create',
    component: CommitteeCreateComponent
  },
  {
    path:'edit/:id',
    component: CommitteeCreateComponent
  },
  {
    path:'executive/create',
    component: ExecutiveCreateComponent
  },
  {
    path:'executive/edit/:id',
    component: ExecutiveCreateComponent
  },
  {
    path:'executive/list',
    component: ExecutiveListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommitteeRoutingModule { }
