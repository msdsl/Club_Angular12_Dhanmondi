import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule} from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    KeeniconComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,NgSelectModule
  ],
  exports: [
    KeeniconComponent,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ]
})
export class SharedModule {
}
