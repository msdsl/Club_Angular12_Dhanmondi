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
import { ManageChargeService } from '../../services/manage-charge.service';

@Component({
  selector: 'app-manage-charge',
  templateUrl: './manage-charge.component.html',
  styleUrls: ['./manage-charge.component.css'],
})
export class ManageChargeComponent implements OnInit {
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
  manageCharges: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  manageChargeForm: FormGroup;
  isForDeleteId: number;
  memberTypeList: any;

  subscriptionModList = [
    {
      Id: 2,
      Name: 'Q1',
    },
    {
      Id: 3,
      Name: 'Q2',
    },
    {
      Id: 4,
      Name: 'Q3',
    },
    {
      Id: 5,
      Name: 'Q4',
    },
  ];
  SubscribedYearList = [
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
    '2026',
    '2027',
    '2028',
    '2029',
    '2030',
  ];

  constructor(
    private service: ManageChargeService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.getManageChargeList();
    this.createFilterForm();
    this.createmanageChargeForm();
  }

  createmanageChargeForm() {
    this.manageChargeForm = this.fb.group({
      Id: 0,
      SubscribedYear: ['', Validators.required],
      SubscriptionModId: null,
      AbroadFee: 0,
      SubscriptionFee: 0,
      LateFee: 0,
    });
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation();
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
    this.getManageChargeList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getManageChargeList() {
    this.spin = true;
    this.service
      .getManageChargePagination(
        this.currentPage,
        this.pageSize,
        this.searchKey
      )
      .subscribe(
        (data) => {
          this.manageCharges = data.Data;
          console.log(this.manageCharges);
          this.hasData = this.manageCharges?.length > 0;
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
    this.getManageChargeList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.manageChargeForm.patchValue({
        Id: data.Id,
        SubscribedYear: data.SubscribedYear,
        SubscriptionModId: data.SubscriptionModId,
        AbroadFee: data.AbroadFee,
        SubscriptionFee: data.PaymentFees,
        LateFee: data.LateFee,
      });
    } else {
      // this.editId = null;
      this.manageChargeForm.reset();
      this.manageChargeForm.get('Id').patchValue(0);
      this.manageChargeForm.get('AbroadFee').patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  reloadData() {
    this.currentPage = 1;
    this.getManageChargeList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getManageChargeList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.manageChargeForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service.createManageCharge(this.manageChargeForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getManageChargeList();
          this.manageChargeForm.value.Id
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
    this.service.deleteManageCharge(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getManageChargeList();
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
    this.getManageChargeList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('ManageCharge');
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
