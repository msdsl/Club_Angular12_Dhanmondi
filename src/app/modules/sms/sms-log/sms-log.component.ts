import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SmsService } from '../sms.service';

@Component({
  selector: 'app-sms-log',
  standalone: false,
  templateUrl: './sms-log.component.html',
  styleUrl: './sms-log.component.scss',
})
export class SmsLogComponent implements OnInit {
  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  searchKey: any;
  spin = false;
  dataList: any;
  hasData: boolean;
  filterForm: FormGroup;
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  constructor(
    private _service: SmsService,
    private _fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.getList();
    this.createFilterForm();
  }
  getList() {
    this.spin = true;
    this._service
      .getAllSendSMSLogList(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          this.dataList = data.Data;
          this.hasData = this.dataList?.length > 0;
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
    this.getList();
  }
  filterData() {
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = this.searchForm.value.pageSize;
    this.getList();
  }
  createFilterForm() {
    this.searchForm = this._fb.group({
      pageSize: 10,
      searchKey: null,
    });
  }
}
