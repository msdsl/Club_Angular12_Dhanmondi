import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SetupRoutingModule } from './setup-routing.module';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';

import { CrudModule } from '../crud/crud.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { SharedModule } from 'src/app/shared/shared.module';
import { CollegeComponent } from './pages/college/college.component';
import { MemberTypeComponent } from './pages/member-type/member-type.component';
import { MemberStatusComponent } from './pages/member-status/member-status.component';
import { MemberProfessionComponent } from './pages/member-profession/member-profession.component';
import { MemberFeesComponent } from './pages/member-fees/member-fees.component';
import { MemberActiveStatusComponent } from './pages/member-active-status/member-active-status.component';
import { AddonsItemComponent } from './pages/addons-item/addons-item.component';
import { TableSetupComponent } from './pages/table-setup/table-setup.component';
import { DepartmentComponent } from './pages/department/department.component';
import { AreaStatusComponent } from './pages/area-status/area-status.component';
import { NomineeTypeComponent } from './pages/nominee-type/nominee-type.component';
import { AreaLayoutComponent } from './pages/area-layout/area-layout.component';
import { AvailabilityListComponent } from './pages/availability-list/availability-list.component';
import { AvailabilityCreateComponent } from './pages/availability-create/availability-create.component';
import { SlotSettingsListComponent } from './pages/slot-settings-list/slot-settings-list.component';
import { SlotSettingsCreateComponent } from './pages/slot-settings-create/slot-settings-create.component';
import { VenueBlockedListComponent } from './pages/venue-blocked-list/venue-blocked-list.component';
import { VenueBlockedCreateComponent } from './pages/venue-blocked-create/venue-blocked-create.component';
import { ToastrModule } from 'ngx-toastr';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NewVenueBlockedModalComponent } from './components/new-venue-blocked-modal/new-venue-blocked-modal.component';


@NgModule({
  declarations: [
    CollegeComponent,
    MemberTypeComponent,
    MemberStatusComponent,
    MemberProfessionComponent,
    MemberFeesComponent,
    MemberActiveStatusComponent,
    AddonsItemComponent,
    TableSetupComponent,
    DepartmentComponent,
    AreaStatusComponent,
    NomineeTypeComponent,
    AreaLayoutComponent,
    AvailabilityListComponent,
    AvailabilityCreateComponent,
    SlotSettingsListComponent,
    SlotSettingsCreateComponent,
    VenueBlockedListComponent,
    VenueBlockedCreateComponent,
    NewVenueBlockedModalComponent
  ],
  imports: [
    CommonModule,
    SetupRoutingModule,
    NgbModule,
    SharedModule,
    CrudModule,
    SweetAlert2Module.forChild(),


    ToastrModule.forRoot(),
  
    FullCalendarModule,
    // NgbPagination
  ],
})
export class SetupModule {}
