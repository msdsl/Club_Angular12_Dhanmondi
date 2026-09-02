import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SlotSettingsService } from '../../services/slot-settings.service';
import { WeekDays } from '../../models/WeekDays';
import { DatePipe } from '@angular/common';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';

@Component({
  selector: 'app-slot-settings-create',
  templateUrl: './slot-settings-create.component.html',
  styleUrls: ['./slot-settings-create.component.css']
})
export class SlotSettingsCreateComponent implements OnInit {

  isInsertMode = false;
  isLoading = false;
  itemId: number;
  serviceSlotSettingsForm: FormGroup;
  serviceSlotSettingsArray: any;
  SlotListArray: any;
  weekDaysEnum: any;
  weekDaysList: string[] = ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  slotList: any[] = [];
  slot: any;
  serviceList: any[] = [];
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  serviceSlotSettingsId: number;
  DayText: any;
  EndTime: any;
  StartTime: any;
  IsWholeDay: any;
  SlotMasterId: any;
  constructor(
    private fb: FormBuilder,
    private service: SlotSettingsService,
    private router: Router,
    private route: ActivatedRoute,
    // private alert: AlertService,
    private datePipe: DatePipe,
    private alertType: AlertTypeService,
    private cdr: ChangeDetectorRef,
    private activateRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getallServiceSlotSettings();
    this.getAllMemService();
    this.createForm();
    this.activateRoute.paramMap.subscribe((params) => {
      this.serviceSlotSettingsId = +params.get('id');
      if (this.serviceSlotSettingsId) {
        this.getSlotSettingsById(this.serviceSlotSettingsId);
      }
    });
  }
  getAllMemService() {
    this.isLoading = true;
    this.service.getAllServiceOnly(1, 10000).subscribe(
      (data) => {
        this.serviceList = data.Data;

        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }


  getSlotSettingsById(id) {
    this.service.getServiceSlotSettingsById(id).subscribe(
      (res) => {
        this.slot = res.Data;
        this.serviceSlotSettingsForm = this.fb.group({
          Id: this.slot?.Id,
          ServiceId: this.slot?.ServiceId,
          ServiceText: this.slot?.ServiceText,
          SlotList: this.fb.array([]),
        });
        this.serviceSlotSettingsForm.get('SlotList') as FormArray;
        this.serviceSlotSettingsArray = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).controls;

        const enumKeys = Object.keys(WeekDays);
        this.weekDaysEnum = enumKeys.filter((key) => isNaN(Number(key)));

        this.weekDaysEnum.forEach((element) => {
          var dailySlot = this.slot?.SlotList.filter((c) => c.DayText == element);
          var i = 0;

          this.loadDay(dailySlot);
          i++;
        });
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  patchSameAs(index: number, day: any, event: any, selectControl?: any) {
    const fromDayText = typeof event === 'string' ? event : event?.value || event?.label || event;
    if (!fromDayText) return;
    if (day.value.DayText === fromDayText) {
      if (selectControl) selectControl.handleClearClick();
      return;
    }

    const table = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).at(index) as FormGroup;
    const SlotList = table.get('SlotList') as FormArray;
    while (SlotList.length !== 0) {
      SlotList.removeAt(0);
    }

    const sourceDay = this.serviceSlotSettingsArray.find((c: any) => c.value.DayText === fromDayText);
    if (!sourceDay) return;
    const dayData = sourceDay.value.SlotList || [];

    dayData.forEach((element: any) => {
      SlotList.push(
        this.fb.group({
          Id: 0,
          SlotMasterId: 0,
          StartTime: element.StartTime,
          EndTime: element.EndTime,
          DayText: day.value.DayText,
          IsWholeDay: element.IsWholeDay,
        })
      );
    });

    if (selectControl) {
      selectControl.handleClearClick();
    }
    this.cdr.detectChanges();

    this.showAlert({
      title: 'Copied Successfully!',
      text: `Timings from ${fromDayText} applied to ${day.value.DayText}.`,
      icon: 'success',
    });
  }

  copyToDay(sourceIndex: number, event: any, selectControl?: any) {
    const targetDayText = typeof event === 'string' ? event : event?.value || event?.label || event;
    if (!targetDayText) return;
    const sourceDay = this.serviceSlotSettingsArray[sourceIndex];
    if (!sourceDay) return;
    if (sourceDay.value.DayText === targetDayText) {
      if (selectControl) selectControl.handleClearClick();
      return;
    }

    const sourceSlots = sourceDay.value.SlotList || [];
    const targetIndex = this.serviceSlotSettingsArray.findIndex(
      (c: any) => c.value.DayText === targetDayText
    );
    if (targetIndex === -1) return;

    const targetFormGroup = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).at(targetIndex) as FormGroup;
    const targetSlotList = targetFormGroup.get('SlotList') as FormArray;
    while (targetSlotList.length !== 0) {
      targetSlotList.removeAt(0);
    }

    sourceSlots.forEach((s: any) => {
      targetSlotList.push(
        this.fb.group({
          Id: 0,
          SlotMasterId: 0,
          StartTime: s.StartTime,
          EndTime: s.EndTime,
          DayText: targetDayText,
          IsWholeDay: s.IsWholeDay,
        })
      );
    });

    if (selectControl) {
      selectControl.handleClearClick();
    }
    this.cdr.detectChanges();

    this.showAlert({
      title: 'Copied Successfully!',
      text: `Slots from ${sourceDay.value.DayText} copied to ${targetDayText}.`,
      icon: 'success',
    });
  }

  copyToAllDays(sourceIndex: number) {
    const sourceDay = this.serviceSlotSettingsArray[sourceIndex];
    if (!sourceDay) return;
    const sourceSlots = sourceDay.value.SlotList || [];

    this.serviceSlotSettingsArray.forEach((d: any, targetIndex: number) => {
      if (targetIndex === sourceIndex) return;
      const targetDayText = d.value.DayText;
      const targetFormGroup = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).at(targetIndex) as FormGroup;
      const targetSlotList = targetFormGroup.get('SlotList') as FormArray;
      while (targetSlotList.length !== 0) {
        targetSlotList.removeAt(0);
      }

      sourceSlots.forEach((s: any) => {
        targetSlotList.push(
          this.fb.group({
            Id: 0,
            SlotMasterId: 0,
            StartTime: s.StartTime,
            EndTime: s.EndTime,
            DayText: targetDayText,
            IsWholeDay: s.IsWholeDay,
          })
        );
      });
    });

    this.showAlert({
      title: 'Applied to All Days!',
      text: `Slots from ${sourceDay.value.DayText} successfully applied to all remaining days.`,
      icon: 'success',
    });
  }

  getOtherDays(currentDay: string) {
    if (!this.weekDaysEnum) return [];
    return this.weekDaysEnum.filter((d: string) => d !== currentDay);
  }

  addExistingSlot(index: number, day): void {
    const table = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).at(index) as FormGroup;
    const SlotList = table.get('SlotList') as FormArray;
    SlotList.push(this.createExistingSlot(SlotList.value.length, day));
  }

  createExistingSlot(index, day): FormGroup {
    return this.fb.group({
      StartTime: this.StartTime,
      EndTime: this.EndTime,
      DayText: day.value.DayText,
      IsWholeDay: this.IsWholeDay,
      SlotMasterId: 0,
      Id: 0
    });
  }




  /////////////////////////////////////////////////////////////////////////////////////////////////////////////





  getallServiceSlotSettings() {
    this.isLoading = true;
    this.isInsertMode = false;
    this.service.getallServiceSlotSettings().subscribe(
      (res) => {
        this.slotList = res.Data;
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }
  getServiceSlotSettingsById(id) {
    this.isLoading = true;
    this.service.getServiceSlotSettingsById(id).subscribe(
      (res) => {
        this.slot = res.Data;
        console.log(this.slot);
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }
  bindItem(event) {
    if (!event) return;
    this.isLoading = true;
    const serviceId = event.Id || event.id;
    const serviceTitle = event.Title || event.Name || event.ServiceText || '';

    this.service.getServiceSlotSettingsByServiceId(serviceId).subscribe(
      (res) => {
        this.slot = res?.Data;
        if (!this.slot || this.slot?.Id === 0) {
          this.isLoading = false;
          this.createForm();
          this.serviceSlotSettingsForm.get('ServiceId')?.setValue(serviceId);
          this.serviceSlotSettingsForm.get('ServiceText')?.setValue(serviceTitle);
          return;
        }
        this.serviceSlotSettingsForm = this.fb.group({
          Id: this.slot?.Id || 0,
          ServiceId: serviceId,
          ServiceText: this.slot?.ServiceText || serviceTitle,
          SlotList: this.fb.array([]),
        });
        this.serviceSlotSettingsForm.get('SlotList') as FormArray;
        this.serviceSlotSettingsArray = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).controls;

        const enumKeys = Object.keys(WeekDays);

        this.weekDaysEnum = enumKeys.filter((key) => isNaN(Number(key)));

        this.weekDaysEnum.forEach((element) => {
          var dailySlot = this.slot?.SlotList.filter((c) => c.DayText == element);
          var i = 0;

          this.loadDay(dailySlot);
          i++;
        });
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }
  editButtonClick(id) {
    this.isInsertMode = true;
    this.isLoading = true;
    this.service.getServiceSlotSettingsById(id).subscribe(
      (res) => {
        this.slot = res.Data;
        this.serviceSlotSettingsForm = this.fb.group({
          Id: this.slot?.Id,
          ServiceId: this.slot?.ServiceId,
          ServiceText: this.slot?.ServiceText,
          SlotList: this.fb.array([]),
        });
        this.serviceSlotSettingsForm.get('SlotList') as FormArray;
        this.serviceSlotSettingsArray = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).controls;

        const enumKeys = Object.keys(WeekDays);

        this.weekDaysEnum = enumKeys.filter((key) => isNaN(Number(key)));

        this.weekDaysEnum.forEach((element) => {
          var dailySlot = this.slot?.SlotList.filter((c) => c.DayText == element);
          var i = 0;

          this.loadDay(dailySlot);
          i++;
        });
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }
  create() {
    this.createForm();
  }
  createForm() {

    this.serviceSlotSettingsForm = this.fb.group({
      Id: [0, Validators.required],
      ServiceId: [0, Validators.required],
      ServiceText: [''],
      SlotList: this.fb.array([]),
    });

    this.serviceSlotSettingsArray = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).controls;

    const enumKeys = Object.keys(WeekDays);


    this.weekDaysEnum = enumKeys.filter((key) => isNaN(Number(key)));
    console.log(this.weekDaysEnum);

    this.weekDaysEnum.forEach((element) => {
      this.addDay(element);
    });
  }

  //////////////////////////////////// On Edit Mode ////////////////////////////////

  loadDay(dailySlot): void {
    const ServiceSlotSettingsList = this.serviceSlotSettingsForm.get('SlotList') as FormArray;
    ServiceSlotSettingsList.push(this.loadNewDay(dailySlot));
  }
  loadNewDay(dailySlot): FormGroup {
    return this.fb.group({
      Id: [dailySlot[0].Id],
      SlotMasterId: [dailySlot[0].SlotMasterId],
      DayText: [dailySlot[0].DayText, Validators.required],
      SlotList: this.fb.array(dailySlot.map((slot) => this.loadNewSlot(slot))),
    });
  }
  loadNewSlot(slot): FormGroup {
    ;
    return this.fb.group({
      Id: [slot.Id],
      SlotMasterId: [slot.SlotMasterId],
      StartTime: [slot.StartTime],
      EndTime: [slot.EndTime],
      DayText: [slot.DayText],
      IsWholeDay: [slot.IsWholeDay],
    });
  }

  //////////////////////////////////// On Edit Mode ////////////////////////////////

  ////////////////////////////// from Form Create /////////////////////////////////////

  addDay(day): void {

    const ServiceSlotSettingsList = this.serviceSlotSettingsForm.get('SlotList') as FormArray;
    ServiceSlotSettingsList.push(this.createNewDay(day));
  }
  createNewDay(day): FormGroup {
    return this.fb.group({
      Id: 0,
      SlotMasterId: null,
      DayText: [day, Validators.required],
      SlotList: this.fb.array([this.createSlot(day)]),
    });
  }

  createSlot(day): FormGroup {
    const now = new Date();
    var currentTime = this.datePipe.transform(now, 'HH:mm');
    return this.fb.group({
      Id: 0,
      SlotMasterId: 0,
      StartTime: [currentTime],
      EndTime: [currentTime],
      DayText: [day, Validators.required],
      IsWholeDay: [true, Validators.required],
    });
  }

  ////////////////////////////// from Form Create /////////////////////////////////////

  //////////////////////////////////////// on button clink ///////////////////////////

  addSlot(index: number, day): void {

    const table = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).at(index) as FormGroup;
    const SlotList = table.get('SlotList') as FormArray;
    SlotList.push(this.createNewSlot(SlotList.value.length, day));
  }

  createNewSlot(index, day): FormGroup {
    const now = new Date();
    var currentTime = this.datePipe.transform(now, 'HH:mm');
    return this.fb.group({
      StartTime: [currentTime, Validators.required],
      EndTime: [currentTime, Validators.required],
      DayText: [day, Validators.required],
      IsWholeDay: [false, Validators.required],
    });
  }
  ///////////////////////////////////// on button clink ///////////////////////////

  removeTable(index: number): void {
    const ServiceSlotSettingsList = this.serviceSlotSettingsForm.get('SlotList') as FormArray;
    ServiceSlotSettingsList.removeAt(index);
  }

  removeSlot(index: number, slotIndex: number): void {

    const table = (this.serviceSlotSettingsForm.get('SlotList') as FormArray).at(index) as FormGroup;
    const SlotList = table.get('SlotList') as FormArray;
    SlotList.removeAt(slotIndex);
  }

  onSubmit() {
    var isTableReturn = false;
    var isSlotReturn = false;

    this.serviceSlotSettingsArray.forEach((element) => {
      if (this.serviceSlotSettingsArray.filter((c) => c.value.DayText == element.value.Day).length > 1) {
        isTableReturn = true;
      }
      element.value.SlotList.forEach((slot) => {
        if (element.value.SlotList.filter((c) => c.Slot == slot.Slot).length > 1) {
          isSlotReturn = true;
        }
      });
    });

    if (!this.serviceSlotSettingsForm.valid) {
      this.showAlert(this.alertType.errorAlert);
      return;
    }
    else {
      this.service.saveSlotSettings(this.serviceSlotSettingsForm.value).subscribe(
        (data) => {
          this.isInsertMode = false;
          this.isLoading = false;
          // this.getallServiceSlotSettings();
          this.showAlert(this.alertType.createSuccessAlert);
          this.router.navigate(['setups/slot-settings/list']);
        },
        (err) => {
          console.log(err);
          this.showAlert(this.alertType.errorAlert);
          this.isLoading = false;
        }
      );
    }

  }

  handleBlur(formControl) {
    return formControl.valid || formControl.untouched;
  }

  getColor(index) {
    const lightness = 90 - ((index * 2) % 90); // Ensure hue stays within 0-360 range
    return `hsl(0, 0%, ${lightness}%)`;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Slot Settings');
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }


}
