import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';
import { VenuebokkingReportService } from '../../services/venuebokking-report.service';
import { ServiceSaleReportService } from '../../services/service-sale-report.service';

@Component({
  selector: 'app-service-sale-report',
  standalone: false,
  templateUrl: './service-sale-report.component.html',
  styleUrl: './service-sale-report.component.scss',
})
export class ServiceSaleReportComponent implements OnInit {
  pdfSrc: any;
  filterForm: FormGroup;
  eventList: any;
  spin;
  constructor(
    private _service: ServiceSaleReportService,
    private formBuilder: FormBuilder,
    private _alert: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.createFilterForm();
    this.getServices();
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
      serviceId: '',
      ServiceTicketCount: 0,
      membershipNo: '',
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
    this._service
      .getServiceSaleReport(
        fromDate,
        toDate,
        this.filterForm.value.serviceId,
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
  }

  getServices() {
    this._service.getMemServicesList(1,1000).subscribe((resp) => {
      this.eventList = resp.Data as any;
      debugger
      this.eventList = this.eventList.filter((c) => c.ServiceTypeId == 7);
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
