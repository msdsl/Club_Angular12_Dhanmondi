import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { environment } from 'src/environments/environment';
import { SweetAlertOptions } from 'sweetalert2';
import { VenueService } from '../../../venue/services/venue.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { Router } from '@angular/router';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { ActivityTicketService } from 'src/app/modules/activity/services/activity-ticket.service';
import { EventTicketSaleService } from '../../services/event-ticket-sale.service';
import { AlertService } from 'src/app/@shared/AlertService';
import { TopupService } from 'src/app/modules/topup/services/topup.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-ticket-sale-create',
  templateUrl: './event-ticket-sale-create.component.html',
  styleUrls: ['./event-ticket-sale-create.component.css']
})
export class EventTicketSaleCreateComponent implements OnInit {

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  saleEventTicketForm: FormGroup;
  baseUrl = environment.imgUrl;
  member: any;
  startDate = new Date();
  endDate = new Date();
  eventList: any;
  event: any;
  selectedCriteria: any;
  areaInfo: any;
  SaleEventTicketDetails: any = [];
  paymentInfoForm: any;
  paymentMethodList: any;
  bankInfoList: any;
  creditCardList: any;
  eventTicketBuyInfo: any;
  selected: any;
  areaSelected: any;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private service: EventTicketSaleService,
    private alertType: AlertTypeService,
    public router: Router,
    private subscriptionService: SubscriptionService,
    private activityTicketService: ActivityTicketService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private topupService: TopupService,
    private alert: AlertService,
  ) { }

  ngOnInit() {
    this.startDate.setDate(this.startDate.getDate() - 30);
    this.createSaleRventTicketForm();
    this.createPaymentInfoForm()
    this.loadAllPaymentMethod()
    this.getAllBank();
    this.getAllCreditCard();
  }

  checkMemberTicketLimit(memId: number, eventId: number) {
    this.service.getMemberEventTicketCount(memId, eventId).subscribe((res) => {
      if (!res.HasError) {
        this.eventTicketBuyInfo = res;
        console.log(this.eventTicketBuyInfo);
        
        // this.leftToSale();
      }
      (error: any) => {
        error.Messages.forEach((element: string) => {
          this.alertService.error(element);
        });
      };
    });
  }

  loadAllPaymentMethod() {

    this.topupService.getAllPaymentMethod().subscribe((res) => {
      this.paymentMethodList = res.DataList;
      this.cdr.detectChanges()
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

  
  createSaleRventTicketForm() {
    this.saleEventTicketForm = this.fb.group({
      Id: 0,
      InvoiceNo: "",
      InvoiceDate: this.formatDate(new Date()),
      PaymentDate: this.formatDate(new Date()),
      SaleStatus: "Confirm",
      MemberId: null,
      MemberShipNo: "",
      TicketLimit: 250,
      Amount: 0,
      PaymentAmount: 0,
      VatAmount: 0,
      ServiceAmount: 0,
      TotalAmount: 0,
      OrderFrom: "WEBAPP",
      CurrentBalance: 0,
      TicketCriteriaId: 0,
      Quantity:null,
      SaleEventTicketDetailReqs: [],
      TopUpReq:[]
    });
  }

  showSelectedVenue(item, i) {
    this.selected = i
    this.SaleEventTicketDetails = []

    
    this.saleEventTicketForm.get("TicketCriteriaId").patchValue(0);
    
    this.event = this.eventList.find((x) => x.Id == item.Id);

    this.checkMemberTicketLimit(this.member.Id,this.event.Id)
    
  }
  selectCriteria(event) {

    this.areaInfo=null
    this.selectedCriteria = event;
    this.calculate();


  }
  calculate() {
    

    const totalTicketPrice = this.SaleEventTicketDetails.reduce((sum, ticket) => {
      return sum + ticket.TicketPrice;
    }, 0);

    const VatAmount = this.SaleEventTicketDetails.reduce((sum, ticket) => {
      return sum + ticket.VatAmount;
    }, 0);
    const ServiceAmount = this.SaleEventTicketDetails.reduce((sum, ticket) => {
      return sum + ticket.ServiceChargeAmount;
    }, 0);

    this.saleEventTicketForm.get("Amount").patchValue(totalTicketPrice.toFixed(2))
    this.saleEventTicketForm.get("VatAmount").patchValue(VatAmount.toFixed(2));
    this.saleEventTicketForm.get("ServiceAmount").patchValue(ServiceAmount.toFixed(2));
    this.saleEventTicketForm.get("TotalAmount").patchValue((totalTicketPrice+VatAmount+ServiceAmount).toFixed(2));

  }

  addTicket(){
    
    
    for (let index = 1; index <= this.saleEventTicketForm.value.Quantity; index++) {
      debugger
      var SaleEventTicketDetail = {
        EventId: this.event.Id,
        EventTitle: this.event.Title,
        NoofChair: 1,
        Quantity: 0,
        EventTokens: this.event.EventTokenReqs.map((i: any) => `${i.TokenTitle}`).join(','),
        Id: 0,
        SaleEventId: 0,
        ServiceChargeAmount: (this.selectedCriteria.Price * this.event.ServicePercent) / 100,
  
        TicketCriteria: this.selectedCriteria.Title,
        TicketCriteriaId: this.selectedCriteria.Id,
        TicketPrice: this.selectedCriteria.Price,
        TicketText: "1",
        VatAmount: (this.selectedCriteria.Price * this.event.VatPercent) / 100, 
      }
      this.SaleEventTicketDetails.push(SaleEventTicketDetail)
      
    }
    this.calculate()


   
  }

  selectedTableChairr(event,areaInfo, table, ChairKeyNo, ChairNo) {

    if(event.target.checked){
      var SaleEventTicketDetail = {
        AreaLayoutId: areaInfo.AreaLayoutId,
        AreaLayoutTitle: areaInfo.Title,
        Chairkey: ChairKeyNo,
        EventId: this.event.Id,
        EventTitle: this.event.Title,
        NoofChair: ChairNo,
        Quantity: 0,
        EventTokens: "",
        Id: 0,
        SaleEventId: 0,
        ServiceChargeAmount: (this.selectedCriteria.Price * this.event.ServicePercent) / 100,
        TableId: table.Id,
        TableTitle: table.TableName,
        TicketCriteria: this.selectedCriteria.Title,
        TicketCriteriaId: this.selectedCriteria.Id,
        TicketPrice: this.selectedCriteria.Price,
        TicketText: "",
        VatAmount: (this.selectedCriteria.Price * this.event.VatPercent) / 100,
      }
  
      this.SaleEventTicketDetails.push(SaleEventTicketDetail)
    
    }

    else{
      
      var index = this.SaleEventTicketDetails.findIndex(c=>c.AreaLayoutId==areaInfo.AreaLayoutId && c.TableId==table.Id && c.NoofChair==ChairNo)
      if(index!=-1){
        this.SaleEventTicketDetails.splice(index,1)
      }
    }
    this.calculate()
    
    
  }

  deleteSelectedLayout(data){
    

    var index = this.SaleEventTicketDetails.indexOf(data)
    if(index!=-1){
      this.SaleEventTicketDetails.splice(index,1)
      this.calculate()
    }
    
    this.areaInfo.TableListVm.map(c=>{
      if(c.Id==data.TableId){
        c.ChairList.map(d=>{
          if(d.ChairNo==data.NoofChair){
            d.chairIsChecked = false
          }
        })
      }
    })
  }




  showMemberInfo() {

    if (this.saleEventTicketForm.value.MemberShipNo) {
      const memberShipNo = this.saleEventTicketForm.value.MemberShipNo.padStart(5, '0');
      this.subscriptionService.getMemberInfoByMemberShipNo(memberShipNo).subscribe((res) => {

          
         this.member = res.Data;
         if(!res.Data){

          this.alert.warning(res.Messages[0])
        }
          console.log(this.member);
          this.saleEventTicketForm.get("MemberId").patchValue(this.member.Id)
          this.saleEventTicketForm.get("CurrentBalance").patchValue(this.member.CurrentBalance)
          this.member.ImgFileUrl = environment.imgUrl + '' + this.member.ImgFileUrl;
          this.getEventBydate()
          this.cdr.detectChanges()
          if(!this.member.Id){
            this.alertService.warning("Member not found!")
          }
     
        (error: any) => {
          this.alertService.warning("Member not found!")
          console.log(error);

        };
      });
    }
  }

  getEventBydate() {

    this.activityTicketService
      .getEventBydate(this.startDate.toJSON().split('T')[0] as any, this.endDate.toJSON().split('T')[0] as any)
      .subscribe(
        (data) => {
          this.eventList = data.DataList;
        },
        (error: any) => {
          console.log(error);

        }
      );
  }

  showSelectedArea(item: any,i) {
    this.areaSelected = i;
    

    this.areaInfo = this.event.layoutTableDetails.find((x) => x.AreaLayoutId == item.AreaLayoutId) as any;
  }


  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  createPaymentInfoForm() {
    this.paymentInfoForm = this.fb.group({
      BankId: 0,
      CreditCardId: 0,
      CreditCardText: "",
      BankText: "",
      Id: 0,
      PaymentMethodId: "",
      PaymentMethodText: "",
      Amount: 0,
      TrxNo: "",
      MachineNo: "",
      TrxCardNo: "0"

    });
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }
 

  onSubmit(payment) {
    // this.openPaymentModal(payment);

    if (this.SaleEventTicketDetails.length > this.event.TicketLimit) {
      return this.alertService.warning('You have exceeded the ticket limit');
    }

    if ((this.member.CurrentBalance+(this.member.CreditLimit?this.member.CreditLimit:0)) < this.saleEventTicketForm.value.TotalAmount && this.saleEventTicketForm.value.TotalAmount !== 0) {
      return this.alertService.warning("You don't have sufficient balance and credit limit");
    } else {
      // return this.openPaymentModal(payment);
      this.saveEventTicketHandelar();
    }
  }
  openPaymentModal(content: any) {
    this.modalService.open(content);
  }

  openVerticallyCentered(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  onSubmitPaymentInfoForm() {
    var TopUpReq = {
      RegisterMemberId: this.member.Id,
      MemberShipNo: this.member.MemberShipNo,
      OnlineTopUp: false,
      OfflineTopUp: true,
      TopUpDate: this.formatDate(new Date()),
      Status: "None",
      TopUpDetails: [this.paymentInfoForm.value]
    }
    this.saleEventTicketForm.get("TopUpReq").patchValue(TopUpReq);


    this.saveEventTicketHandelar()

  }

  saveEventTicketHandelar() {
    this.saleEventTicketForm.get("SaleEventTicketDetailReqs").patchValue(this.SaleEventTicketDetails)
    this.service.saveEventTicket(this.saleEventTicketForm.value).subscribe(
      (data) => {
        console.log(data);
        this.showAlert(this.alertType.createSuccessAlert);
        this.router.navigate(['sale/event-ticket/list']);
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);

      }
    )
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

}
