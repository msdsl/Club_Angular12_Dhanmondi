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
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-subscription-payment-list',
  templateUrl: './subscription-payment-list.component.html',
  styleUrls: ['./subscription-payment-list.component.css'],
})
export class SubscriptionPaymentListComponent implements OnInit {
  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  isShowFilter: any = false;
  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  filterForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  colleges: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = true;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  collegeForm: FormGroup;
  isForDeleteId: number;
  endDate;
  startDate;
  memberShipNo: any = null;
  subscriptionPaymentList: any;
  subPayemnt: any;
  pdfSrc: Uint8Array;
  url: string;

  constructor(
    private service: SubscriptionService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private alertType: AlertTypeService,
    private _modalService: NgbModal
  ) {
    this.endDate = new Date();
    this.startDate = new Date(
      this.endDate.getFullYear(),
      this.endDate.getMonth() - 1,
      this.endDate.getDate()
    ).toISOString();
    this.endDate = new Date().toISOString();
  }

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;

    this.createFilterForm();
    this.getSubscriptionPaymentList();
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createFilterForm() {
    this.filterForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
      MemberShipNo: null,
      startDate: null,
      endDate: null,
    });
  }
  resetFilterForm() {
    this.filterForm.reset();
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getSubscriptionPaymentList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getFilteredSubscriptionPaymentList() {
    if (this.filterForm.value.startDate) {
      this.startDate = this.filterForm.value.startDate;
    }
    if (this.filterForm.value.endDate) {
      this.endDate = this.filterForm.value.endDate;
    }
    this.getSubscriptionPaymentList();
  }

  getSubscriptionPaymentList() {
    this.spin = true;
    this.service
      .getSubscriptionPaymentList(
        this.startDate,
        this.endDate,
        this.filterForm.value.MemberShipNo,
        this.currentPage,
        this.pageSize
      )
      .subscribe(
        (data) => {
          this.subscriptionPaymentList = data.Data;
          this.hasData = this.subscriptionPaymentList?.length > 0;
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
    this.getSubscriptionPaymentList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.collegeForm.patchValue({
        Id: data.Id,
        Name: data.Name,
      });
    } else {
      // this.editId = null;
      this.collegeForm.get('Id').patchValue(0);
      this.collegeForm.get('Name').patchValue(null);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg', centered: true });
  }

  reloadData() {
    this.currentPage = 1;
    this.getSubscriptionPaymentList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  filterData() {
    this.filterForm
      .get('MemberShipNo')
      .patchValue(this.filterForm.value.searchKey);
    // this.pageSize = this.filterForm.value.pageSize;
    this.getSubscriptionPaymentList();
  }

  getByPaymentNo(x: any, viewerModal: any) {
    this.service.getSubscriptionPaymentNo(x).subscribe((res) => {
      this.subPayemnt = res.Data;
      this._modalService.open(viewerModal, { size: 'lg' });
    });
  }

  openPdfViewerModal(content, paymentNo) {
    var reportType = 'PDF';
    this.service
      .getSubscriptionPaymentReport(paymentNo)
      .subscribe((blobData: Blob) => {
        let documentBlob = new Blob([blobData], {
          type: reportType == 'PDF' ? 'application/pdf' : '',
        });

        this.url = URL.createObjectURL(documentBlob);
        console.log(this.url);

        this._modalService.open(content, { size: 'lg', centered: true });
        this.cdr.detectChanges();
      });
  }

  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }
}
