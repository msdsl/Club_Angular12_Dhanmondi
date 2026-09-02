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
import { AvailabilityService } from '../../services/availability.service';

@Component({
  selector: 'app-availability-list',
  templateUrl: './availability-list.component.html',
  styleUrls: ['./availability-list.component.css']
})
export class AvailabilityListComponent implements OnInit {

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
  availabilityCategorys: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;

  isForDeleteId: number;
  AvailabilityList: any;



  constructor(
    private service: AvailabilityService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
   
    this.createSearchForm();
    this.getAvailability();
    

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
    this.getAvailability();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getAvailability() {
    // this.searchForm.value.searchYear

    this.service.getAvailabilityPagination(this.currentPage, this.pageSize, this.searchKey).subscribe(
      (data) => {
        
        this.AvailabilityList = data.Data;
        this.hasData = this.AvailabilityList?.length > 0;
        this.numberOfEntries = data.Count;
        // this.cdr.detectChanges()
      },
      (err) => {
        console.log(err);
        this.hasData = false;
      }
    );
  }

  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getAvailability();
  }

  careateOrEditModalPopUp() {
    this.router.navigate(['availability/executive/create']);
  }

  goToCreatePage(){
    this.router.navigate(['setups/availability/create']);
  }

  goToEditPage(Id){
    this.router.navigate(['setups/availability/edit/' + Id]);;
  }

  reloadData() {
    this.currentPage = 1;
    this.getAvailability();
  }
  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getAvailability();
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
    this.service.deleteAvailability(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getAvailability();
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
    this.getAvailability();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('AvailabilityCategory');
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
