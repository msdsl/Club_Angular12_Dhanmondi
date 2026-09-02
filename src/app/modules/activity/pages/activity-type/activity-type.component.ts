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
import { ActivityTypeService } from '../../services/activity-type.service';

@Component({
  selector: 'app-activity-type',
  templateUrl: './activity-type.component.html',
  styleUrls: ['./activity-type.component.css']
})
export class ActivityTypeComponent implements OnInit {

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
  activityTypes: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  activityTypeForm: FormGroup;
  isForDeleteId: number;
  memberTypeList: any;
 

  constructor(
    private service: ActivityTypeService,
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
    this.getActivityTypeList();
    this.createFilterForm();
    this.createactivityTypeForm();
  }

  createactivityTypeForm() {
    this.activityTypeForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
      DisplayName: '',
      
    });
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
    this.getActivityTypeList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getActivityTypeList() {
    this.spin = true;
    this.service
      .getActivityTypePagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          this.activityTypes = data.DataList;
          this.hasData = this.activityTypes?.length > 0;
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
    this.getActivityTypeList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.activityTypeForm.patchValue({
        Id: data.Id,
        Title: data.Title,
        DisplayName: data.DisplayName,
      });
    } else {
      // this.editId = null;
      this.activityTypeForm.reset();
      this.activityTypeForm.get('Id').patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  reloadData() {
    this.currentPage = 1;
    this.getActivityTypeList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getActivityTypeList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.activityTypeForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service.createActivityType(this.activityTypeForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getActivityTypeList();
          this.activityTypeForm.value.Id
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
    this.service.deleteActivityType(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getActivityTypeList();
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
    this.getActivityTypeList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('ActivityType');
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
