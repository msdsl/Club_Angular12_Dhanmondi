import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';
import { SubscriptionReportService } from '../../services/subscription-report.service';
import { RefundReportService } from '../../services/refund-report.service';

@Component({
  selector: 'app-refund-report',
  standalone: false,
  templateUrl: './refund-report.component.html',
  styleUrl: './refund-report.component.scss',
})
export class RefundReportComponent implements OnInit {
  sectionNo: number;
  pdfSrc: any;
  spin: boolean = false;
  filterForm1: FormGroup;
  filterForm2: FormGroup;
  filterForm3: FormGroup;
  filterForm4: FormGroup;
  filterForm5: FormGroup;
  filterForm6: FormGroup;
  eventList: any;
  serviceList: any;
  venueList: any;
  allMemservices: any;

  quarterList = ['Q1', 'Q2', 'Q3', 'Q4'];
  yearList = ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];
  constructor(
    private formBuilder: FormBuilder,
    private _alert: ToastrService,
    private cdr: ChangeDetectorRef,
    private _service: RefundReportService
  ) {}
  ngOnInit(): void {
    this.getAllMemservices();
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
      });
    } else if (this.sectionNo === 2) {
      this.eventList = this.allMemservices.filter((c) => c.ServiceTypeId == 6);
      console.log(this.eventList);
      this.eventList.unshift({
        Id: null,
        Title: 'All',
        ServiceTicketCount: 1,
      });

      this.filterForm2 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
        eventId: null,
        membershipNo: null,
        ServiceTicketCount: null,
      });
    } else if (this.sectionNo === 3) {
      this.filterForm3 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
        membershipNo: null,
      });
    } else if (this.sectionNo === 4) {
      this.serviceList = this.allMemservices?.filter(
        (c) => c.ServiceTypeId == 7
      );
      this.serviceList.unshift({
        Id: null,
        Title: 'All',
        ServiceTicketCount: 1,
      });
      this.filterForm4 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
        serviceId: null,
        membershipNo: null,
        ServiceTicketCount: null,
      });
    } else if (this.sectionNo === 5) {
      this.filterForm5 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
        membershipNo: null,
      });
    } else if (this.sectionNo === 6) {
      this.venueList = this.allMemservices?.filter((c) => c.ServiceTypeId == 1);
      this.venueList.unshift({
        Id: null,
        Title: 'All',
        ServiceTicketCount: 1,
      });
      this.filterForm6 = this.formBuilder.group({
        fromDate: currentDate,
        toDate: currentDate,
        venueId: null,
        membershipNo: null,
        ServiceTicketCount: null,
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
        .getEventRefundSummaryReport(
          fromDate,
          toDate,
          null,
          this.filterForm1.value.membershipNo
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
        .getServiceRefundDetailReport(
          fromDate,
          toDate,
          this.filterForm1.value.eventId,
          this.filterForm1.value.membershipNo
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
      if (this.filterForm3.value.fromDate) {
        var fromDate = new Date(
          new DateConverter().dateModal(
            this.filterForm3.value.fromDate
          )
        ).toISOString()
       
      }
      if (this.filterForm3.value.toDate) {
        var toDate = new Date(
          new DateConverter().dateModal(
            this.filterForm3.value.toDate
          )
        ).toISOString()
      }
      this._service
        .getServiceRefundSummaryReport(
          fromDate,
          toDate,
          null,
          this.filterForm3.value.membershipNo
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
      if (this.filterForm4.value.fromDate) {
        var fromDate = new Date(
          new DateConverter().dateModal(
            this.filterForm4.value.fromDate
          )
        ).toISOString()
       
      }
      if (this.filterForm4.value.toDate) {
        var toDate = new Date(
          new DateConverter().dateModal(
            this.filterForm4.value.toDate
          )
        ).toISOString()
      }
      this._service
        .getServiceRefundDetailReport(
          fromDate,
          toDate,
          this.filterForm4.value.serviceId,
          this.filterForm4.value.membershipNo
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
        .getVenueBookingRefundSummaryReport(
          fromDate,
          toDate,
          null,
          this.filterForm5.value.membershipNo
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
        .getVenueBookingRefundDetailReport(
          fromDate,
          toDate,
          this.filterForm6.value.venueId,
          this.filterForm6.value.membershipNo
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
  setEventTicketCount(event) {
    if (this.sectionNo === 2) {
      this.filterForm2
        .get('ServiceTicketCount')
        .patchValue(event.ServiceTicketCount);
    } else if (this.sectionNo === 4) {
      this.filterForm4
        .get('ServiceTicketCount')
        .patchValue(event.ServiceTicketCount);
    } else if (this.sectionNo === 6) {
      this.filterForm6
        .get('ServiceTicketCount')
        .patchValue(event.ServiceTicketCount);
    }
  }
  getAllMemservices() {
    this._service.getMemServicesList().subscribe((resp) => {
      this.allMemservices = resp.Data as any;
    });
  }
  resetForm() {
    if (this.sectionNo === 1) {
      this.filterForm1.reset();
    } else if (this.sectionNo === 2) {
      this.filterForm2.reset();
    }
  }
}
