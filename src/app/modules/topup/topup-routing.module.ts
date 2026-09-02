import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopupComponent } from './pages/topup/topup.component';
import { TopupCreateComponent } from './pages/topup-create/topup-create.component';

const routes: Routes = [
  {
    path: '',
    component: TopupComponent,
  },
  {
    path: 'create',
    component: TopupCreateComponent,
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopupRoutingModule {}
