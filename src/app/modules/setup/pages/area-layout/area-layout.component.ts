import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { AreaStatusService } from '../../services/area-status.service';
import { AreaLayoutService } from '../../services/area-layout.service';
import { TableSetupService } from '../../services/table-setup.service';

@Component({
  selector: 'app-area-layout',
  standalone: false,
  templateUrl: './area-layout.component.html',
  styleUrl: './area-layout.component.scss',
})
export class AreaLayoutComponent implements OnInit {
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
  areaLayouts: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  areaLayoutForm: FormGroup;
  isForDeleteId: number;
  List: any;
  tableList: any[] = [];
  areaLayoutDetailArray: any;
  areaLayoutId: any;
  constructor(
    private _service: AreaLayoutService,
    private _tableSetupService: TableSetupService,
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
    this.getTableSetup();
    this.getList();
    this.createFilterForm();
    this.createForm();
  }

  createForm() {
    this.areaLayoutForm = this.fb.group({
      Id: 0,
      Title: [null, Validators.required],
      DisplayName:"",
      AreaLayoutDetails: this.fb.array([]),
    });

    this.areaLayoutForm.get("AreaLayoutDetails") as FormArray;
    if (!this.areaLayoutId) {
      this.createDetail();
    }
    this.areaLayoutDetailArray = (
      this.areaLayoutForm.get("AreaLayoutDetails") as FormArray
    ).controls;
  }

  createDetail() {
    const newItem = this.fb.group({
      Id: 0,
      TableId: 0,
      NumberOfChair: 0,
      AreaLayoutId:0,
      IsActive:true
    });
    (this.areaLayoutForm.get("AreaLayoutDetails") as FormArray).push(newItem);
  }
  addItemDetail(i) {
    if (!this.areaLayoutDetailArray[this.areaLayoutDetailArray?.length - 1]
      .value.TableId) {
      return;
    }
    this.createDetail();
  }

  removeItem(index: number) {
    (this.areaLayoutForm.get("AreaLayoutDetails") as FormArray).removeAt(
      index
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
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
    });
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getList() {
    this.spin = true;
    this._service
      .getPagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          this.areaLayouts = data.Data;
          this.hasData = this.areaLayouts?.length > 0;
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
    this.getList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    
    if (data?.Id) {
      this.createForm();
      this.areaLayoutForm.patchValue(data);
      this.setDetailData(data.AreaLayoutDetails)
    } else {
      this.createForm();
      this.areaLayoutForm.get('Id').patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  setDetailData(data) {
    var i = 0;
    const areaLayoutDetailArray = this.areaLayoutForm.get('AreaLayoutDetails') as FormArray;
    
    data.forEach((element) => {
      this.createDetail();
      areaLayoutDetailArray.at(i).get("Id").patchValue(element.Id);
      areaLayoutDetailArray.at(i).get("TableId").patchValue(element.TableId);
      areaLayoutDetailArray.at(i).get("NumberOfChair").patchValue(element.NumberOfChair);
      i++;
    });
  
    // Remove the last element
    if (areaLayoutDetailArray.length > 0) {
      areaLayoutDetailArray.removeAt(areaLayoutDetailArray.length - 1);
    }

  }

  reloadData() {
    this.currentPage = 1;
    this.getList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.areaLayoutForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.areaLayoutForm.get("DisplayName").patchValue(this.areaLayoutForm.value.Title)

    this._service.create(this.areaLayoutForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getList();
          this.areaLayoutForm.value.Id
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
    this._service.delete(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getList();
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
    this.getList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Area status');
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
  getTableSetup() {
    this._tableSetupService.getPagination(1, 1000, null).subscribe(
      (data) => {
        this.tableList = data.Data;
        this.hasData = this.tableList?.length > 0;
        this.numberOfEntries = data.Count;
        //  this.cdr.detectChanges();
      },
      (err) => {
        this.spin = false;
        this.hasData = false;
      }
    );
  }
}
