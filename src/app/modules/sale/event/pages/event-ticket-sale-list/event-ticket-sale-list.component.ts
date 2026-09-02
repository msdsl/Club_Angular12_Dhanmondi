import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { Router } from '@angular/router';
import { MemberService } from 'src/app/modules/member/services/member.service';
import { AlertService } from 'src/app/@shared/AlertService';
import { ActivityTypeService } from 'src/app/modules/activity/services/activity-type.service';
import { EventTicketSaleService } from '../../services/event-ticket-sale.service';
import { VenueService } from '../../../venue/services/venue.service';

@Component({
  selector: 'app-event-ticket-sale-list',
  templateUrl: './event-ticket-sale-list.component.html',
  styleUrls: ['./event-ticket-sale-list.component.css']
})
export class EventTicketSaleListComponent implements OnInit {

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  eventTicketSales: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = true;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  eventTicketSaleForm: FormGroup;
  makePaymentForm: FormGroup;
  isForDeleteId: number;
  isShowFilter: any = false;
  filterForm: any;
  eventTicketSaleTypes: any;
  eventTicketSaleActiveStatus: any;
  bloodGroups: any;
  eventTicketSaleProfessions: any;
  memberInfo: any;
  pdfSrc: Uint8Array;
  url: string;
  serviceTicketTypeList: any;
  BookingStatusList = ['Cancel']
  currentEventSale: any;

  constructor(
    private service: EventTicketSaleService,
    private servicee: VenueService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService,
    private alertService: AlertService,
    private router: Router,
    private memberService: MemberService,
    private activityTypeService: ActivityTypeService
  ) { }

  ngOnInit() {
    
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.createMakePaymentForm();
    this.createFilterForm();
    this.getEventTicketSaleList();
    this.createSearchForm();

    this.createeventTicketSaleForm();
    this.getAllServiceTicketType()
    // this.alertService.warning("Due should be lesser than current balance")


  }

  getAllServiceTicketType() {
    
    this.activityTypeService.getAllServiceTicketType().subscribe(
      (data) => {
        this.serviceTicketTypeList = data.Data;
        this.serviceTicketTypeList = this.serviceTicketTypeList.filter((x) => x.ServiceType == 'Event');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  createMakePaymentForm() {
    this.makePaymentForm = this.fb.group({
      MemberShipNo: ['', Validators.required],
      CurrentBalance: null,
      DueAmount: null,
      EventTicketSaleId: null,
      PaymentDate: null,
      PaymentAmount: null,
      TotalAmount:null
    });
  }



  openMakePaymentModal(data, makePaymentModal) {

    this.makePaymentForm.get("MemberShipNo").patchValue(data.MemberShipNo)
    this.makePaymentForm.get("TotalAmount").patchValue(data.TotalAmount)
    this.makePaymentForm.get("DueAmount").patchValue(data.TotalAmount - data.PaymentAmount)
    this.makePaymentForm.get("EventTicketSaleId").patchValue(data.Id)
    this.makePaymentForm.get("PaymentDate").patchValue( new Date().toISOString())

    if(this.makePaymentForm.value.DueAmount<1){
      this.alertService.warning("No due amount to pay")
      return;
    }

    this.getMemberInformations(data, makePaymentModal)

  }





  getMemberInformations(data, makePaymentModal) {
    this.memberService.getMemberInformations(data.MemberShipNo).subscribe(
      (data) => {
        this.memberInfo = data.Data;
        
        this.makePaymentForm.get("CurrentBalance").patchValue(data.CurrentBalance)
        this.cdr.detectChanges();
        this.modalService.open(makePaymentModal, { size: 'lg', centered: true });
      },
      (err) => {
        console.log(err);
      }
    );
  }





  createeventTicketSaleForm() {
    this.eventTicketSaleForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
    });
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createSearchForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
    });
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

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getEventTicketSaleList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }
  goToCreatePage() {
    this.router.navigate(['sale/event-ticket/create']);
  }
  viewEventTicketDetail(x: any) {
    
    
    this.router.navigate(['sale/event-ticket/detail'], { state: x });
  }

  getEventTicketSaleList() {
    this.spin = true;
    this.service
      .getAllEventTicket(
        this.currentPage,
        this.pageSize,
        this.searchKey,
        this.filterForm.value
      )
      .subscribe(
        (data) => {
          this.eventTicketSales = data.DataList;
          console.log(this.eventTicketSales[0].SaleEventTicketDetailReqs);
          
          this.hasData = this.eventTicketSales?.length > 0;
          this.numberOfEntries = data.DataCount;
          
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
    this.getEventTicketSaleList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.eventTicketSaleForm.patchValue({
        Id: data.Id,
        Title: data.Title,
      });
    } else {
      // this.editId = null;
      this.eventTicketSaleForm.get('Id').patchValue(0);
      this.eventTicketSaleForm.get('Title').patchValue(null);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg', centered: true });
  }

  reloadData() {
    this.currentPage = 1;
    this.getEventTicketSaleList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getEventTicketSaleList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.eventTicketSaleForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service.saveEventTicket(this.eventTicketSaleForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getEventTicketSaleList();

          this.eventTicketSaleForm.value.Id
            ? this.showAlert(this.alertType.updateSuccessAlert)
            : this.showAlert(this.alertType.createSuccessAlert);
        }
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
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
    this.service.removeEventTicket(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getEventTicketSaleList();
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
    this.getEventTicketSaleList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Due Payment');
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
  goToEdit(id) {
    this.router.navigate(['eventTicketSale/edit/' + id]);
  }

  viewPdfReport(pdfViewerModal: any, id: any) {
    var reportType = 'PDF';
    this.service.getEventTicketReport(id).subscribe((blobData: Blob) => { 
      let documentBlob = new Blob([blobData], {
        type: reportType == 'PDF' ? 'application/pdf' : '',
      });

      this.url = URL.createObjectURL(documentBlob);
      console.log(this.url);

      this.modalService.open(pdfViewerModal, { size: 'lg', centered: true });
      this.cdr.detectChanges();
    });
  }

  // viewPdfReport(pdfViewerModal: any, id: any) {
  //   var reportType = 'PDF';
  //   this.servicee.GetVenueBookingInvoice(732).subscribe((blobData: Blob) => {
  //     let documentBlob = new Blob([blobData], {
  //       type: reportType == 'PDF' ? 'application/pdf' : '',
  //     });

  //     this.url = URL.createObjectURL(documentBlob);
  //     console.log(this.url);

  //     this.modalService.open(pdfViewerModal, { size: 'lg', centered: true });
  //     this.cdr.detectChanges();
  //   });
  // }

  cancelEvent(data){
    this.currentEventSale = data;
    this.deleteSwal.fire().then((clicked) => {
    });
  }

  triggerCancel(){

    this.service.cancelEventTicket(this.currentEventSale).subscribe(
      (data)=>{
        console.log(data);
        this.getEventTicketSaleList()
        this.showCustomAlert(this.alertType.userCreatedSuccessAlert,"Successfully canceled the event sale")
      },
      (err)=>{
        console.log(err);
      }
    )

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
