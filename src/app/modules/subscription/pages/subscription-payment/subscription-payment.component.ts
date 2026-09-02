import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubscriptionPaymentService } from '../../services/subscription-payment.service';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { MemberService } from 'src/app/modules/member/services/member.service';
import { TopupService } from 'src/app/modules/topup/services/topup.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-subscription-payment',
  templateUrl: './subscription-payment.component.html',
  styleUrls: ['./subscription-payment.component.css'],
})
export class SubscriptionPaymentComponent implements OnInit {

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  memberSubscriptionPaymentInfoSearchForm: FormGroup;
  member: any;
  paymentDetail: boolean;
  totalSubscriptionFee: number;
  titleText: string;
  dataList: any[];
  memberSubPaidList: any;
  paymentTypeText: string;
  actionText: string;
  memberSubFeeDueList: any = [];
  memberSubAdvancedList: any = [];
  paymentInformation: any;
  subscriptionPayment: {};
  pdfSrc: Uint8Array;
  advancedPaymentDetailList: any = [];
  paymentInfoForm: any;
  paymentMethodList: any;
  creditCardList: any;
  bankInfoList: any;
  url: any;
  previousIndex: any = -1;
  duePaymentDetailList: any = [];
  tab:any=1;
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private service: SubscriptionService,
    private _modalService: NgbModal,
    private subscriptionPaymentService: SubscriptionPaymentService,
    private memberService: MemberService,
    private topupService: TopupService,
    private alertType: AlertTypeService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.creatememberSubscriptionPaymentInfoSearchForm();
    this.createPaymentInfoForm();
    this.getAllBank();
    this.getAllCreditCard();
    this.loadAllPaymentMethod();
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
  PatchPaymentMethodText(event) {
    if (event.Title == 'CHEQUE') {
      this.paymentInfoForm.get('CreditCardId').patchValue(0);
    }
    if (event.Title == 'CARD') {
      this.paymentInfoForm.get('BankId').patchValue(0);
    }

    this.paymentInfoForm.get('PaymentMethodText').patchValue(event.Title);
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
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

  creatememberSubscriptionPaymentInfoSearchForm() {
    this.memberSubscriptionPaymentInfoSearchForm = this.fb.group({
      MemberShipNo: null,
    });
  }

  showMemberInfo() {
    if (this.memberSubscriptionPaymentInfoSearchForm.value.MemberShipNo) {
      const memberShipNo =
        this.memberSubscriptionPaymentInfoSearchForm.value.MemberShipNo.padStart(
          5,
          '0'
        );
      this.service
        .getMemberInfoByMemberShipNo(memberShipNo)
        .subscribe((res) => {
          if (!res.HasError) {
            this.member = res;
            this.member.ImgFileUrl =
              environment.imgUrl + '' + this.member.ImgFileUrl;
            this.cdr.detectChanges();
            // console.log(res);
            if (!this.member.HasSubscription) {
              this.paymentDetail = false;
              // console.log(this.member.HasSubscription);
            } else {
              this.paymentDetail = true;
              this.loadAllPaidUpto();
              this.loadAllDueList();
            }
          }
          (error: any) => {
            this.alertService.warning("Member not found!")
            error.Messages.forEach((element: string) => {
              // this._alertService.error(element);
            });
          };
        });
    }
  }

  loadAllPaidUpto() {
    this.totalSubscriptionFee = 0;
    this.titleText = 'Subscription Paid List';
    this.dataList = [];
    if (this.member.Id) {
      this.service
        .getSubscriptionPaymentPaidUpTo(this.member.Id)
        .subscribe((res) => {
          if (res.HasError) {
            res.Messages.forEach((element: string) => {
              // this._alertService.error(element);
            });
          } else {
            this.memberSubPaidList = res.DataList;
            this.cdr.detectChanges();
          }
        });
    }
  }

  loadAllDueList() {
    this.totalSubscriptionFee = 0;
    this.titleText = 'Subscription Due List';
    this.paymentTypeText = 'due';
    this.dataList = [];
    if (this.member.Id) {
      this.service
        .getSubscriptionPaymentDueList(this.member.Id)
        .subscribe((res) => {
          if (res.HasError) {
            res.Messages.forEach((element) => {
              // this._alertService.error(element);
            });
          } else {
            this.actionText = 'Due Payment';
            this.memberSubFeeDueList = res.DataList;

            if (this.memberSubFeeDueList?.length < 1) {
              this.loadAllAdvanced();
            }
            this.cdr.detectChanges();
          }
        });
    }
  }

  loadAllAdvanced() {
    this.totalSubscriptionFee = 0;
    this.titleText = 'Subscription Advanced List';
    this.paymentTypeText = '';
    this.dataList = [];
    if (this.member.Id) {
      this.service
        .getSubscriptionPaymentAdvancedList(this.member.Id)
        .subscribe((res) => {
          if (res.HasError) {
            res.Messages.forEach((element) => {
              // this._alertService.error(element);
            });
          } else {
            this.actionText = 'Advanced Payment';
            this.memberSubAdvancedList = res.DataList;
            this.cdr.detectChanges();
          }
        });
    }
  }

  onCheckAllAdvance(event) {
    if (event.target.checked) {
      this.advancedPaymentDetailList = [];
      this.memberSubAdvancedList.forEach(element => {
        element.IsChecked = true;
        this.advancedPaymentDetailList.push(element)
      });
    }
    else {
      this.advancedPaymentDetailList = [];
    }

  }
  onCheckAllDue(event) {
    if (event.target.checked) {
      this.duePaymentDetailList = [];
      this.memberSubFeeDueList.forEach(element => {
        element.IsChecked = true;
        this.duePaymentDetailList.push(element)
      });
    }
    else {
      this.duePaymentDetailList = [];
    }

  }

  isChekedAdvance(data) {
    if (this.advancedPaymentDetailList.filter(c => c.Id == data.Id)?.length > 0) {
      return true;
    }
    else {
      return false
    }
  }
  isChekedDue(data) {
    if (this.duePaymentDetailList.filter(c => c.Id == data.Id)?.length > 0) {
      return true;
    }
    else {
      return false
    }
  }
  onCheckAdvancePayment(event, i) {
    if (event.target.checked) {
      this.advancedPaymentDetailList = []
      this.advancedPaymentDetailList = this.memberSubAdvancedList.slice(0, i + 1).map(item => {
        return { ...item, IsChecked: true };
      });
    } else {
      this.advancedPaymentDetailList.splice(i, this.advancedPaymentDetailList.length - i)
    }
  }
  onCheckDuePayment(event, i) {
    if (event.target.checked) {
      this.duePaymentDetailList = []
      this.duePaymentDetailList = this.memberSubFeeDueList.slice(0, i + 1).map(item => {
        return { ...item, IsChecked: true };
      });
    } else {
      this.duePaymentDetailList.splice(i, this.duePaymentDetailList.length - i)
    }
  }


  openPaymentModal(payment) {
    this._modalService.open(payment);
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(){
    if(this.tab==1){
      this.onSubmitDuePayment()
    }
    else{
      this.onSubmitAdvancedPayment()
    }
  }
  onSubmitDuePayment() {
    var TopUpReq = {
      RegisterMemberId: this.member.Id,
      MemberShipNo: this.member.MemberShipNo,
      OnlineTopUp: false,
      OfflineTopUp: true,
      TopUpDate: this.formatDate(new Date()),
      Status: "None",
      TopUpDetails: [this.paymentInfoForm.value]
    }


    ;
    var model = {
      MemberId: this.member.Id,
      Model: this.duePaymentDetailList,
      topup: TopUpReq,
    };
    this.subscriptionPaymentService.savedueSubPayment(model).subscribe(
      (data) => {
        console.log(data);
        this.showAlert(this.alertType.createSuccessAlert);
        this.showMemberInfo()
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }
  onSubmitAdvancedPayment() {
    var TopUpReq = {
      RegisterMemberId: this.member.Id,
      MemberShipNo: this.member.MemberShipNo,
      OnlineTopUp: false,
      OfflineTopUp: true,
      TopUpDate: this.formatDate(new Date()),
      Status: "None",
      TopUpDetails: [this.paymentInfoForm.value]
    }


    ;
    var model = {
      MemberId: this.member.Id,
      Model: this.advancedPaymentDetailList,
      topup: TopUpReq,
    };
    this.subscriptionPaymentService.SaveAdvancedPayment(model).subscribe(
      (data) => {
        console.log(data);
        this.showAlert(this.alertType.createSuccessAlert);
        this.showMemberInfo()
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  resetAll() {
    this.memberSubFeeDueList = [];
    this.memberSubAdvancedList = [];
    this.member = {};
    // this.subscriptionPayment = {}
    this.paymentInformation = {};

    this.memberSubPaidList = [];
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Subscription Payment');
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
