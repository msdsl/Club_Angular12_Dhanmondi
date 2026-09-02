import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';
import { SubscriptionReportService } from '../../services/subscription-report.service';

@Component({
  selector: 'app-subscription-report',
  standalone: false,
  templateUrl: './subscription-report.component.html',
  styleUrl: './subscription-report.component.scss',
})
export class SubscriptionReportComponent implements OnInit {
  sectionNo: number;
  pdfSrc: any;
  spin: boolean = false;
  filterForm1: FormGroup;
  filterForm2: FormGroup;
  filterForm3: FormGroup;
  filterForm4: FormGroup;
  filterForm5: FormGroup;
  filterForm6: FormGroup;

  monthList = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  yearList = ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];
  constructor(
    private formBuilder: FormBuilder,
    private _alert: ToastrService,
    private cdr: ChangeDetectorRef,
    private _service: SubscriptionReportService
  ) {}
  ngOnInit(): void {
    this.sectionNo = 1;
    this.setReportFilterSection(this.sectionNo);
  }
  setReportFilterSection(sectionNo) {
    this.sectionNo = sectionNo;
    const today = new Date();
    const currentDate: NgbDateStruct = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
    if (this.sectionNo === 1) {
      this.filterForm1 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
        membershipNo: null,
        year: null,
        quarter: null,
      });
    } else if (this.sectionNo === 2) {
      this.filterForm2 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
        membershipNo: null,
        year: null,
      });
    } else if (this.sectionNo === 3) {
      this.filterForm3 = this.formBuilder.group({
        membershipNo: null,
        year: null,
        quarter: null,
      });
    } else if (this.sectionNo === 4) {
      this.filterForm4 = this.formBuilder.group({
        membershipNo: null,
        year: null,
        quarter: null,
      });
    } else if (this.sectionNo === 5) {
      this.filterForm5 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
      });
    } else if (this.sectionNo === 6) {
      this.filterForm6 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
      });
    }
  }

  url: any;
  viewPdfReport() {
    this.spin = true;
    var reportType = 'PDF';
    this.pdfSrc = null;
    if (this.sectionNo === 1) {
      if (this.filterForm1.value.fromDate) {
        var fromDate = new Date(
          new DateConverter().dateModal(
            this.filterForm1.value.fromDate
          )
        ).toISOString()
       
      }
      if (this.filterForm1.value.toDate) {
        var toDate = new Date(
          new DateConverter().dateModal(
            this.filterForm1.value.toDate
          )
        ).toISOString()
      }
      this._service
        .exportSubscriptionPaymentDetailReport(
          fromDate,
          toDate,
          this.filterForm1.value.membershipNo,
          this.filterForm1.value.year,
          this.filterForm1.value.quarter
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            this.spin = false;
            this.cdr.detectChanges();
          },
          (err) => {
            this.spin = false;
          }
        );
    } else if (this.sectionNo === 2) {
      if (this.filterForm2.value.fromDate) {
        var fromDate = new Date(
          new DateConverter().dateModal(
            this.filterForm2.value.fromDate
          )
        ).toISOString()
       
      }
      if (this.filterForm2.value.toDate) {
        var toDate = new Date(
          new DateConverter().dateModal(
            this.filterForm2.value.toDate
          )
        ).toISOString()
      }

      this._service
        .exportSubscriptionPaymentSummaryReport(
          fromDate,
          toDate,
          this.filterForm2.value.membershipNo,
          this.filterForm2.value.year
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            this.spin = false;
            this.cdr.detectChanges();
          },
          (err) => {
            this.spin = false;
          }
        );
    } else if (this.sectionNo === 3) {
      this._service
        .exportSubscriptionDueDetailReport(
          this.filterForm3.value.membershipNo,
          this.filterForm3.value.year,
          this.filterForm3.value.quarter
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            this.spin = false;
            this.cdr.detectChanges();
          },
          (err) => {
            this.spin = false;
          }
        );
    } else if (this.sectionNo === 4) {
      this._service
        .exportSubscriptionDueSummaryReport(
          this.filterForm4.value.membershipNo,
          this.filterForm4.value.year,
          this.filterForm4.value.quarter
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            this.spin = false;
            this.cdr.detectChanges();
          },
          (err) => {
            this.spin = false;
          }
        );
    } else if (this.sectionNo === 5) {
      if (this.filterForm5.value.fromDate) {
        var fromDate = new Date(
          new DateConverter().dateModal(
            this.filterForm5.value.fromDate
          )
        ).toISOString()
       
      }
      if (this.filterForm5.value.toDate) {
        var toDate = new Date(
          new DateConverter().dateModal(
            this.filterForm5.value.toDate
          )
        ).toISOString()
      }
      this._service
        .exportUserWiseSubscriptionCollectionReport(
          fromDate,
          toDate
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            this.spin = false;
            this.cdr.detectChanges();
          },
          (err) => {
            this.spin = false;
          }
        );
    } else if (this.sectionNo === 6) {
      if (this.filterForm6.value.fromDate) {
        var fromDate = new Date(
          new DateConverter().dateModal(
            this.filterForm6.value.fromDate
          )
        ).toISOString()
       
      }
      if (this.filterForm6.value.toDate) {
        var toDate = new Date(
          new DateConverter().dateModal(
            this.filterForm6.value.toDate
          )
        ).toISOString()
      }
      this._service
        .exportUserWiseSubscriptionCollectionDetailsReport(
          fromDate,
          toDate
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            this.spin = false;
            this.cdr.detectChanges();
          },
          (err) => {
            this.spin = false;
          }
        );
    }
  }

  resetForm() {
    if (this.sectionNo === 1) {
      this.filterForm1.reset();
    } else if (this.sectionNo === 2) {
      this.filterForm2.reset();
    }
  }
}
