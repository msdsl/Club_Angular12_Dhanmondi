import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MemberService } from 'src/app/modules/setup/services/member.service';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { environment } from 'src/environments/environment';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { BcmanageChargeService } from '../../services/bcmanage-charge.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-bcsubscription-payment',
  standalone: false,
  templateUrl: './bcsubscription-payment.component.html',
  styleUrl: './bcsubscription-payment.component.scss',
})
export class BcsubscriptionPaymentComponent implements OnInit {
  subscriptionPaymentForm: FormGroup;
  member: any;
  paymentDetail: boolean;
  totalSubscriptionFee: number;
  titleText: string;
  dataList: any[];
  memberSubPaidList: any;
  paymentTypeText: string;
  actionText: string;
  memberSubFeeDueList: any;
  memberSubAdvancedList: any;
  paymentInformation: any;
  subscriptionPayment: {};
  pdfSrc: Uint8Array;
  duePaymentDetailList: any = [];
  paymentInfoForm: any;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};
  advancedPaymentDetailList: any = [];
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _service: BcmanageChargeService,
    private memberService: MemberService,
    private alertType: AlertTypeService,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.createPaymentInfoForm();
    this.creatememberSubscriptionPaymentInfoSearchForm();
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
  PatchPaymentMethodText(event) {
    if (event.Title == 'CHEQUE') {
      this.paymentInfoForm.get('CreditCardId').patchValue(0);
    }
    if (event.Title == 'CARD') {
      this.paymentInfoForm.get('BankId').patchValue(0);
    }

    this.paymentInfoForm.get('PaymentMethodText').patchValue(event.Title);
  }

  creatememberSubscriptionPaymentInfoSearchForm() {
    this.subscriptionPaymentForm = this.fb.group({
      MemberShipNo: null,
    });
  }

  showMemberInfo() {
    if (this.subscriptionPaymentForm.value.MemberShipNo) {
      const memberShipNo =
        this.subscriptionPaymentForm.value.MemberShipNo.padStart(5, '0');
      this._service
        .getMemberInfoByMemberShipNo(memberShipNo)
        .subscribe((res) => {
          this.member = res.Data;
          if (!res.Data) {
            this.alert.warning(res.Messages[0]);
          }
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

          (error: any) => {
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
      this._service
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
      this._service
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
      this._service
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

  // saveOrTopup(paymentModal: any, pdfViewerModal) {
  //   Swal.fire({
  //     // title: ' ',
  //     text: 'Are you sure you want to Subscription Payment?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#4255b5',
  //     cancelButtonColor: '#333',
  //     width: '20rem',
  //     confirmButtonText: 'Confirm',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       if (this.paymentTypeText === 'due') {
  //         var checkedList = this.memberSubFeeDueList
  //           .filter((x) => x.IsChecked)
  //           .sort(
  //             (a, b) =>
  //               new Date(a.PaymentDate).getTime() -
  //               new Date(b.PaymentDate).getTime()
  //           );
  //         var uncheckedList = this.memberSubFeeDueList
  //           .filter((x) => !x.IsChecked)
  //           .sort(
  //             (a, b) =>
  //               new Date(a.PaymentDate).getTime() -
  //               new Date(b.PaymentDate).getTime()
  //           );

  //         for (let i = 0; i < checkedList.length; i++) {
  //           if (checkedList[i]?.PaymentDate > uncheckedList[0]?.PaymentDate) {
  //             // this._alertService.error('Please select previous dues first!');
  //             return;
  //           }
  //         }
  //       } else {
  //         if (this.memberSubFeeDueList.length > 0) {
  //           // this._alertService.error('Please payment previous due first!');
  //           return;
  //         }
  //         var checkedList = this.memberSubAdvancedList
  //           .filter((x) => x.IsChecked)
  //           .sort(
  //             (a, b) =>
  //               new Date(a.PaymentDate).getTime() -
  //               new Date(b.PaymentDate).getTime()
  //           );
  //         var uncheckedList = this.memberSubAdvancedList
  //           .filter((x) => !x.IsChecked)
  //           .sort(
  //             (a, b) =>
  //               new Date(a.PaymentDate).getTime() -
  //               new Date(b.PaymentDate).getTime()
  //           );

  //         for (let i = 0; i < checkedList.length; i++) {
  //           if (checkedList[i]?.PaymentDate > uncheckedList[0]?.PaymentDate) {
  //             // this._alertService.error('Please select previous first!');
  //             return;
  //           }
  //         }
  //       }

  //       if (this.member.CurrentBalance < this.totalSubscriptionFee) {
  //         this._modalService.open(paymentModal);
  //         this.paymentInformation.Amount = Number(
  //           (this.totalSubscriptionFee - this.member.CurrentBalance).toFixed(2)
  //         );
  //       } else {
  //         if (this.paymentTypeText === 'due') {
  //           this.dueSubPayment(pdfViewerModal);
  //         } else {
  //           this.advancedSubPayment(pdfViewerModal);
  //         }
  //       }
  //     }
  //   });

  //   this._modalService.dismissAll();
  // }

  advancedSubPayment(pdfViewerModal) {
    const has = this.memberSubAdvancedList.find((x) => x.IsChecked == true);
    if (!has) {
      // this._alertService.warning('Please select one!');
      return;
    }
    this._service
      .saveAdvancedSubPayment(this.memberSubAdvancedList, this.member.Id)
      .subscribe((res) => {
        if (res.HasError) {
          res.Messages.forEach((element) => {
            // this._alertService.error(element);
          });
        } else {
          // this._alertService.success('Subscription Advanced Payment Successfully');
          // this.loadAllAdvanced();
          this.resetAll();

          this._service
            .getSubscriptionPaymentReport(res.DataList[0].PaymentNo)
            .subscribe((data) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                (this.pdfSrc = new Uint8Array(reader.result as ArrayBuffer)),
                  toString();
                this._modalService.open(pdfViewerModal, {
                  size: 'lg',
                  centered: true,
                });
              };
              reader.readAsArrayBuffer(data);
            });
        }
      });
  }

  resetAll() {
    this.memberSubFeeDueList = [];
    this.memberSubAdvancedList = [];
    this.member = {};
    // this.subscriptionPayment = {}
    this.paymentInformation = {};

    this.memberSubPaidList = [];
  }
  onCheckDuePayment(event, i) {
    if (event.target.checked) {
      this.duePaymentDetailList = [];
      this.duePaymentDetailList = this.memberSubFeeDueList
        .slice(0, i + 1)
        .map((item) => {
          return { ...item, IsChecked: true };
        });
    } else {
      this.duePaymentDetailList.splice(i, this.duePaymentDetailList.length - i);
    }
  }
  openPaymentModal(payment) {
    this._modalService.open(payment);
  }
  onCheckAllDue(event) {
    if (event.target.checked) {
      this.duePaymentDetailList = [];
      this.memberSubFeeDueList.forEach((element) => {
        element.IsChecked = true;
        this.duePaymentDetailList.push(element);
      });
    } else {
      this.duePaymentDetailList = [];
    }
  }

  onCheckAllAdvance(event) {
    if (event.target.checked) {
      this.advancedPaymentDetailList = [];
      this.memberSubAdvancedList.forEach((element) => {
        element.IsChecked = true;
        this.advancedPaymentDetailList.push(element);
      });
    } else {
      this.advancedPaymentDetailList = [];
    }
  }
  isChekedAdvance(data) {
    if (
      this.advancedPaymentDetailList.filter((c) => c.Id == data.Id)?.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
  isChekedDue(data) {
    if (this.duePaymentDetailList.filter((c) => c.Id == data.Id)?.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  onCheckAdvancePayment(event, i) {
    if (event.target.checked) {
      this.advancedPaymentDetailList = [];
      this.advancedPaymentDetailList = this.memberSubAdvancedList
        .slice(0, i + 1)
        .map((item) => {
          return { ...item, IsChecked: true };
        });
    } else {
      this.advancedPaymentDetailList.splice(
        i,
        this.advancedPaymentDetailList.length - i
      );
    }
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmitDuePayment() {
    var TopUpReq = {
      RegisterMemberId: this.member.Id,
      MemberShipNo: this.member.MemberShipNo,
      OnlineTopUp: false,
      OfflineTopUp: true,
      TopUpDate: this.formatDate(new Date()),
      Status: 'None',
      TopUpDetails: [this.paymentInfoForm.value],
    };

    var model = {
      MemberId: this.member.Id,
      Model: this.duePaymentDetailList,
      topup: TopUpReq,
    };
    this._service.savedueSubPayment(model).subscribe(
      (data) => {
        console.log(data);
        this.showAlert(this.alertType.createSuccessAlert);
        this.showMemberInfo();
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
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
