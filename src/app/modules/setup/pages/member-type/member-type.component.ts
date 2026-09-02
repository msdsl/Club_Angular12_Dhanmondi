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
import { MemberTypeService } from '../../services/member-type.service';
import { MemberService } from '../../services/member.service';

@Component({
  selector: 'app-member-type',
  templateUrl: './member-type.component.html',
  styleUrls: ['./member-type.component.css'],
})
export class MemberTypeComponent implements OnInit {
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
  memberTypes: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  memberTypeForm: FormGroup;
  isForDeleteId: number;
  categoryList: any;

  constructor(
    private service: MemberTypeService,
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
    this.getMemberTypeList();
    this.createFilterForm();
    this.creatememberTypeForm();
    this.loadCategoryPatternData();
  }

  creatememberTypeForm() {
    this.memberTypeForm = this.fb.group({
      Id: 0,
      Name: ['', Validators.required],
      CategoryPatternId: null,
      IsSubscribed: false,
      OldId: null,
    });
  }

  loadCategoryPatternData(callback?: () => void) {
    this.memberService.getCategoryPatterns().subscribe((res: any) => {
      if (!res.HasError && res.DataList) {
        this.categoryList = res.DataList.map((item: any) => ({
          ...item,
          Id: item.Id != null ? item.Id : item.Value != null ? item.Value : item.Key,
          Title: item.Title || item.Name || item.Text || item.CategoryName || item.PatternName,
        }));
        if (callback) {
          callback();
        }
        this.cdr.detectChanges();
      }
    }, (error: any) => {
      console.error('Error loading category patterns:', error);
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
      searchKey: '',
    });

    this.searchForm.get('searchKey')?.valueChanges.subscribe((val) => {
      this.searchKey = val;
      this.currentPage = 1;
      this.getMemberTypeList();
    });
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getMemberTypeList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getMemberTypeList() {
    this.spin = true;
    this.service
      .getMemberTypePagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          let list = data?.Data || [];
          if (this.searchKey && this.searchKey.trim() !== '') {
            const key = this.searchKey.trim().toLowerCase();
            const filtered = list.filter((item: any) =>
              (item.Name && item.Name.toLowerCase().includes(key)) ||
              (item.CategoryName && item.CategoryName.toLowerCase().includes(key)) ||
              (item.OldId && item.OldId.toString().toLowerCase().includes(key))
            );
            if (filtered.length > 0 || list.length === data.Count) {
              list = filtered;
            }
          }
          this.memberTypes = list;
          this.hasData = this.memberTypes?.length > 0;
          this.numberOfEntries = this.searchKey && this.searchKey.trim() !== '' ? this.memberTypes.length : (data?.Count || 0);
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
    this.getMemberTypeList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    const patchRowData = () => {
      if (data?.Id) {
        let categoryId = data.CategoryPatternId ?? data.CategoryId ?? data.MemberCategoryId ?? data.MemberCategoryPatternId;
        if (this.categoryList && this.categoryList.length > 0) {
          if (categoryId != null) {
            const matchById = this.categoryList.find((c: any) => c.Id == categoryId || c.Value == categoryId);
            if (matchById) {
              categoryId = matchById.Id;
            }
          }
          if (categoryId == null && data.CategoryName) {
            const matchByName = this.categoryList.find(
              (c: any) =>
                (c.Title && c.Title.toString().trim().toLowerCase() === data.CategoryName.toString().trim().toLowerCase()) ||
                (c.Name && c.Name.toString().trim().toLowerCase() === data.CategoryName.toString().trim().toLowerCase()) ||
                (c.Text && c.Text.toString().trim().toLowerCase() === data.CategoryName.toString().trim().toLowerCase())
            );
            if (matchByName) {
              categoryId = matchByName.Id;
            }
          }
        }

        this.memberTypeForm.patchValue({
          Id: data.Id,
          Name: data.Name,
          CategoryPatternId: categoryId,
          IsSubscribed: data.IsSubscribed ?? false,
          OldId: data.OldId,
        });
        this.cdr.detectChanges();
      } else {
        this.memberTypeForm.reset();
        this.memberTypeForm.get('Id').patchValue(0);
        this.memberTypeForm.get('IsSubscribed').patchValue(false);
      }
    };

    if (!this.categoryList || this.categoryList.length === 0) {
      this.loadCategoryPatternData(() => {
        patchRowData();
      });
    } else {
      patchRowData();
    }

    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  reloadData() {
    this.currentPage = 1;
    this.getMemberTypeList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getMemberTypeList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.memberTypeForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    const payload = {
      ...this.memberTypeForm.value,
      CategoryId: this.memberTypeForm.value.CategoryPatternId,
      CategoryPatternId: this.memberTypeForm.value.CategoryPatternId,
    };

    this.service.createMemberType(payload).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getMemberTypeList();
          this.memberTypeForm.value.Id
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
    this.service.deleteMemberType(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getMemberTypeList();
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  filterData() {
    this.searchKey = this.searchForm.get('searchKey')?.value || '';
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.getMemberTypeList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('MemberType');
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
