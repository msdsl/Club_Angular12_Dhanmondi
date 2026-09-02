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
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AreaLayoutService } from 'src/app/modules/setup/services/area-layout.service';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-event-activity-ticket',
  templateUrl: './event-activity-ticket.component.html',
  styleUrls: ['./event-activity-ticket.component.css']
})
export class EventActivityTicketComponent implements OnInit {
  eventActivityTicketForm: FormGroup;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  @Input() eventTicketId: any;
  serviceTypeList: any;
  AvailabilityList: any;
  AvailabilityDetail: any = [];
  serviceTicketDetailArray: any;
  serviceTicketTypeList: any;
  selectedLayouts: any = [];
  areaLayoutDataList: any = [];
  activeTooltip: any;
  private tooltipTimeout: any; // To manage the delay
  closeTimeout: any;
  isInTableOrButton: boolean;
  TokenCode: string = '';
  EventTokenReqs: any = [];


  constructor(
    private fb: FormBuilder,
    private service: ActivityTicketService,
    private availabilityService: AvailabilityService,
    private datePipe: DatePipe,
    private activityTypeService: ActivityTypeService,
    private alertType: AlertTypeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private activateRoute: ActivatedRoute,
    private areaLayoutService: AreaLayoutService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.createeventActivityTicketForm()
    this.serviceTypeBySelectedCategory(6)
    this.getAvailability()
    this.getAllServiceTicketType()
    if (this.eventTicketId) {
      this.getById(this.eventTicketId)
    }

  }
  getById(eventTicketId) {

    this.service.getById(eventTicketId).subscribe(
      (data) => {
        console.log(data);
        this.setDataToForm(data.Data)
      },
      (err) => {
        console.log(err);
      }
    )
  }

  setDataToForm(data) {
    
    this.eventActivityTicketForm.patchValue({
      Id: data.Id,
      MemServiceId: data.MemServiceId,
      // AvailabilityId: data.AvailabilityId,
      VatChargePercent: data.VatChargePercent,
      MemServiceTypeId: data.MemServiceTypeId,
      ServiceChargePercent: data.ServiceChargePercent,
      TicketLimit: data.TicketLimit,
      Location: data.Location,
      Description: data.Description,
      StartDate: data.StartDate.toString().substring(0, 10).replace('T', ' '),
      EndDate: data.EndDate.toString().substring(0, 10).replace('T', ' '),
      EventDate: data.EventDate.toString().substring(0, 10).replace('T', ' '),
      PromoCode: data.PromoCode,
      ImgFileUrl: environment.imgUrl + data.ImgFileUrl,
      Title: data.Title

    });

    this.EventTokenReqs = data.EventTokenReqs;
    this.setDetailData(data.ServiceTicketDetailReqs)
    // this.getAvailabilityDetail(data.AvailabilityId);


    this.selectedLayouts = data.SerTicketAreaLayoutReqs

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

  createeventActivityTicketForm() {
    this.eventActivityTicketForm = this.fb.group({
      Id: 0,
      MemServiceId: ['', Validators.required],
      // AvailabilityId: null,
      VatChargePercent: null,
      MemServiceTypeId: 6,
      ServiceChargePercent: null,
      TicketLimit: null,
      Location: null,
      Description: null,
      formFile: null,
      PromoCode: '',
      StartDate: this.formatDate(new Date()),
      EndDate: this.formatDate(new Date()),
      EventDate: this.formatDate(new Date()),
      ImgFileUrl: null,
      Title: null,
      TokenCode:'',
      ServiceTicketDetailReqs: this.fb.array([]),
      EventTokenReqs: this.fb.array([]),
    });


    this.eventActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray;
    if (!this.eventTicketId) {
      this.createDetail();
    }
    this.serviceTicketDetailArray = (
      this.eventActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray
    ).controls;


    
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  addEventToken() {
    
    if (!this.eventActivityTicketForm.value.TokenCode) {
      return this.alertService.error('Please provide valid token code');
    }
 


    var obj = {
      ServiceTicketId:this.eventActivityTicketForm.value.MemServiceId,
      TokenTitle: this.eventActivityTicketForm.value.TokenCode,
      TokenCode: this.eventActivityTicketForm.value.TokenCode,
      
    }
    this.EventTokenReqs?.push(obj);
  }

  removeEventTokenDetail(x: any) {
    
    const index = this.EventTokenReqs?.findIndex(x=>x.TokenCode==x.TokenCode);
    if (index! > -1) {
      this.EventTokenReqs?.splice(index!, 1);
    }
  }
  createDetail() {
    const now = new Date();
    var currentTime = this.datePipe.transform(now, 'HH:mm');
    const newItem = this.fb.group({
      Id: 0,
      UnitPrice: 0,
      MaxQuantity: 1,
      MinQuantity: 1,
      ServiceTicketTypeId: null
    });
    (this.eventActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray).push(newItem);
  }

  addItemDetail(i) {
    if (!this.serviceTicketDetailArray[this.serviceTicketDetailArray?.length - 1]
      .value.ServiceTicketTypeId) {
      return;
    }
    this.createDetail();
  }

  removeItem(index: number) {
    (this.eventActivityTicketForm.get("ServiceTicketDetailReqs") as FormArray).removeAt(
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
        this.serviceTicketTypeList = this.serviceTicketTypeList.filter((x) => x.ServiceType == 'Event');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  triggerGetAvailabilityDetail(event) {
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

    var eventActivityTicket = this.prepareToSave();

    this.service.createActivityTicket(eventActivityTicket).subscribe(
      (data) => {
        this.showAlert(this.alertType.createSuccessAlert);
        this.router.navigate(['activity/ticket/list']);

      },
      (err) => {
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

  imageChangeHandler(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.eventActivityTicketForm.get('formFile').patchValue(file);
    reader.onload = (e: any) => {
      this.eventActivityTicketForm.get('ImgFileUrl').patchValue(e.target.result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    const inputElement = event.target as HTMLInputElement;

  }

  removeImage() {
    this.eventActivityTicketForm.get('ImgFileUrl').patchValue(null);
    this.eventActivityTicketForm.get('formFile').patchValue(null);
    this.cdr.detectChanges();
  }
  patchEventTitle(event) {
    
    this.eventActivityTicketForm.get("Title").patchValue(event.Title);
  }

  prepareToSave() {
    const formData = new FormData();
    
    formData.append('Id', this.eventActivityTicketForm.value.Id);
    formData.append('MemServiceId', this.eventActivityTicketForm.value.MemServiceId);
    formData.append('MemServiceTypeId', this.eventActivityTicketForm.value.MemServiceTypeId);
    // formData.append('AvailabilityId', this.eventActivityTicketForm.value.AvailabilityId);
    formData.append('VatChargePercent', this.eventActivityTicketForm.value.VatChargePercent);
    formData.append('ServiceChargePercent', this.eventActivityTicketForm.value.ServiceChargePercent);
    formData.append('TicketLimit', this.eventActivityTicketForm.value.TicketLimit);
    formData.append('Description', this.eventActivityTicketForm.value.Description);
    formData.append('formFile', this.eventActivityTicketForm.value.formFile);
    formData.append('ImgFileUrl', this.eventActivityTicketForm.value.ImgFileUrl);
    formData.append('Location', this.eventActivityTicketForm.value.Location);
    formData.append('StartDate', this.eventActivityTicketForm.value.StartDate);
    formData.append('EndDate', this.eventActivityTicketForm.value.EndDate);
    formData.append('EventDate', this.eventActivityTicketForm.value.EventDate);
    formData.append('PromoCode', this.eventActivityTicketForm.value.PromoCode);
    formData.append('Title', this.eventActivityTicketForm.value.Title);

    if (this.serviceTicketDetailArray.length > 0) {
      this.serviceTicketDetailArray.forEach((item, index) => {
        if ( item.Id !== 0) {
          formData.append(`ServiceTicketDetailReqs[${index}].Id`, item.value.Id.toString());
        }
        formData.append(`ServiceTicketDetailReqs[${index}].UnitPrice`, item.value.UnitPrice?.toString());
        formData.append(`ServiceTicketDetailReqs[${index}].MaxQuantity`, item.value.MaxQuantity?.toString());
        formData.append(`ServiceTicketDetailReqs[${index}].MinQuantity`, item.value.MinQuantity?.toString());
        formData.append(`ServiceTicketDetailReqs[${index}].ServiceTicketTypeId`, item.value.ServiceTicketTypeId?.toString());
      });
    }
    
    if (this.EventTokenReqs) {
      this.EventTokenReqs.forEach((item, index) => {
        if (item.Id && item.Id !== 0) {
          formData.append(`EventTokenReqs[${index}].Id`, item.Id.toString());
        }
        formData.append(`EventTokenReqs[${index}].ServiceTicketId`, item.ServiceTicketId.toString());
        formData.append(`EventTokenReqs[${index}].TokenCode`, item.TokenCode.toString());
        formData.append(`EventTokenReqs[${index}].TokenTitle`, item.TokenTitle.toString());
      });
    }
    if (this.selectedLayouts.length > 0) {

      this.selectedLayouts.forEach((item, index) => {
        if (item.Id !== 0) {
          // formData.append(`SerTicketAreaLayoutReqs[${index}].Id`, item.Id.toString());
        }
        formData.append(`SerTicketAreaLayoutReqs[${index}].Title`, item.Title.toString());
        formData.append(`SerTicketAreaLayoutReqs[${index}].AreaLayoutId`, item.Id.toString());


        if (item.AreaLayoutDetails && item.AreaLayoutDetails.length > 0) {
          item.AreaLayoutDetails.forEach((subDetail, subIndex) => {
            if (subDetail.Id !== 0) {
              // formData.append(`AreaLayoutDetails[${index}].AreaLayoutDetails[${subIndex}].Id`, subDetail.value.Id.toString());
            }

            formData.append(`SerTicketAreaLayoutReqs[${index}].AreaLayoutDetails[${subIndex}].AreaLayoutId`, subDetail.AreaLayoutId);
            formData.append(`SerTicketAreaLayoutReqs[${index}].AreaLayoutDetails[${subIndex}].TableId`, subDetail.TableId);
            formData.append(`SerTicketAreaLayoutReqs[${index}].AreaLayoutDetails[${subIndex}].TableName`, subDetail.TableName);
            formData.append(`SerTicketAreaLayoutReqs[${index}].AreaLayoutDetails[${subIndex}].NumberOfChair`, subDetail.NumberOfChair);
          });
        }
      });




    }



    return formData;

  }
  areaLayoutButtonClick(areaLayoutModal) {
    this.getAllAreaLayoutData(areaLayoutModal);

  }
  addLayoutToModel(item) {
    console.log(item);
    this.selectedLayouts.push(item)


  }

  getAllAreaLayoutData(areaLayoutModal) {

    this.areaLayoutService.getAreaLayoutDetailsList().subscribe(
      (data) => {
        this.areaLayoutDataList = data.Data;
        this.modalService.open(areaLayoutModal, { centered: true, backdrop: 'static' })
      },
      (err) => {
        console.log(err);
        this.alertService.info("No Area Layout Found")

      }
    );
  }
  deleteSelectedLayout(Id) {
    var index = this.selectedLayouts.findIndex(c => c.Id == Id);
    this.selectedLayouts.splice(index, 1)
  }

  openTooltip(tooltip) {
    // Close any previously opened tooltip
    if (this.activeTooltip && this.activeTooltip !== tooltip) {
      this.activeTooltip.close();
    }

    // Open the new tooltip and set it as the active one
    tooltip.open();
    this.activeTooltip = tooltip;
  }

  onMouseEnter(tooltip) {
    // Clear any pending close timeout (if the user hovers back quickly)
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }

    // Set a timeout to open the tooltip after 1 second (1000 ms)
    this.tooltipTimeout = setTimeout(() => {
      this.openTooltip(tooltip);
      this.isInTableOrButton = true; // Mark that the cursor is in the active area
    }, 1); // 1-second delay for opening
  }

  onMouseLeave(tooltip, source: string) {
    // Clear the opening timeout if mouse leaves before the tooltip is opened
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    // Check if the user is still hovering over the button or table
    if (source === 'button' || source === 'table') {
      // If leaving button or table, delay closing by 1 second
      this.isInTableOrButton = false;
      this.closeTimeout = setTimeout(() => {
        if (!this.isInTableOrButton) {
          tooltip.close();
          this.activeTooltip = null; // Reset the active tooltip
        }
      }, 50); // 1-second delay for closing
    }
  }

  onMouseEnterTable() {
    // Prevent the tooltip from closing when hovering over the table
    this.isInTableOrButton = true;
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
  }

}
