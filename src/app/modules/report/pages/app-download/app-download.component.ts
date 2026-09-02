import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppDownloadService } from '../../services/app-download.service';
import { ToastrService } from 'ngx-toastr';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';

@Component({
  selector: 'app-app-download',
  standalone: false,
  templateUrl: './app-download.component.html',
  styleUrl: './app-download.component.scss',
})
export class AppDownloadComponent implements OnInit {
  filterForm: FormGroup;
  IsActive: boolean;
  pdfSrc: any;
  spin: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _service: AppDownloadService,
    private _alert: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.createFilterForm();
  }
  createFilterForm() {
    this.filterForm = this._fb.group({});
  }
  setStatusCriteria(value) {
    this.IsActive = value;
  }
  url: any;
  viewPdfReport() {
    this.pdfSrc = null;
    var reportType = 'PDF';
    this.spin = true;
    this._service.getAppDownloadReport(this.IsActive).subscribe(
      (blobData: Blob) => {
        let documentBlob = new Blob([blobData], {
          type: reportType == 'PDF' ? 'application/pdf' : '',
        });
        this.url = URL.createObjectURL(documentBlob);
        this.spin = false;

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
  resetForm() {
    this.filterForm.reset();
  }
}
