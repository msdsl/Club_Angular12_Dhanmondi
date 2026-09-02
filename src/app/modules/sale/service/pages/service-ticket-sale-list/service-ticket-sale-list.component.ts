import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceTicketSaleService } from '../../services/service-ticket-sale.service';
import { Router } from '@angular/router';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';

@Component({
  selector: 'app-service-ticket-sale-list',
  templateUrl: './service-ticket-sale-list.component.html',
  styleUrls: ['./service-ticket-sale-list.component.css']
})
export class ServiceTicketSaleListComponent implements OnInit {

  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  
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
  isOpenAction: number | null = null;
  currentServiceSale: any;
 
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private service: ServiceTicketSaleService,
    private router: Router,
    private alertType: AlertTypeService,
  ) { }

  ngOnInit() {

    this.createSearchForm()
    this.createFilterForm()

    this.getServiceTicketSaleList()
  }
  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
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
    this.router.navigate(['sale/service-ticket/create']);
  }

  updatePageWiseTableData(service) {
    this.currentPage = service;
    this.getServiceTicketSaleList();
  }

  getServiceTicketSaleList() {
    
    this.service
      .getAllServiceTicket(
        this.currentPage,
        this.pageSize,
        this.searchKey,
        this.filterForm.value
      )
      .subscribe(
        (data) => {
          this.serviceTicketSales = data.DataList;

          
          this.hasData = this.serviceTicketSales?.length > 0;
          this.numberOfEntries = data.DataCount;
          
          this.cdr.detectChanges();
        },
        (err) => {
          this.hasData = false;
        }
      );
  }

  viewPdfReport(pdfViewerModal: any, id: any) {
    var reportType = 'PDF';
    this.service.getServiceInvoiceReport(id).subscribe((blobData: Blob) => {
      let documentBlob = new Blob([blobData], {
        type: reportType == 'PDF' ? 'application/pdf' : '',
      });

      this.url = URL.createObjectURL(documentBlob);
      console.log(this.url);

      this.modalService.open(pdfViewerModal, { size: 'lg', centered: true });
      this.cdr.detectChanges();
    });
  }

  // viewPdfInvoiceReport(pdfViewerModal: any, id: any) {
  //   this.service.getServiceInvoiceReport(id).subscribe((data) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       (this.pdfSrc = new Uint8Array(reader.result as ArrayBuffer)), toString();
  //       this.modalService.open(pdfViewerModal, { centered: true, size: 'lg' });
  //     };
  //     reader.readAsArrayBuffer(data);
  //   });
  // }

  viewPdfInvoiceReport(pdfViewerModal: any, id: any) {
    var reportType = 'PDF';
    this.service.getServiceInvoiceReport(id).subscribe((blobData: Blob) => {
      let documentBlob = new Blob([blobData], {
        type: reportType == 'PDF' ? 'application/pdf' : '',
      });

      this.url = URL.createObjectURL(documentBlob);
      console.log(this.url);

      this.modalService.open(pdfViewerModal, { size: 'lg', centered: true });
      this.cdr.detectChanges();
    });
  }
  cancelService(data){
    this.currentServiceSale = data;
    this.deleteSwal.fire().then((clicked) => {
    });
  }

  triggerCancel(){

    this.service.cancelServiceSale(this.currentServiceSale).subscribe(
      (data)=>{
        console.log(data);
        this.getServiceTicketSaleList()
        this.showCustomAlert(this.alertType.userCreatedSuccessAlert,"Successfully canceled the serivce sale")
      },
      (err)=>{
        console.log(err);
      }
    )

  }
  closeDropdown(): void {
    this.isOpenAction = null;
  }

  showCustomAlert(swalOptions: SweetAlertOptions, message) {
    this.alertType.setAlertTypeText(message);
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
