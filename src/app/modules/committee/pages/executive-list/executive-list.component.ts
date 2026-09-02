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
import { Router } from '@angular/router';

@Component({
  selector: 'app-executive-list',
  templateUrl: './executive-list.component.html',
  styleUrls: ['./executive-list.component.css'],
})
export class ExecutiveListComponent implements OnInit {
  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  isShowFilter: any = false;
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
  isFilter = true;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  committeeCategoryForm: FormGroup;
  isForDeleteId: number;
  CommitteeList: any;
  filterForm: FormGroup;

  YearList = [
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
    private service: CommitteeService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;

    this.createSearchForm();
    this.createFilterForm();
    this.getCommittee();
    this.createcommitteeCategoryForm();
  }

  createcommitteeCategoryForm() {
    this.committeeCategoryForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
    });
  }

  resetFilterForm() {
    this.filterForm.get('Year').patchValue('2024');
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createSearchForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
      searchYear: '',
    });
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      Year: '2024',
    });
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getCommittee();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getCommittee() {
    // this.searchForm.value.searchYear

    this.service
      .getExecutiveCommitteeList('Executive', this.filterForm.value.Year)
      .subscribe(
        (data) => {
          this.CommitteeList = data.Data;
          this.hasData = true;
          // this.cdr.detectChanges()
        },
        (err) => {
          console.log(err);
          this.hasData = false;
        }
      );
  }

  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getCommittee();
  }

  careateOrEditModalPopUp() {
    this.router.navigate(['committee/executive/create']);
  }
  goToEditPage(Id) {
    this.router.navigate(['committee/executive/edit/' + Id]);
  }

  reloadData() {
    this.currentPage = 1;
    this.getCommittee();
  }
  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getCommittee();
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
            this.getCommittee();

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
        this.getCommittee();
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
    this.getCommittee();
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
  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }
}
