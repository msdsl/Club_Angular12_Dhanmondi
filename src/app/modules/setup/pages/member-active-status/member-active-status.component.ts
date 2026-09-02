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
import { MemberActiveStatusService } from '../../services/member-active-status.service';

@Component({
  selector: 'app-member-active-status',
  templateUrl: './member-active-status.component.html',
  styleUrls: ['./member-active-status.component.css'],
})
export class MemberActiveStatusComponent implements OnInit {
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
  memberActiveStatus: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  memberActiveStatusForm: FormGroup;
  isForDeleteId: number;

  constructor(
    private service: MemberActiveStatusService,
    private memberService: MemberService,
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
    this.getMemberActiveStatusList();
    this.createFilterForm();
    this.createMemberActiveStatusForm();
  }

  createMemberActiveStatusForm() {
    this.memberActiveStatusForm = this.fb.group({
      Id: 0,
      Name: ['', Validators.required],
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
    this.getMemberActiveStatusList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getMemberActiveStatusList() {
    this.spin = true;
    this.service
      .getMemberActiveStatusPagination(
        this.currentPage,
        this.pageSize,
        this.searchKey
      )
      .subscribe(
        (data) => {
          this.memberActiveStatus = data.Data;
          this.hasData = this.memberActiveStatus?.length > 0;
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
    this.getMemberActiveStatusList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.memberActiveStatusForm.patchValue({
        Id: data.Id,
        Name: data.Name,
      });
    } else {
      // this.editId = null;
      this.memberActiveStatusForm.reset();
      this.memberActiveStatusForm.get('Id').patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  reloadData() {
    this.currentPage = 1;
    this.getMemberActiveStatusList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getMemberActiveStatusList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.memberActiveStatusForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service
      .createMemberActiveStatus(this.memberActiveStatusForm.value)
      .subscribe(
        (data) => {
          console.log(data);
          if (data.HasError) {
            this.showAlert(this.alertType.errorAlert);
          } else {
            this.getMemberActiveStatusList();
            this.memberActiveStatusForm.value.Id
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
    this.service.deleteMemberActiveStatus(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getMemberActiveStatusList();
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
    this.getMemberActiveStatusList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('MemberActiveStatus');
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
