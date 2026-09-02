import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';

import { Router } from '@angular/router';
import { ActivityTicketService } from '../../services/activity-ticket.service';
import { ActivityTypeService } from '../../services/activity-type.service';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-activity-ticket-list',
  templateUrl: './activity-ticket-list.component.html',
  styleUrls: ['./activity-ticket-list.component.css']
})
export class ActivityTicketListComponent implements OnInit {

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  isShowFilter: any = false;
  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  activityTicketCategorys: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = true;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;

  isForDeleteId: number;
  ActivityTicketList: any;
  filterForm: any;

  serviceList:any = []
  serviceTypeList:any = []
  activitys: any;



  constructor(
    private service: ActivityTicketService,
    private activityTypeService: ActivityTypeService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService,
    private router: Router,
    private activityService: ActivityService,
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
   
    this.createSearchForm();
    this.createFilterForm();
    this.getActivityTicket();
    this.getActivityTypeList()
    this.getActivityList()
    

  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      StartDate: null,
      EndDate: null,
      ServiceId: 0,
      ServiceTypeId: 0,
      SearchText: null,
      
    });
  }
  resetFilterForm() {
    this.filterForm.reset();
  }
  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createSearchForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
      searchYear: '',
    });
  }



  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getActivityTicket();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getActivityTicket() {
    // this.searchForm.value.searchYear

    this.service.getActivityTicketPagination(this.currentPage, this.pageSize, this.searchKey,this.filterForm.value).subscribe(
      (data) => {
        
        this.ActivityTicketList = data.DataList;
        this.hasData = this.ActivityTicketList?.length > 0;
        this.numberOfEntries = data.DataCount;
        // this.cdr.detectChanges()
      },
      (err) => {
        console.log(err);
        this.hasData = false;
      }
    );
  }

  getActivityTypeList() {
    this.activityTypeService
      .getActivityTypePagination(1, 1000, )
      .subscribe(
        (data) => {
          this.serviceTypeList = data.DataList;
        },
        (err) => {
          this.hasData = false;
        }
      );
  }

  getActivityList() {
    this.activityService
      .getActivityPagination(1, 1000)
      .subscribe(
        (data) => {
          this.serviceList = data.Data;
        },
        (err) => {
        }
      );
  }

  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getActivityTicket();
  }



  goToCreatePage(){
    this.router.navigate(['activity/ticket/create']);
  }

  goToEditPage(data){
    
    console.log(data);
    
    this.router.navigate(['activity/ticket/edit/' + data.MemServiceTypeId + "/" + data.Id]);
  }

  reloadData() {
    this.currentPage = 1;
    this.getActivityTicket();
  }
  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getActivityTicket();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }


  deleteButtonClick(id) {
    this.isForDeleteId = id;
    this.deleteSwal.fire().then((clicked) => {
      if (clicked.isConfirmed) {
        this.showAlert(this.alertType.deleteSuccessAlert);
      }
    });
  }
  triggerDelete() {
    this.service.deleteActivityTicket(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getActivityTicket();
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  filterData() {
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = this.searchForm.value.pageSize;
    this.getActivityTicket();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('ActivityTicketCategory');
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
  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }

}
