import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { ActivityTicketTypeService } from '../../services/activity-ticket-type.service';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-activity-ticket-type',
  templateUrl: './activity-ticket-type.component.html',
  styleUrls: ['./activity-ticket-type.component.css']
})
export class ActivityTicketTypeComponent implements OnInit {

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  activityTicketTypes: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  activityTicketTypeForm: FormGroup;
  isForDeleteId: number;
  memberTypeList: any;
  serviceTypes: any;

  constructor(
    private service: ActivityTicketTypeService,
    private activityService: ActivityService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService
  ) { }

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.getActivityTicketTypeList();
    this.createFilterForm();
    this.createactivityTicketTypeForm();
    this.loadServiceTypeData();
  }

  createactivityTicketTypeForm() {
    this.activityTicketTypeForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
      ServiceType: '',
      
    });
  }

  loadServiceTypeData() {
    this.activityService.getServiceTypeData().subscribe(
      (data) => {
        console.log(data);
        this.serviceTypes = data.DataList;
      },
      (err)=>{
        console.log(err);
        
      }
    );
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createFilterForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
    });
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getActivityTicketTypeList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getActivityTicketTypeList() {
    
    this.spin = true;
    this.service
      .getActivityTicketTypePagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          this.activityTicketTypes = data.Data;
          this.hasData = this.activityTicketTypes?.length > 0;
          this.numberOfEntries = data.Count;
          this.cdr.detectChanges();
        },
        (err) => {
          this.spin = false;
          this.hasData = false;
        }
      );
  }

  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getActivityTicketTypeList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.activityTicketTypeForm.patchValue({
        Id: data.Id,
        Title: data.Title,
        ServiceType: data.ServiceType,
      });
    } else {
      // this.editId = null;
      this.activityTicketTypeForm.reset();
      this.activityTicketTypeForm.get('Id').patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  reloadData() {
    this.currentPage = 1;
    this.getActivityTicketTypeList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getActivityTicketTypeList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.activityTicketTypeForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service.createActivityTicketType(this.activityTicketTypeForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getActivityTicketTypeList();
          this.activityTicketTypeForm.value.Id
            ? this.showAlert(this.alertType.updateSuccessAlert)
            : this.showAlert(this.alertType.createSuccessAlert);
        }
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  deleteButtonClick(id) {
    this.isForDeleteId = id;
    this.deleteSwal.fire().then((clicked) => {
      // if (clicked.isConfirmed) {
      //   this.showAlert(this.alertType.deleteSuccessAlert);
      // }
    });
  }
  triggerDelete() {
    this.service.deleteActivityTicketType(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getActivityTicketTypeList();
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  filterData() {
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = this.searchForm.value.pageSize;
    this.getActivityTicketTypeList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('ActivityTicketType');
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
