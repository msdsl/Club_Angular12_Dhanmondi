import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { CollegeService } from '../../services/college.service';
import { TableSetupService } from '../../services/table-setup.service';

@Component({
  selector: 'app-table-setup',
  standalone: false,
  templateUrl: './table-setup.component.html',
  styleUrl: './table-setup.component.scss',
})
export class TableSetupComponent implements OnInit {
  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  spin: boolean = false;
  hasData: boolean = false;
  tableSetups: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  tableSetupForm: FormGroup;
  isForDeleteId: number;
  searchKey: any = '';

  constructor(
    private _service: TableSetupService,
    private _modalService: NgbModal,
    private _fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private _alertType: AlertTypeService
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.createFilterForm();
    this.createForm();
    this.getList();
  }

  createForm() {
    this.tableSetupForm = this._fb.group({
      Id: 0,
      Title: ['', Validators.required],
      DisplayName: [''],
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
    this.searchForm = this._fb.group({
      pageSize: 10,
      searchKey: '',
    });

    this.searchForm.get('searchKey')?.valueChanges.subscribe((val) => {
      this.searchKey = val;
      this.currentPage = 1;
      this.getList();
    });
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.getList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getList() {
    this.spin = true;
    this._service.getPagination(this.currentPage, this.pageSize, this.searchKey).subscribe(
      (data) => {
        let list = data?.Data || [];
        if (this.searchKey && this.searchKey.trim() !== '') {
          const key = this.searchKey.trim().toLowerCase();
          const filtered = list.filter((item: any) =>
            (item.Title && item.Title.toLowerCase().includes(key)) ||
            (item.DisplayName && item.DisplayName.toLowerCase().includes(key)) ||
            (item.Name && item.Name.toLowerCase().includes(key))
          );
          if (filtered.length > 0 || list.length === data.Count) {
            list = filtered;
          }
        }
        this.tableSetups = list;
        this.hasData = this.tableSetups?.length > 0;
        this.numberOfEntries = this.searchKey && this.searchKey.trim() !== ''
          ? this.tableSetups.length
          : (data?.Count ?? data?.DataCount ?? data?.TotalCount ?? (this.tableSetups ? this.tableSetups.length : 0));
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
    this.getList();
  }

  modalRef: any;

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data && (data.Id !== undefined || data.id !== undefined)) {
      const id = data.Id ?? data.id;
      this.tableSetupForm.patchValue({
        Id: id,
        Title: data.Title || data.title || data.Name || data.name || '',
        DisplayName: data.DisplayName || data.displayName || data.Title || data.title || '',
      });
    } else {
      this.tableSetupForm.reset();
      this.tableSetupForm.get('Id')?.patchValue(0);
      this.tableSetupForm.get('Title')?.patchValue('');
      this.tableSetupForm.get('DisplayName')?.patchValue('');
    }
    this.modalRef = this._modalService.open(createOrUpdateModal, {
      size: 'lg',
      centered: true,
    });
  }

  reloadData() {
    this.currentPage = 1;
    this.getList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.getList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this._modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.tableSetupForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    const formVal = this.tableSetupForm.value;
    const currentId = formVal.Id ? Number(formVal.Id) : 0;
    const payload = {
      Id: currentId,
      id: currentId,
      Title: formVal.Title,
      title: formVal.Title,
      Name: formVal.Title,
      name: formVal.Title,
      DisplayName: formVal.DisplayName || formVal.Title,
      displayName: formVal.DisplayName || formVal.Title,
    };

    this._service.create(payload).subscribe(
      (data) => {
        console.log('Save table response:', data);
        if (data && data.HasError) {
          this.showAlert(this._alertType.errorAlert);
        } else {
          if (this.modalRef) {
            this.modalRef.close();
          } else {
            this._modalService.dismissAll();
          }
          this.getList();
          currentId > 0
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

  deleteButtonClick(id) {
    this.isForDeleteId = id;
    this.deleteSwal.fire().then((clicked) => {
      // if (clicked.isConfirmed) {
      //   this.showAlert(this._alertType.deleteSuccessAlert);
      // }
    });
  }

  triggerDelete() {
    this._service.delete(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this._alertType.deleteSuccessAlert);
        this.getList();
      },
      (err) => {
        console.log(err);
        this.showAlert(this._alertType.errorAlert);
      }
    );
  }

  filterData() {
    this.searchKey = this.searchForm.get('searchKey')?.value || '';
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.getList();
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this._alertType.setAlertTypeText('Table Setup');
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
