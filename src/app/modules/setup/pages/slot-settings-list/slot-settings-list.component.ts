import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SlotSettingsService } from '../../services/slot-settings.service';
import { SweetAlertOptions } from 'sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-slot-settings-list',
  templateUrl: './slot-settings-list.component.html',
  styleUrls: ['./slot-settings-list.component.css']
})
export class SlotSettingsListComponent implements OnInit {

  serviceSlotList: any[] = [];
  swalOptions: SweetAlertOptions = {};
  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  isShowFilter: any = false;
  numberOfEntries: number;
  currentPage: number = 1;
  pageSize: number = 10;
  searchForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  filterForm: any;
  isFilter=false
  serviceSlotSettingsId: number;
  slot: any;
  isForDeleteId: any;
  serviceMap: Map<number, string> = new Map<number, string>();
  allSlotsRaw: any[] = [];

  constructor(
    private service: SlotSettingsService,
    private alertType: AlertTypeService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.createSearchForm();
    this.loadServices();
    this.getallServiceSlotSettings();
  }

  createSearchForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: '',
    });

    this.searchForm.get('searchKey')?.valueChanges.subscribe((val) => {
      this.searchKey = val;
      this.currentPage = 1;
      this.applyFilter();
    });
  }

  loadServices() {
    this.service.getAllServiceOnly(1, 10000).subscribe(
      (res) => {
        if (res?.Data) {
          res.Data.forEach((s: any) => {
            this.serviceMap.set(s.Id, s.Title || s.Name || s.ServiceText);
          });
          this.cdr.detectChanges();
        }
      },
      (err) => console.log('Error loading services map:', err)
    );
  }

  getServiceName(data: any): string {
    if (data?.ServiceText && data.ServiceText.trim() !== '') {
      return data.ServiceText;
    }
    if (data?.ServiceId && this.serviceMap.has(data.ServiceId)) {
      return this.serviceMap.get(data.ServiceId)!;
    }
    return data?.ServiceName || data?.Title || (data?.ServiceId ? `Service #${data.ServiceId}` : '—');
  }

  goToCreatePage() {
    this.router.navigate(['setups/slot-settings/create']);
  }

  goToEditPage(Id) {
    this.router.navigate(['setups/slot-settings/edit/' + Id]);
  }

  filterData() {
    this.searchKey = this.searchForm.get('searchKey')?.value || '';
    this.pageSize = Number(this.searchForm.get('pageSize')?.value) || 10;
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter() {
    let list = this.allSlotsRaw || [];
    if (this.searchKey && this.searchKey.trim() !== '') {
      const key = this.searchKey.trim().toLowerCase();
      list = list.filter((item: any) => {
        const sName = this.getServiceName(item).toLowerCase();
        return sName.includes(key);
      });
    }
    this.numberOfEntries = list.length;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.serviceSlotList = list.slice(startIndex, startIndex + this.pageSize);
    this.hasData = this.serviceSlotList.length > 0;
    this.cdr.detectChanges();
  }

  getallServiceSlotSettings() {
    this.hasData = false;
    this.spin = true;

    this.service.getallServiceSlotSettings().subscribe(
      (res) => {
        this.allSlotsRaw = res?.Data || [];
        this.applyFilter();
        this.spin = false;
      },
      (err) => {
        console.log(err);
        this.spin = false;
        this.hasData = false;
      }
    );
  }

  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.applyFilter();
  }



  



  deleteButtonClick(id) {
    this.isForDeleteId = id;
    this.deleteSwal.fire().then((clicked) => {
      if (clicked.isConfirmed) {
        this.triggerDelete();
      }
    });
  }

  triggerDelete() {
    this.service.deleteServiceSlotSettings(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getallServiceSlotSettings();
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Slot Settings');
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }



}
