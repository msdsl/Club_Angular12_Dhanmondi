import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopupReportService } from '../../services/topup-report.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';

@Component({
  selector: 'app-topup-report',
  standalone: false,
  templateUrl: './topup-report.component.html',
  styleUrl: './topup-report.component.scss',
})
export class TopupReportComponent implements OnInit {
  topupdetail: boolean = true;
  pdfSrc: any;
  filterForm: FormGroup;
  eventList: any;
  users: any[] = [];
  spin;
  constructor(
    private _service: TopupReportService,
    private formBuilder: FormBuilder,
    private _alert: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.createFilterForm();
    this.topupdetail = true;
    this.getAllUser();
  }
  setReportFilterSection(x) {
    if (x === 1) {
      this.topupdetail = true;
    }
    if (x === 2) {
      this.topupdetail = false;
    }
  }
  getAllUser() {
    this.spin = true;
    this._service.getAllUsers(1, 1000, 'WEBAPP', '').subscribe(
      (data) => {
        this.users = data.Data;
        this.cdr.detectChanges();
        this.spin = false;
      },
      (err) => {
        console.log(err);
        this.spin = false;
      }
    );
  }
  createFilterForm() {
    const today = new Date();
    const currentDate: NgbDateStruct = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
    this.filterForm = this.formBuilder.group({
      fromDate: currentDate,
      toDate: currentDate,
      membershipNo: '',
      userName: '',
    });
  }
  url: any;
  viewPdfReport() {
    if (this.filterForm.value.ServiceTicketCount == 0) {
      this._alert.error('There is no ticket for this event');
      this.pdfSrc = null;
      return;
    }
    var reportType = 'PDF';
    this.pdfSrc = null;
    if (this.filterForm.value.fromDate) {
      var fromDate = new Date(
        new DateConverter().dateModal(
          this.filterForm.value.fromDate
        )
      ).toISOString()
     
    }
    if (this.filterForm.value.toDate) {
      var toDate = new Date(
        new DateConverter().dateModal(
          this.filterForm.value.toDate
        )
      ).toISOString()
      
    }
    this.spin = true;
    if (this.topupdetail) {
      this._service
        .getTopUpDetailReport(
          fromDate,
          toDate,
          this.filterForm.value.membershipNo
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            // if (reportType == 'PDF') {
            //   var fileURL = window.URL.createObjectURL(documentBlob);
            //   const iframe = document.createElement('iframe');
            //   iframe.style.display = 'none';
            //   iframe.src = fileURL;
            //    document.body.appendChild(iframe);
            // }
            this.cdr.detectChanges();
            this.spin = false;
          },
          (err) => {
            this.spin = false;
          }
        );
    } else {
      this._service
        .getTopUpSummaryReport(
          fromDate,
          toDate,
          this.filterForm.value.membershipNo,
          this.filterForm.value.userName
        )
        .subscribe(
          (blobData: Blob) => {
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            // if (reportType == 'PDF') {
            //   var fileURL = window.URL.createObjectURL(documentBlob);
            //   const iframe = document.createElement('iframe');
            //   iframe.style.display = 'none';
            //   iframe.src = fileURL;
            //    document.body.appendChild(iframe);
            // }
            this.cdr.detectChanges();
            this.spin = false;
          },
          (err) => {
            this.spin = false;
          }
        );
    }
  }

  resetForm() {
    this.filterForm.reset();
  }
}
