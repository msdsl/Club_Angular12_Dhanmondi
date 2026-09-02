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
import { MemberService } from '../../services/member.service';
import { MemberFeesService } from '../../services/member-fees.service';
import { MemberTypeService } from '../../services/member-type.service';

@Component({
  selector: 'app-member-fees',
  templateUrl: './member-fees.component.html',
  styleUrls: ['./member-fees.component.css'],
})
export class MemberFeesComponent implements OnInit {
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
  memberFeess: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  memberFeesForm: FormGroup;
  isForDeleteId: number;
  memberTypeList: any;

  constructor(
    private service: MemberFeesService,
    private memberTypeService: MemberTypeService,
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
    this.getMemberFeesList();
    this.createFilterForm();
    this.creatememberFeesForm();
    this.getAllMemberType();
  }

  creatememberFeesForm() {
    this.memberFeesForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
      Amount: null,
      DisplayName: null,
      MemberTypeId: null,
    });
  }

  getAllMemberType() {
    this.memberTypeService
      .getMemberTypePagination(1, 10000)
      .subscribe((res) => {
        if (!res.HasError) {
          this.memberTypeList = res.Data;
        }
        (error: any) => {
          error.Messages.forEach((element: string) => {
            // this.alertService.error(element);
          });
        };
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
    this.getMemberFeesList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getMemberFeesList() {
    this.spin = true;
    this.service
      .getMemberFeesPagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          this.memberFeess = data.Data;
          this.hasData = this.memberFeess?.length > 0;
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
    this.getMemberFeesList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.memberFeesForm.patchValue({
        Id: data.Id,
        Title: data.Title,
        Amount: data.Amount,
        DisplayName: data.DisplayName,
        MemberTypeId: data.MemberTypeId,
      });
    } else {
      // this.editId = null;
      this.memberFeesForm.reset();
      this.memberFeesForm.get('Id').patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  reloadData() {
    this.currentPage = 1;
    this.getMemberFeesList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getMemberFeesList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.memberFeesForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service.createMemberFees(this.memberFeesForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getMemberFeesList();
          this.memberFeesForm.value.Id
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
    this.service.deleteMemberFees(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getMemberFeesList();
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
    this.getMemberFeesList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('MemberFees');
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
