import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListingComponent } from './pages/user-listing/user-listing.component';
import { RouterModule } from '@angular/router';
import { UserDetailsComponent } from './user-details/user-details.component';
import { CrudModule } from 'src/app/modules/crud/crud.module';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModule,
  NgbNavModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { UserCreateComponent } from './pages/user-create/user-create.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';
import { UserMenusComponent } from './components/user-menus/user-menus.component';
import { UserLogsComponent } from './components/user-logs/user-logs.component';

@NgModule({
  declarations: [
    UserListingComponent,
    UserDetailsComponent,
    UserCreateComponent,
    UserInfoComponent,
    UserRolesComponent,
    UserMenusComponent,
    UserLogsComponent
  ],
  imports: [
    CommonModule,
    CrudModule,
    SharedModule,
    NgbNavModule,
    NgbModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTooltipModule,
    SweetAlert2Module.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: UserListingComponent,
      },
      {
        path: 'create',
        component: UserCreateComponent,
      },
      { 
        path:'edit/:id', 
        component: UserCreateComponent
      }
    ]),
  ],
})
export class UserModule {}
