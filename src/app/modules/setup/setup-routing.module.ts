import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollegeComponent } from './pages/college/college.component';
import { MemberTypeComponent } from './pages/member-type/member-type.component';
import { MemberStatusComponent } from './pages/member-status/member-status.component';
import { MemberProfessionComponent } from './pages/member-profession/member-profession.component';
import { MemberFeesComponent } from './pages/member-fees/member-fees.component';
import { MemberActiveStatusComponent } from './pages/member-active-status/member-active-status.component';
import { AddonsItemComponent } from './pages/addons-item/addons-item.component';
import { TableSetupComponent } from './pages/table-setup/table-setup.component';
import { AreaStatusComponent } from './pages/area-status/area-status.component';
import { DepartmentComponent } from './pages/department/department.component';
import { NomineeTypeComponent } from './pages/nominee-type/nominee-type.component';
import { AreaLayoutComponent } from './pages/area-layout/area-layout.component';
import { AvailabilityListComponent } from './pages/availability-list/availability-list.component';
import { AvailabilityCreateComponent } from './pages/availability-create/availability-create.component';
import { SlotSettingsListComponent } from './pages/slot-settings-list/slot-settings-list.component';
import { SlotSettingsCreateComponent } from './pages/slot-settings-create/slot-settings-create.component';
import { VenueBlockedListComponent } from './pages/venue-blocked-list/venue-blocked-list.component';
import { VenueBlockedCreateComponent } from './pages/venue-blocked-create/venue-blocked-create.component';

const routes: Routes = [
  {
    path: 'college-setup',
    component: CollegeComponent,
  },
  {
    path: 'member-type-setup',
    component: MemberTypeComponent,
  },
  {
    path: 'member-status-setup',
    component: MemberStatusComponent,
  },
  {
    path: 'member-profession-setup',
    component: MemberProfessionComponent,
  },
  {
    path: 'member-fees-setup',
    component: MemberFeesComponent,
  },
  {
    path: 'manage-active-status',
    component: MemberActiveStatusComponent,
  },
  {
    path: 'addons-item',
    component: AddonsItemComponent,
  },
  {
    path: 'table-setup',
    component: TableSetupComponent,
  },
  {
    path: 'department',
    component: DepartmentComponent,
  },
  {
    path: 'nomineeType',
    component: NomineeTypeComponent,
  },
  {
    path: 'area-status',
    component: AreaStatusComponent,
  },
  {
    path: 'area-layout',
    component: AreaLayoutComponent,
  },
  {
    path: 'availability/list',
    component: AvailabilityListComponent,
  },
  {
    path: 'availability/create',
    component: AvailabilityCreateComponent,
  },
  {
    path:'availability/edit/:id',
    component: AvailabilityCreateComponent
  },
  {
    path:'slot-settings/list',
    component: SlotSettingsListComponent
  },
  {
    path:'slot-settings/create',
    component: SlotSettingsCreateComponent
  },
  {
    path:'slot-settings/edit/:id',
    component: SlotSettingsCreateComponent
  },
  {
    path: 'venue-blocked/list',
    component: VenueBlockedListComponent,
  },
  {
    path: 'venue-blocked/create',
    component: VenueBlockedCreateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetupRoutingModule {}
