import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { MembershipTransferService } from '../../services/membership-transfer.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { MemberTypeService } from 'src/app/modules/setup/services/member-type.service';

@Component({
  selector: 'app-membership-transfer',
  standalone: false,
  templateUrl: './membership-transfer.component.html',
  styleUrl: './membership-transfer.component.scss',
})
export class MembershipTransferComponent implements OnInit {
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  fullDataList: any[] = [];
  dataList: any[] = []; // paged + filtered
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  createForm: FormGroup;
  isForDeleteId: number;
  memberTypeList: any;

  constructor(
    private _service: MembershipTransferService,
    private memberTypeService: MemberTypeService,
    private _modalService: NgbModal,
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.getMemberTypeList();
    this.getList();
    this.createFilterForm();
    this.createNewForm();
  }

  onSubmit() {
    console.log(this.createForm.value);
    this.spin = true;
    if (!this.createForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }
    this._service.createMembershipTransfer(this.createForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getList();
          this.createForm.reset();
          this.showAlert(this.alertType.createSuccessAlert);
        }
        this.spin = false;
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  getMemberTypeList() {
    this.memberTypeService.getMemberTypePagination(1, 1000).subscribe(
      (data) => {
        this.memberTypeList = data.Data;
        this._cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getMemberInfo(id: string, event: Event) {
    event.preventDefault(); // Stop form submit
    this._service.getMemberInfoByMembershipNo(id).subscribe(
      (res) => {
        const data = res.Data;

        this.createForm.patchValue({
          MemberId: data.MemberId,
          PrvCusID: data.PrvCusID,
          MemberName: data.MemberName,
          PreMembershipNo: data.MembershipNo,
          PreCardNo: data.CardNo,
          PreTypeId: data.MemberTypeId,
        });
      },
      (err) => {
        this._alert.error(err);
      }
    );
  }

  createNewForm() {
    this.createForm = this._fb.group({
      Id: 0,
      MemberId: [0, Validators.required],
      MemberName: [null],
      PrvCusID: [0, Validators.required],
      PreMembershipNo: ['', Validators.required],
      NewMembershipNo: ['', Validators.required],
      PreCardNo: ['', Validators.required],
      NewCardNo: ['', Validators.required],
      PreTypeId: [0, Validators.required],
      NewTypeId: [0, Validators.required],
      Note: [null],
    });
  }

  createFilterForm() {
    this.searchForm = this._fb.group({
      pageSize: 10,
      searchKey: null,
    });
  }
  getList() {
    this.spin = true;
    this._service.getMembershipTransferHist().subscribe(
      (data) => {
        this.fullDataList = data.Data;
        this.applyFilterAndPaging();
        this._cdr.detectChanges();
        this.spin = false;
      },
      (err) => {
        this.spin = false;
        this.hasData = false;
      }
    );
  }

  applyFilterAndPaging() {
    let filtered = this.fullDataList;

    // 1️⃣ Search filter
    if (this.searchKey && this.searchKey.trim() !== '') {
      const search = this.searchKey.toLowerCase();
      filtered = filtered.filter(
        (x) =>
          x.MemberName?.toLowerCase().includes(search) ||
          x.PreMembershipNo?.toLowerCase().includes(search) ||
          x.NewMembershipNo?.toLowerCase().includes(search) ||
          x.PreCardNo?.toLowerCase().includes(search) ||
          x.NewCardNo?.toLowerCase().includes(search) ||
          x.PreTypeText?.toLowerCase().includes(search) ||
          x.NewTypeText?.toLowerCase().includes(search) ||
          x.Note?.toLowerCase().includes(search)
      );
    }

    // 2️⃣ Paging
    this.numberOfEntries = filtered.length;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.dataList = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  updatePageWiseTableData(event: number) {
    this.currentPage = event;
    this.applyFilterAndPaging();
  }

  filterData() {
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = +this.searchForm.value.pageSize; // convert to number
    this.currentPage = 1; // reset to first page
    this.applyFilterAndPaging();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('AddonsItem');
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
  careateOrEditModalPopUp(modael: any) {
    this.createForm.reset();
    this._modalService.open(modael, {
      backdrop: 'static',
      size: 'lg',
    });
  }
}
