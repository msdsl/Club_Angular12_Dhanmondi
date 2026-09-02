import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VenuebokkingReportService } from '../../services/venuebokking-report.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';

@Component({
  selector: 'app-venue-booking-report',
  standalone: false,
  templateUrl: './venue-booking-report.component.html',
  styleUrl: './venue-booking-report.component.scss',
})
export class VenueBookingReportComponent implements OnInit {
  pdfSrc: any;
  filterForm: FormGroup;
  eventList: any;
  spin: boolean = false;
  constructor(
    private _service: VenuebokkingReportService,
    private formBuilder: FormBuilder,
    private _alert: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.createFilterForm();
    this.getAllVenues();
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
  url: any;
  viewPdfReport() {
    if (this.filterForm.value.ServiceTicketCount == 0) {
      this._alert.error('There is no ticket for this event');
      this.pdfSrc = null;
      return;
    }
    var reportType = 'PDF';
    this.pdfSrc = null;
    var criteria = {
      fromDate: '',
      toDate: '',
      eventId: '',
    };
    if (this.filterForm.value.fromDate) {
      criteria.fromDate = new DateConverter().dateModal(
        this.filterForm.value.fromDate
      );
    }
    if (this.filterForm.value.toDate) {
      criteria.toDate = new DateConverter().dateModal(
        this.filterForm.value.toDate
      );
    }
    criteria.eventId = this.filterForm.value.eventId;

    this._service
      .getVenueBookingReport(
        criteria.fromDate,
        criteria.toDate,
        criteria.eventId
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
          this.spin = false;
          this.cdr.detectChanges();
        },
        (err) => {
          this.spin = false;
        }
      );
  }

  getAllVenues() {
    this._service.getMemServicesList().subscribe((resp) => {
      this.eventList = resp.Data as any;
      this.eventList = this.eventList.filter((c) => c.ServiceTypeId == 1);
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
