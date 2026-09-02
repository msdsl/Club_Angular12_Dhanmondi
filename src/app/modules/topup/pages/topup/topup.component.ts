import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { TopupService } from '../../services/topup.service';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.component.html',
  styleUrl: './topup.component.scss',
})
export class TopupComponent implements OnInit {
  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  filterForm: any;
  memberShipNo: any;
  spin: boolean = false;
  topups: any[] = [];
  hasData: boolean = false;
  isFilter: boolean = true;
  isShowFilter: any = false;
  topUpDetailsList: any;
  paymentInformation: any;
  pdfSrc: any;
  endDate;
  startDate;
  constructor(
    private _service: TopupService,
    private _modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.createFilterForm();
    this.getList();
  }

  filterData() {
    this.filterForm
      .get('MemberShipNo')
      .patchValue(this.filterForm.value.searchKey);
    this.getList();
  }
  showTopUpDetail(a: any, b: any, paymentDetailModal: any) {
    this.topUpDetailsList = this.topups.find((obj) => obj.Id === a) as any;
    this.paymentInformation = this.topUpDetailsList?.TopUpDetails.find(
      (obj) => obj.Id === b
    ) as any;
    this._modalService.open(paymentDetailModal, { size: 'lg' });
  }
  createTopup() {
    this.router.navigate(['topup/create']);
  }
  createFilterForm() {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    const fromDate: NgbDateStruct = {
      year: lastMonth.getFullYear(),
      month: lastMonth.getMonth() + 1,
      day: lastMonth.getDate(),
    };

    const currentDate: NgbDateStruct = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };

    this.filterForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
      MemberShipNo: null,
      FromDate: fromDate,
      ToDate: currentDate,
    });
  }
  resetFilterForm() {
    this.filterForm.reset();
  }

  url: any;
  openPdfViewerModal(content, id) {
    this.spin = true;
    var reportType = 'PDF';
    this._service.getTopUpsReport(id).subscribe((blobData: Blob) => {
      let documentBlob = new Blob([blobData], {
        type: reportType == 'PDF' ? 'application/pdf' : '',
      });
      this.url = URL.createObjectURL(documentBlob);
      this.cdr.detectChanges();
      this._modalService.open(content, { size: 'lg', centered: true });
      this.spin = false;
    });
  }
  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getList();
  }

  getList() {
    this.spin = true;
    if (this.filterForm.value.FromDate) {
      this.startDate = new DateConverter().dateModal(
        this.filterForm.value.FromDate
      );
    }
    if (this.filterForm.value.ToDate) {
      this.endDate = new DateConverter().dateModal(
        this.filterForm.value.ToDate
      );
    }
    this._service
      .getPagination(
        this.currentPage,
        this.pageSize,
        this.filterForm.value.MemberShipNo,
        this.startDate,
        this.endDate
      )
      .subscribe((data) => {
        this.topups = data.Data;
        this.hasData = this.topups?.length > 0;
        this.numberOfEntries = data.Count;
        this.spin = false;
      });
  }
  getFilteredList() {
    if (this.filterForm.value.FromDate) {
      this.startDate = new DateConverter().dateModal(
        this.filterForm.value.FromDate
      );
    }
    if (this.filterForm.value.ToDate) {
      this.endDate = new DateConverter().dateModal(
        this.filterForm.value.ToDate
      );
    }
    this.getList();
  }

  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }

  get totalTopUpAmount(): number {
    if (!this.topups || this.topups.length === 0) return 0;
    return this.topups.reduce((sum, item) => sum + (Number(item.TotalAmount) || 0), 0);
  }

  get successfulTopupsCount(): number {
    return this.numberOfEntries || this.topups?.length || 0;
  }
}
