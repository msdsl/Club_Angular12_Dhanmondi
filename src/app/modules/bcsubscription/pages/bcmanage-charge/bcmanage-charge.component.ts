import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { BcmanageChargeService } from '../../services/bcmanage-charge.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';

@Component({
  selector: 'app-bcmanage-charge',
  standalone: false,
  templateUrl: './bcmanage-charge.component.html',
  styleUrl: './bcmanage-charge.component.scss',
})
export class BcmanageChargeComponent implements OnInit {
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
  subscriptionForm: FormGroup;
  isForDeleteId: number;
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  yearList: any[] = [];
  constructor(
    private _service: BcmanageChargeService,
    private _modalService: NgbModal,
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private _alertType: AlertTypeService
  ) {}

  ngOnInit(): void {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.getManageChargeList();
    this.createFilterForm();
    this.createForm();
  }
  triggerDelete() {
    this._service.deleteManageCharge(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this._alertType.deleteSuccessAlert);
        this.getManageChargeList();
      },
      (err) => {
        console.log(err);
        this.showAlert(this._alertType.errorAlert);
      }
    );
  }

  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getManageChargeList();
  }
  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.SubscribedYear) {
      // this.editId = id;
      this.subscriptionForm.patchValue({
        Id: data.Id,
        SubscribedYear: data.SubscribedYear,
        Model: data.Model,
      });
    } else {
      this.createForm();
    }
    this._modalService.open(createOrUpdateModal, { size: 'lg' });
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
    this._service
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
          this._cdr.detectChanges();
        },
        (err) => {
          this.spin = false;
          this.hasData = false;
        }
      );
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createFilterForm() {
    this.searchForm = this._fb.group({
      pageSize: 10,
      searchKey: null,
    });
  }
  generateYearList(): any[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    const yearList: any[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const obj = {
        Id: year.toString(),
        Name: year.toString(),
      };
      yearList.push(obj);
    }

    return yearList;
  }
  createForm() {
    this.yearList = this.generateYearList();
    this.subscriptionForm = this._fb.group({
      SubscribedYear: [
        new Date().getFullYear().toString(),
        Validators.required,
      ],
      Model: this._fb.array(this.createMonthList()),
    });
  }
  createMonthList(): FormGroup[] {
    return this.monthNames.map((monthName, index) =>
      this._fb.group({
        Id: [0],
        SubscribedYear: [null],
        Title: [monthName],
        SubscribedQuaters: [null],
        SubscriptionModIds: [null],
        SubscribedQuater: [null],
        SubscriptionModId: [null],
        SubscriptionFee: [0, Validators.required],
        LateFee: [0],
        AbroadFee: [0],
        CommandType: [''],
      })
    );
  }

  get modelArray(): FormArray {
    return this.subscriptionForm.get('Model') as FormArray;
  }

  onSubmit(): void {
    if (!this.subscriptionForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this._service.createManageCharge(this.subscriptionForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this._alertType.errorAlert);
        } else {
          this.getManageChargeList();
          this.subscriptionForm.value.Id
            ? this.showAlert(this._alertType.updateSuccessAlert)
            : this.showAlert(this._alertType.createSuccessAlert);
        }
      },
      (err) => {
        console.log(err);
        this.showAlert(this._alertType.errorAlert);
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
    this._alertType.setAlertTypeText('ManageCharge');
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
    this._cdr.detectChanges();
    this.noticeSwal.fire();
  }
}
