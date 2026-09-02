import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivityTicketService } from '../../services/activity-ticket.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { AvailabilityService } from 'src/app/modules/setup/services/availability.service';
import { DatePipe } from '@angular/common';
import { ActivityTypeService } from '../../services/activity-type.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SlotSettingsService } from 'src/app/modules/setup/services/slot-settings.service';

@Component({
  selector: 'app-service-activity-ticket',
  templateUrl: './service-activity-ticket.component.html',
  styleUrls: ['./service-activity-ticket.component.css']
})
export class ServiceActivityTicketComponent implements OnInit {

  serviceActivityTicketForm: FormGroup;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  @Input() serviceTicketId: any;
  serviceTypeList: any;
  AvailabilityList: any;
  AvailabilityDetail: any = [];
  serviceTicketDetailArray: any;
  serviceTicketTypeList: any;
  groupedServiceSlotSettingsList: any;
  slot: any;
  selectedSlots:  Set<any> = new Set();

  constructor(
    private fb: FormBuilder,
    private service: ActivityTicketService,
    private availabilityService: AvailabilityService,
    private datePipe: DatePipe,
    private activityTypeService: ActivityTypeService,
    private alertType: AlertTypeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private slotSettingsService: SlotSettingsService
  ) { }

  ngOnInit() {
    this.createserviceActivityTicketForm()
    this.serviceTypeBySelectedCategory(7)
    this.getAvailability()
    this.getAllServiceTicketType()
    if(this.serviceTicketId){
      this.getById(this.serviceTicketId)
    }
    
  }
  getById(serviceTicketId){
    
    this.service.getById(serviceTicketId).subscribe(
      (data)=>{
        console.log(data);
        this.setDataToForm(data.Data)
      },
      (err)=>{
        console.log(err);
      }
    )
  }

  setDataToForm(data){
    
    this.serviceActivityTicketForm.patchValue({
      Id: data.Id,
      MemServiceId: data.MemServiceId,
      AvailabilityId: data.AvailabilityId,
      VatChargePercent: data.VatChargePercent,
      MemServiceTypeId: data.MemServiceTypeId,
      ServiceChargePercent: data.ServiceChargePercent,
      TicketLimit: data.TicketLimit,
      Location: data.Location,
      Description: data.Description,
      ImgFileUrl: environment.imgUrl+data.ImgFileUrl,

    });
    this.setDetailData(data.ServiceTicketDetailReqs)
    this.getAvailabilityDetail(data.AvailabilityId);

    this.getallServiceSlotSettings(data.MemServiceId)


    if (
      data.ServiceTicketAvailabilityReqs != null &&
      data.ServiceTicketAvailabilityReqs.length > 0
    ) {
      data.ServiceTicketAvailabilityReqs.forEach((element) => {
        this.selectedSlots.add(element);
      });
    }



  }

  setDetailData(data) {
    var i = 0;
    data.forEach((element) => {
      
      this.createDetail();
     
        this.serviceTicketDetailArray[i].get("Id").patchValue(element.Id),
        this.serviceTicketDetailArray[i]
          .get("UnitPrice")
          .patchValue(element.UnitPrice),
        this.serviceTicketDetailArray[i]
          .get("MaxQuantity")
          .patchValue(element.MaxQuantity),
        this.serviceTicketDetailArray[i]
          .get("ServiceTicketTypeId")
          .patchValue(element.ServiceTicketTypeId)
        i++;
    });
  }

  convertTime(time: string): string {

    const [hours, minutes] = time.split(':');
    let hoursNum = +hours;
    const period = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12 || 12;  // Convert 0 to 12 for midnight
    return `${hoursNum}:${minutes} ${period}`;
  }

  createserviceActivityTicketForm() {
    this.serviceActivityTicketForm = this.fb.group({
      Id: 0,
      MemServiceId: ['', Validators.required],
      AvailabilityId: null,
      VatChargePercent: null,
      MemServiceTypeId:7,
      ServiceChargePercent: null,
      TicketLimit: null,
      Location: null,
      Description: null,
      formFile:null,
      ImgFileUrl:null,
      ServiceTicketDetailReqs: this.fb.array([]),
    });

    this.serviceActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray;
    if (!this.serviceTicketId) {
      this.createDetail();
    }
    this.serviceTicketDetailArray = (
      this.serviceActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray
    ).controls;
  }

  createDetail() {
    const now = new Date();
    var currentTime = this.datePipe.transform(now, 'HH:mm');
    const newItem = this.fb.group({
      Id: 0,
      UnitPrice: 0,
      MaxQuantity: 1,
      ServiceTicketTypeId: null,
      TicketType: null,

    });
    (this.serviceActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray).push(newItem);
  }

  addItemDetail(i) {
    if (!this.serviceTicketDetailArray[this.serviceTicketDetailArray?.length - 1]
      .value.ServiceTicketTypeId) {
      return;
    }
    this.createDetail();
  }

  removeItem(index: number) {
    (this.serviceActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray).removeAt(
      index
    );
  }

  getAvailability() {
    this.availabilityService.getAvailabilityPagination(1, 1000).subscribe(
      (data) => {
        this.AvailabilityList = data.Data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAllServiceTicketType() {
    
    this.activityTypeService.getAllServiceTicketType().subscribe(
      (data) => {
        this.serviceTicketTypeList = data.Data;
        this.serviceTicketTypeList = this.serviceTicketTypeList.filter((x) => x.ServiceType == 'Service');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  triggerGetAvailabilityDetail(event){
    this.getAvailabilityDetail(event.Id)
  }


  getAvailabilityDetail(Id) {
    if (event) {
      this.availabilityService.getDetailById(Id).subscribe(
        (data) => {
          this.AvailabilityDetail = data.Data.AvailabilityDetailVms;
        },
        (err) => {
          console.log(err);
        }
      );
    }
    else {
      this.AvailabilityDetail = []
    }
  }
  getValue(slot) {
    if (this.isSlotSelected(slot)) {
      var selectedSlots = [...this.selectedSlots];
      var valueSlot = selectedSlots.find((c) => c.SlotId == slot.Id);
      return valueSlot.Qty;
    }
    return 0;
  }

  
  getallServiceSlotSettings(event) {

    var Id = event.Id?event.Id:event
    this.slotSettingsService.getServiceSlotSettingsByServiceId(Id).subscribe(
      (data) => {
        this.slot = data.Data;
        this.groupedServiceSlotSettingsList = this.groupBy(this.slot?.SlotList, 'DayText');

      },
      (err) => {
        console.log(err);
      }
    );
  }
  isSlotSelected(slot: any): boolean {
    
    var selectedSlots = [...this.selectedSlots];
    var isSlotSelected = selectedSlots.some((c) => c.SlotId == slot.Id);

    return isSlotSelected;

    // return this.selectedSlots.has(slot);
  }
  isSelectedAll(){
    var selectedSlots = [...this.selectedSlots];
    if(this.slot?.SlotList.length==selectedSlots.length){
      return true;
    }
    else{
      false
    }

  }

  toggleSlotSelection(slot: any): void {
    

    var selectedSlots = [...this.selectedSlots];
    var selected = selectedSlots.filter((c) => c.SlotId == slot.Id);

    if (this.isSlotSelected(slot)) {
      if (selected.length > 0) this.selectedSlots.delete(selected[0]);
    } else {
      
      var newslot: any = new Object();
      Object.assign(newslot, slot);
      newslot.SlotId = slot.Id;
      newslot.Id = 0;
      this.selectedSlots.add(newslot);
    }
  }

  onSelectAll(event){
    
  //  var selectedSlots = [...this.selectedSlots];
    if(event.target.checked){

      this.slot?.SlotList.forEach(element => {
        var newslot: any = new Object();
      Object.assign(newslot, element);
      newslot.SlotId = element.Id;
      newslot.Id = 0;
      newslot.Qty=1;
      this.selectedSlots.add(newslot);
      });
    }
    else{
      this.selectedSlots.clear()
    }

  }
  

  updateSLotQty(event, slot) {
    if (this.isSlotSelected(slot)) {
      const selectedSlotsArray = Array.from(this.selectedSlots);
      const selected = selectedSlotsArray.find((c) => c.SlotId == slot.Id);

      if (selected) {
        selected.Qty = event.target.value;
        this.selectedSlots.clear();
        selectedSlotsArray.forEach((s) => this.selectedSlots.add(s));
      } else {
        console.log('Slot not found');
      }
    } else {
    }
  }

  groupBy(collection: any[], property: string): any[] {
    const groupedCollection = collection.reduce((previous, current) => {
      if (!previous[current[property]]) {
        previous[current[property]] = [current];
      } else {
        previous[current[property]].push(current);
      }
      return previous;
    }, {});
    return Object.keys(groupedCollection).map((key) => ({ key, value: groupedCollection[key] }));
  }

  serviceTypeBySelectedCategory(id: any) {
    this.service.getServiceTypeBySelectedCategory(id).subscribe(
      (data) => {
        console.log(data);
        this.serviceTypeList = data.Data;

      },
      (error: any) => {
        console.log(error);

      }
    );
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  onSubmit() {
    var serviceActivityTicket = this.prepareToSave();

    this.service.createActivityTicket(serviceActivityTicket).subscribe(
      (data)=>{
        this.showAlert(this.alertType.createSuccessAlert);
        this.router.navigate(['activity/ticket/list']);
        
      },
      (err)=>{
        this.showAlert(this.alertType.errorAlert);
      }
    )

  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Activity Ticket');
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

  imageChangeHandler(service: any) {
    const file = service.target.files[0];
    const reader = new FileReader();
    this.serviceActivityTicketForm.get('formFile').patchValue(file);
    reader.onload = (e: any) => {
      this.serviceActivityTicketForm.get('ImgFileUrl').patchValue(e.target.result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    const inputElement = service.target as HTMLInputElement;

  }

  removeImage() {
    this.serviceActivityTicketForm.get('ImgFileUrl').patchValue(null);
    this.serviceActivityTicketForm.get('formFile').patchValue(null);
    this.cdr.detectChanges();
  }

  onTitleChange(event, i){
    if(event){
      this.serviceTicketDetailArray[i].get("TicketType").patchValue(event.Title); 
    }
    else{
      this.serviceTicketDetailArray[i].get("TicketType").patchValue(null); 
    }
  }

  prepareToSave() {
    const formData = new FormData();

    formData.append('Id', this.serviceActivityTicketForm.value.Id);
    formData.append('MemServiceId', this.serviceActivityTicketForm.value.MemServiceId);
    formData.append('MemServiceTypeId', this.serviceActivityTicketForm.value.MemServiceTypeId);
    formData.append('AvailabilityId', this.serviceActivityTicketForm.value.AvailabilityId);
    formData.append('VatChargePercent', this.serviceActivityTicketForm.value.VatChargePercent);
    formData.append('ServiceChargePercent', this.serviceActivityTicketForm.value.ServiceChargePercent);
    formData.append('TicketLimit', this.serviceActivityTicketForm.value.TicketLimit);
    formData.append('Description', this.serviceActivityTicketForm.value.Description);
    formData.append('formFile', this.serviceActivityTicketForm.value.formFile);
    formData.append('ImgFileUrl', this.serviceActivityTicketForm.value.ImgFileUrl);
    formData.append('Location', this.serviceActivityTicketForm.value.Location);

    if (this.serviceTicketDetailArray.length>0) {
      this.serviceTicketDetailArray.forEach((item, index) => {
        if (item.value.Id !== 0) {
          formData.append(`ServiceTicketDetailReqs[${index}].Id`, item.value.Id.toString());
        }
        formData.append(`ServiceTicketDetailReqs[${index}].UnitPrice`, item.value.UnitPrice?.toString());
        formData.append(`ServiceTicketDetailReqs[${index}].MaxQuantity`, item.value.MaxQuantity?.toString());
        formData.append(`ServiceTicketDetailReqs[${index}].ServiceTicketTypeId`, item.value.ServiceTicketTypeId?.toString());
        formData.append(`ServiceTicketDetailReqs[${index}].TicketType`, item.value.TicketType?.toString());
      });
    }

    
      var myList: any[] = [...this.selectedSlots];
      myList.forEach((item, index) => {
        if (item.Id !== 0) {
          formData.append(`ServiceTicketAvailabilityReqs[${index}].Id`, item.Id.toString());
        }
        if (item.SlotId) {
          formData.append(`ServiceTicketAvailabilityReqs[${index}].SlotId`, item.SlotId.toString());
        }
        if (this.serviceTicketId !== 0 && this.serviceTicketId !== null) {
          formData.append(`ServiceTicketAvailabilityReqs[${index}].ServiceTicketId`, this.serviceTicketId.toString());
        } else {
          formData.append(`ServiceTicketAvailabilityReqs[${index}].ServiceTicketId`, this.serviceTicketId.toString());
        }
        formData.append(`ServiceTicketAvailabilityReqs[${index}].StartTime`, item.StartTime.toString());
        formData.append(`ServiceTicketAvailabilityReqs[${index}].DayText`, item.DayText.toString());
        formData.append(`ServiceTicketAvailabilityReqs[${index}].EndTime`, item.EndTime.toString());
        formData.append(`ServiceTicketAvailabilityReqs[${index}].IsWholeDay`, item.IsWholeDay.toString());
        formData.append(`ServiceTicketAvailabilityReqs[${index}].Qty`, item.Qty.toString());
      });
    

    return formData;

  }

}
