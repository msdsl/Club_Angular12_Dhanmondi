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
import { CommitteeService } from '../../services/committee.service';

@Component({
  selector: 'app-committee-category',
  templateUrl: './committee-category.component.html',
  styleUrls: ['./committee-category.component.css'],
})
export class CommitteeCategoryComponent implements OnInit {
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
  committeeCategorys: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  committeeCategoryForm: FormGroup;
  isForDeleteId: number;

  constructor(
    private service: CommitteeService,
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
    this.getCommitteeCategoryList();
    this.createFilterForm();
    this.createcommitteeCategoryForm();
  }

  createcommitteeCategoryForm() {
    this.committeeCategoryForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
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
    this.getCommitteeCategoryList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getCommitteeCategoryList() {
    this.spin = true;
    this.service
      .getCommitteeCategoryPagination(
        this.currentPage,
        this.pageSize,
        this.searchKey
      )
      .subscribe(
        (data) => {
          this.committeeCategorys = data.Data;
          this.hasData = this.committeeCategorys?.length > 0;
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
    this.getCommitteeCategoryList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    ;
    if (data?.Id) {
      // this.editId = id;
      this.committeeCategoryForm.patchValue({
        Id: data.Id,
        Title: data.Title,
      });
    } else {
      // this.editId = null;
      this.committeeCategoryForm.get('Id').patchValue(0);
      this.committeeCategoryForm.get('Title').patchValue(null);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg', centered: true });
  }

  reloadData() {
    this.currentPage = 1;
    this.getCommitteeCategoryList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getCommitteeCategoryList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.committeeCategoryForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service
      .createCommitteeCategory(this.committeeCategoryForm.value)
      .subscribe(
        (data) => {
          console.log(data);
          if (data.HasError) {
            this.showAlert(this.alertType.errorAlert);
          } else {
            this.getCommitteeCategoryList();

            this.committeeCategoryForm.value.Id
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
      if (clicked.isConfirmed) {
        this.showAlert(this.alertType.deleteSuccessAlert);
      }
    });
  }
  triggerDelete() {
    this.service.deleteCommitteeCategory(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getCommitteeCategoryList();
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
    this.getCommitteeCategoryList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('CommitteeCategory');
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
