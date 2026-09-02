import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/@shared/AlertService';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { environment } from 'src/environments/environment';
import { ServiceTicketSaleService } from '../../services/service-ticket-sale.service';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TopupService } from 'src/app/modules/topup/services/topup.service';

@Component({
  selector: 'app-service-ticket-sale-create',
  templateUrl: './service-ticket-sale-create.component.html',
  styleUrls: ['./service-ticket-sale-create.component.css'],
})
export class ServiceTicketSaleCreateComponent implements OnInit {
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  saleServiceTicketForm: FormGroup;
  member: any;
  serviceList: any;
  serviceTicketList: any;
  selectServiceTicket: any;
  serviceTicketDetailReqsList: any;
  ServiceSaleDetailReqs: any = [];
  ServiceSaleDetail: any;
  totalPrice: any;
  totalVatAmount: any;
  serviceChargeAmount: any;
  grandTotalAmount: any;
  paymentInfoForm: FormGroup;
  bankInfoList: any;
  creditCardList: any;
  paymentMethodList: any;
  url: string;
  selectedDateList: string[] = [];
  selectDate: any;
  selectedDate: any;
  currentAvailableSlots: any;
  selectServiceCriteria: any;
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private alertType: AlertTypeService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private alertService: AlertService,
    private service: ServiceTicketSaleService,
    private modalService: NgbModal,
    private topupService: TopupService,
    private alert: AlertService,
  ) {}

  ngOnInit() {
    this.getAllMemService();
    this.createPaymentInfoForm();
    this.createSaleRventTicketForm();
    this.loadAllPaymentMethod();
    this.getAllBank();
    this.getAllCreditCard();
  }

  createPaymentInfoForm() {
    this.paymentInfoForm = this.fb.group({
      BankId: 0,
      CreditCardId: 0,
      CreditCardText: '',
      BankText: '',
      Id: 0,
      PaymentMethodId: '',
      PaymentMethodText: '',
      Amount: 0,
      TrxNo: '',
      MachineNo: '',
      TrxCardNo: '0',
    });
  }

  createSaleRventTicketForm() {
    this.saleServiceTicketForm = this.fb.group({
      Id: 0,
      MemServiceId: 0,
      MemberId: 0,
      InvoiceNo: '',
      MembershipNo: '',
      OrderFrom: 'WEBAPP',
      InvoiceDate: this.formatDate(new Date()),
      PaymentDate: this.formatDate(new Date()),
      IsActive: true,
      TotalAmount: 0,
      Amount: 0,
      VatAmount: 0,
      ServiceChargeAmount: 0,
      ServiceCriteria: '',
      ServicePrice: 0,
      ServiceQty: 0,
      ServiceCriteriaId: 0,
      MemberName: '',
      ImgFileUrl: '',
      FullName: '',
      RefundAmount: 0,
      CurrentBalance: 0,
      Note: '',
      ServiceSaleDetailReqs: [],
      TopUpReq: [],
    });
  }

  getAllMemService() {
    this.service.GetAllServiceOnly(1, 10000).subscribe(
      (data) => {
        this.serviceList = data.Data;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  GetAllTicketByServiceIdQuery(Service) {
    console.log(Service);

    this.service.GetAllTicketByServiceIdQuery(Service.Id).subscribe(
      (data) => {
        console.log(data);
        this.serviceTicketList = data.DataList;
        this.selectServiceTicket = this.serviceTicketList[0];
        if (this.selectServiceTicket.Id > 0) {
          
          this.serviceTicketDetailReqsList =
            this.selectServiceTicket.ServiceTicketDetailReqs;
            debugger
        } else {
          this.serviceTicketDetailReqsList = [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  modelList: Array<NgbDateStruct> = [];
  isSelected = (date: NgbDateStruct) => {
    return this.modelList.some((d) => this.compareDates(d, date));
  };
  private compareDates(date1: NgbDateStruct, date2: NgbDateStruct): boolean {
    return (
      date1.year === date2.year &&
      date1.month === date2.month &&
      date1.day === date2.day
    );
  }
  formatDateArray() {
    this.selectedDateList = this.modelList.map((dateObj: any) => {
      const year = dateObj.year;
      const month = dateObj.month;
      const day = dateObj.day;
      return `${year}-${month}-${day}`;
    });

    return this.selectedDateList;
  }

  selectOne(date: NgbDateStruct, slotSelectionModal) {
    this.selectedDate = date.day + '/' + date.month + '/' + date.year;
    this.selectDate = date;

    this.ServiceSaleDetail.VatChargePercent =
      this.selectServiceTicket.VatChargePercent;
    this.ServiceSaleDetail.ServiceChargePercent =
      this.selectServiceTicket.ServiceChargePercent;
    this.ServiceSaleDetail.SaleYear = this.selectDate.year;
    this.ServiceSaleDetail.SaleMonth = this.selectDate.month;
    this.ServiceSaleDetail.SaleDay = this.selectDate.day;
    this.ServiceSaleDetail.ServiceCriteriaId =
      this.saleServiceTicketForm.value.ServiceCriteriaId;
    if (this.selectServiceTicket.HasAvailability) {
      this.getAvailableSlot(date, this.selectServiceTicket.Id);
      this.modalService.open(slotSelectionModal);
    } else {
      this.selectedDateList.push(date as any);

      this.ServiceSaleDetail.DayText = '';
      this.ServiceSaleDetail.StartTime = '';
      this.ServiceSaleDetail.EndTime = '';
      this.ServiceSaleDetail.IsWholeDay = true;
      this.ServiceSaleDetail.TicketText = this.selectServiceTicket.Title;
      this.ServiceSaleDetail.UnitName = this.selectServiceCriteria.TicketType;
      this.ServiceSaleDetail.UnitPrice = this.selectServiceCriteria.UnitPrice;
      this.ServiceSaleDetail.VatChargeAmount =
        this.selectServiceTicket.VatChargeAmount;
      this.ServiceSaleDetail.VatChargePercent =
        this.selectServiceTicket.VatChargePercent;
      this.ServiceSaleDetail.ServiceChargePercent =
        this.selectServiceTicket.ServiceChargePercent;
      this.ServiceSaleDetail.ServiceChargeAmount =
        this.selectServiceTicket.ServiceChargeAmount;
      this.ServiceSaleDetail.ServiceTicketId = this.selectServiceTicket.Id;
      this.ServiceSaleDetail.MemServiceId =
        this.saleServiceTicketForm.value.MemServiceId;
      this.ServiceSaleDetail.Quantity = 1;
      debugger
      this.ServiceSaleDetailReqs.push(this.ServiceSaleDetail);
      this.ServiceSaleDetail = {};
    }
    console.log(this.ServiceSaleDetailReqs);
    this.calculate();
  }
  getAvailableSlot(date, ticketId) {
    const dateOfSlot = new Date(date.year, date.month - 1, date.day);
    dateOfSlot.setHours(dateOfSlot.getHours() + 12);

    const isoString = dateOfSlot.toISOString();
    this.service.getAvailableServiceSlot(isoString, ticketId).subscribe(
      (data) => {
        this.currentAvailableSlots = data.Data;
        console.log(this.currentAvailableSlots);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  checkQuantityValidation(slot) {
    if (slot.SlotQty < slot.Qty) {
      slot.Qty = 0;
      this.alertService.warning('Enter quantity less than or equal to SlotQty');
      return true;
    } else {
      return false;
    }
  }

  selectSlots(slot: any, event): void {
    if (slot.Qty <= 0) {
      return;
    }
    if (this.checkQuantityValidation(slot)) {
      return;
    }

    if (event.target.checked) {
      var has = this.ServiceSaleDetailReqs.find(
        (x) =>
          x.MemServiceId === this.saleServiceTicketForm.value.MemServiceId &&
          x.ServiceTicketId === this.selectServiceTicket.Id &&
          x.SeviceTicketAvailablityId === slot.Id &&
          x.ServiceCriteriaId ===
            this.saleServiceTicketForm.value.ServiceCriteriaId &&
          x.SaleYear === this.selectDate.year &&
          x.SaleMonth === this.selectDate.month &&
          x.SaleDay === this.selectDate.day
      );
      if (has) {
        return this.alertService.warning('This service ticket is aready addes');
      }

      this.ServiceSaleDetail.SaleYear = this.selectDate.year;
      this.ServiceSaleDetail.SaleMonth = this.selectDate.month;
      this.ServiceSaleDetail.SaleDay = this.selectDate.day;
      this.ServiceSaleDetail.SeviceTicketAvailablityId = slot.Id;
      this.ServiceSaleDetail.DayText = slot.DayText;
      this.ServiceSaleDetail.StartTime = slot.StartTime;
      this.ServiceSaleDetail.EndTime = slot.EndTime;
      this.ServiceSaleDetail.IsWholeDay = slot.IsWholeDay;
      this.ServiceSaleDetail.TicketText = this.selectServiceTicket.Title;
      this.ServiceSaleDetail.VatChargePercent =
        this.selectServiceTicket.VatChargePercent;
      this.ServiceSaleDetail.ServiceChargePercent =
        this.selectServiceTicket.ServiceChargePercent;

      this.ServiceSaleDetail.ServiceTicketId = this.selectServiceTicket.Id;
      this.ServiceSaleDetail.MemServiceId =
        this.saleServiceTicketForm.value.MemServiceId;
      this.ServiceSaleDetail.Quantity = slot.Qty;
      this.ServiceSaleDetail.SlotQty = slot.SlotQty;
      this.ServiceSaleDetail.UnitName = this.selectServiceCriteria.TicketType;
      this.ServiceSaleDetail.UnitPrice = this.selectServiceCriteria.UnitPrice;

      this.ServiceSaleDetailReqs.push(this.ServiceSaleDetail);
      this.ServiceSaleDetail = [];
    }
    console.log(this.ServiceSaleDetailReqs);
    this.calculate();
  }

  onSelectTicketType(event) {
    if (event) {
      this.selectServiceCriteria = event;
      this.ServiceSaleDetail = {
        Id: 0,
        ServiceCriteriaId: event.Id,
        ServiceTicketId: event.ServiceTicketId,
        UnitName: event.TicketType,
        UnitPrice: event.UnitPrice,
        ServiceChargePercent: this.selectServiceTicket.ServiceChargePercent,
        ServiceChargeAmount: this.selectServiceTicket.ServiceChargeAmount,
        VatChargePercent: this.selectServiceTicket.VatChargePercent,
        VatChargeAmount: this.selectServiceTicket.VatChargeAmount,
        TicketText: this.selectServiceTicket.MemServiceText,
        MemServiceId: this.saleServiceTicketForm.value.MemServiceId,
      };
    } else {
      this.ServiceSaleDetail = {};
    }
  }
  loadAllPaymentMethod() {
    this.topupService.getAllPaymentMethod().subscribe(
      (res) => {
        this.paymentMethodList = res.DataList;
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAllBank() {
    this.topupService.getAllBank().subscribe(
      (data) => {
        this.bankInfoList = data.DataList;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAllCreditCard() {
    this.topupService.getAllCreditCard().subscribe(
      (data) => {
        this.creditCardList = data.DataList;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showMemberInfo() {
    if (this.saleServiceTicketForm.value.MembershipNo) {
      const memberShipNo =
        this.saleServiceTicketForm.value.MembershipNo.padStart(5, '0');
      this.subscriptionService
        .getMemberInfoByMemberShipNo(memberShipNo)
        .subscribe((res) => {
         
          this.member = res.Data;
          if(!res.Data){

            this.alert.warning(res.Messages[0])
          }
            console.log(this.member);
            this.saleServiceTicketForm
              .get('MemberId')
              .patchValue(this.member.Id);
            this.saleServiceTicketForm
              .get('CurrentBalance')
              .patchValue(this.member.CurrentBalance);
            this.member.ImgFileUrl =
              environment.imgUrl + '' + this.member.ImgFileUrl;
            this.cdr.detectChanges();
            if (!this.member.Id) {
              this.alertService.warning('Member not found!');
            }
          
          (error: any) => {
            this.alertService.warning('Member not found!');
            console.log(error);
          };
        });
    }
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  removeDetail(index) {
    this.ServiceSaleDetailReqs.splice(index, 1);
  }

  calculate() {
    this.totalPrice = this.ServiceSaleDetailReqs.reduce(
      (x, y) => x + y.Quantity * y.UnitPrice,
      0
    );

    this.ServiceSaleDetailReqs.forEach((item) => {
      item.VatChargeAmount =
        (item.Quantity * item.UnitPrice * item.VatChargePercent) / 100;
      item.ServiceChargeAmount =
        (item.Quantity * item.UnitPrice * item.ServiceChargePercent) / 100;
    });
    this.totalVatAmount = this.ServiceSaleDetailReqs.reduce(
      (x, y) => x + y.VatChargeAmount,
      0
    );
    this.serviceChargeAmount = this.ServiceSaleDetailReqs.reduce(
      (x, y) => x + y.ServiceChargeAmount,
      0
    );
    this.grandTotalAmount = this.totalPrice+this.totalVatAmount+this.serviceChargeAmount
  }

  onSubmit(pdfViewerModal) {
    this.saleServiceTicketForm.get("TotalAmount").patchValue(this.grandTotalAmount);
    if (
      (this.member.CurrentBalance+(this.member.CreditLimit?this.member.CreditLimit:0)) <
      this.saleServiceTicketForm.get('TotalAmount').value
    ) {
      return this.alertService.warning("You don't have sufficient balance and credit limit");
    } 
    if(!this.saleServiceTicketForm.value.ServiceCriteriaId){
      return this.alertService.warning("Please select ticket type");
    }
    if(this.ServiceSaleDetailReqs.length<1){
      return this.alertService.warning("Please select atleast one date");
    }
    else {
      this.saveServiceTicketHandelar(pdfViewerModal);
    }
  }

  onSubmitPaymentInfoForm(pdfViewerModal) {
    var TopUpReq = {
      RegisterMemberId: this.member.Id,
      MemberShipNo: this.member.MemberShipNo,
      OnlineTopUp: false,
      OfflineTopUp: true,
      TopUpDate: this.formatDate(new Date()),
      Status: 'None',
      Note:this.paymentInfoForm.value.Note,
      TopUpDetails: [this.paymentInfoForm.value],
    };
    this.saleServiceTicketForm.get('TopUpReq').patchValue(TopUpReq);

    this.saveServiceTicketHandelar(pdfViewerModal);
  }

  saveServiceTicketHandelar(pdfViewerModal) {
    this.saleServiceTicketForm
      .get('ServiceSaleDetailReqs')
      .patchValue(this.ServiceSaleDetailReqs);
    this.service.createServiceSell(this.saleServiceTicketForm.value).subscribe(
      (data) => {
        if (!data.HasError) {
          this.alertService.success('Service ticket sale created successfully');
          this.router.navigate(['sale/service-ticket/list']);
        } else {
          this.showAlert(this.alertType.errorAlert);
        }
      },
      (err) => {
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }
  viewPdfInvoiceReport(pdfViewerModal, id) {
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

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Event Ticket');
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
  goToListPage() {
    this.router.navigate(['sale/service-ticket/list']);
  }
}
