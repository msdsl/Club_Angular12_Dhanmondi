import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';
import { EventTicketReportService } from '../../services/event-ticket-report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-event-ticket-report',
  standalone: false,
  templateUrl: './event-ticket-report.component.html',
  styleUrl: './event-ticket-report.component.scss',
})
export class EventTicketReportComponent implements OnInit {
  detail: boolean = false;
  pdfSrc: any;
  filterForm: FormGroup;
  filterFormDetail: FormGroup;
  eventList: any;
  spin: boolean = false;
  constructor(
    private _service: EventTicketReportService,
    private formBuilder: FormBuilder,
    private _alert: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.createFilterForm();
    this.createDetailFilterForm();
    this.getAllEventTickets();
    this.detail = true;
  }
  setReportFilterSection(x) {
    if (x === 1) {
      this.detail = true;
    }
    if (x === 2) {
      this.detail = false;
    }
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
      eventId: '',
      ServiceTicketCount: null,
    });
  }
  createDetailFilterForm() {
    const today = new Date();
    const currentDate: NgbDateStruct = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
    this.filterFormDetail = this.formBuilder.group({
      fromDate: currentDate,
      toDate: currentDate,
      eventId: '',
      membershipNo: '',
      ServiceTicketCount: null,
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
    if (!this.detail) {
      this._service
        .getEventTicketReport(
          fromDate,
          toDate,
          this.filterForm.value.eventId
        )
        .subscribe(
          (blobData: Blob) => {
            
            let documentBlob = new Blob([blobData], {
              type: reportType == 'PDF' ? 'application/pdf' : '',
            });
            this.url = URL.createObjectURL(documentBlob);
            console.log(this.url);
            
            
            // if (reportType == 'PDF') {
            //   var fileURL = window.URL.createObjectURL(documentBlob);
            //   const iframe = document.createElement('iframe');
            //   iframe.style.display = 'none';
            //   iframe.src = fileURL;
            //    document.body.appendChild(iframe);
            // }
            this.cdr.detectChanges();
          },
          (err) => {
            this.spin = false;
          }
        );
    } else {
      this._service
        .getEventTicketSaleReport(
          this.filterFormDetail.value.eventId,
          this.filterFormDetail.value.membershipNo
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
          },
          (err) => {
            this.spin = false;
          }
        );
    }
  }

  getAllEventTickets() {
    this._service.getMemServicesList().subscribe((resp) => {
      this.eventList = resp.Data as any;
      this.eventList = this.eventList.filter((c) => c.ServiceTypeId == 6);
      this.eventList.unshift({
        Id: null,
        Title: 'All',
        ServiceTicketCount: 1,
      });
    });
  }
  resetForm() {
    this.filterForm.reset();
  }
  setEventTicketCount(event) {
    console.log(event.ServiceTicketCount);
    this.filterForm
      .get('ServiceTicketCount')
      .patchValue(event.ServiceTicketCount);
  }
}
