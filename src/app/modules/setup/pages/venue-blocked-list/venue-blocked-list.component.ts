import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { VenueBlockedService } from '../../services/venue-blocked.service';

@Component({
  selector: 'app-venue-blocked-list',
  templateUrl: './venue-blocked-list.component.html',
  styleUrls: ['./venue-blocked-list.component.css']
})
export class VenueBlockedListComponent implements OnInit {

  currentPage: any=1;
  filterForm: any;
  serviceTicketSales: any;
  hasData: boolean;
  numberOfEntries: any;
  searchKey: any;
  pageSize: any=10;
  url: any;
  isShowFilter: any = false;
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = true;
  searchForm: any;
  blockedVenueList: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private service: VenueBlockedService,
    private router: Router,
  ) { }

  ngOnInit() {

    this.createSearchForm()
    this.createFilterForm()

    this.getServiceTicketSaleList()
  }
  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }
  createSearchForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
    });
  }

  filterData() {
    
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = this.searchForm.value.pageSize;
    this.getServiceTicketSaleList();
  }
  createFilterForm() {
    this.filterForm = this.fb.group({
      StartDate: null,
      EndDate: null,
      TicketCriteriaId: null,
      BookingStatus: null,

    });
  }
  resetFilterForm() {
    this.filterForm.reset();
  }
  goToCreatePage() {
    this.router.navigate(['setups/venue-blocked/create']);
  }

  updatePageWiseTableData(service) {
    this.currentPage = service;
    this.getServiceTicketSaleList();
  }

  getServiceTicketSaleList() {
    
    this.service
      .getAllVenueBlocked(
        this.currentPage,
        this.pageSize,
        this.searchKey,
        this.filterForm.value
      )
      .subscribe(
        (data) => {
          this.blockedVenueList = data.DataList;

          
          this.hasData = this.blockedVenueList?.length > 0;
          this.numberOfEntries = data.DataCount;
          
          this.cdr.detectChanges();
        },
        (err) => {
          this.hasData = false;
        }
      );
  }





}
