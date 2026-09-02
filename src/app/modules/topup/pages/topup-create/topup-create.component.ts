import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { environment } from 'src/environments/environment';
import { TopupService } from '../../services/topup.service';
import { SweetAlertOptions } from 'sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-topup-create',
  templateUrl: './topup-create.component.html',
  styleUrls: ['./topup-create.component.css'],
})
export class TopupCreateComponent implements OnInit {
  topUpForm: FormGroup;
  memberSearchForm: FormGroup;
  member: any;
  TopUpDetailsArray: any;
  paymentMethodList: any;
  creditCardList: any;
  bankInfoList: any;
  isBank = false;
  isCard = false;
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};
  pdfSrc: any;
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private service: SubscriptionService,
    private topupService: TopupService,
    private alertType: AlertTypeService,
    private _router: Router,
    private _modalService: NgbModal,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.memberSearch();
    this.createtopUpForm();
    this.loadAllPaymentMethod();
    this.getAllCreditCard();
    this.getBanks();
  }
  memberSearch() {
    this.memberSearchForm = this.fb.group({
      MemberShipNo: ['', [Validators.required]],
    });
  }
  createtopUpForm() {
    this.topUpForm = this.fb.group({
      MemberShipNo: null,
      TotalAmount: 0,
      Id: 0,
      RegisterMemberId: 0,
      TopUpDate: '',
      MemberCardNo: '',
      CurrentBalance: 0,
      MemberName: '',
      CreateByName: '',
      CardNo: '',
      OnlineTopUp: true,
      TransId: '',
      Currency: '',
      OfflineTopUp: true,
      PaymentMode: '',
      Note: '',
      Status: '',
      CreatedBy: '',
      TopUpDetails: this.fb.array([]),
    });
    this.createDetail();
    this.topUpForm.get('TopUpDetails') as FormArray;
    this.TopUpDetailsArray = (
      this.topUpForm.get('TopUpDetails') as FormArray
    ).controls;
  }

  createDetail() {
    const newItem = this.fb.group({
      Id: 0,
      PaymentMethodId: [null, [Validators.required]],
      BankId: null,
      Amount: null,
      TrxNo: '',
      MachineNo: '',
      TrxCardNo: '',
      TOPUPNO: '',
      TopUpId: 0,
      PaymentMethodText: '',
      BankText: '',
      CreditCardId: null,
      CreditCardText: '',
    });
    (this.topUpForm.get('TopUpDetails') as FormArray).push(newItem);
  }

  addItemDetail(i) {
    var PaymentMethodId =
      this.TopUpDetailsArray[this.TopUpDetailsArray.length - 1].value
        .PaymentMethodId;

    if (!PaymentMethodId) {
      return;
    }

    this.createDetail();
  }

  removeItem(index: number) {
    (this.topUpForm.get('TopUpDetails') as FormArray).removeAt(index);
  }

  loadAllPaymentMethod() {
    this.topupService.getAllPaymentMethod().subscribe((res) => {
      this.paymentMethodList = res.DataList;
      this.cdr.detectChanges();
    });
  }

  getAllCreditCard() {
    this.topupService.getAllCreditCard().subscribe((res) => {
      this.creditCardList = res.DataList;
    });
  }
  getBanks() {
    this.topupService.getAllBank().subscribe((res) => {
      if (res.HasError) {
        res.Messages.forEach((element) => {});
      } else {
        this.bankInfoList = res.DataList;
      }
    });
  }

  showMemberInfo() {
    if (this.memberSearchForm.value.MemberShipNo) {
      this.service
        .getMemberInfoByMemberShipNo(this.memberSearchForm.value.MemberShipNo)
        .subscribe((res) => {
          this.member = res.Data;
          if (!res.Data) {
            this.alert.warning(res.Messages[0]);
          }
          this.topUpForm.get('RegisterMemberId').patchValue(this.member.Id);
          this.cdr.detectChanges();
          this.member.ImgFileUrl = environment.imgUrl + this.member.ImgFileUrl;
        });
    }
  }
  changePaymentType(event: any, index: number, item?) {
    const selectedPaymentMethodId = event.Id;

    if (event) {
      item.controls.PaymentMethodText.value = event.Title;
    } else {
      item.controls.PaymentMethodText.value = null;
    }
    const topUpDetailsFormArray = this.topUpForm.get(
      'TopUpDetails'
    ) as FormArray;
    const selectedFormGroup = topUpDetailsFormArray.at(index) as FormGroup;
    const ptype = this.paymentMethodList.find(
      (x) => x.Id == selectedPaymentMethodId
    );

    if (ptype?.Title === 'CASH' || ptype?.Title === 'BKASH') {
      this.isBank = false;
      this.isCard = false;

      selectedFormGroup.get('CreditCardId')?.clearValidators();
      selectedFormGroup.get('CreditCardId')?.updateValueAndValidity();
    } else if (ptype?.Title === 'CHEQUE') {
      this.isBank = true;
      this.isCard = false;
      selectedFormGroup.get('BankId')?.setValidators([Validators.required]);
      selectedFormGroup.get('BankId')?.updateValueAndValidity();
    } else if (ptype?.Title === 'CARD') {
      this.isBank = false;
      this.isCard = true;
      selectedFormGroup
        .get('CreditCardId')
        ?.setValidators([Validators.required]);
      selectedFormGroup.get('CreditCardId')?.updateValueAndValidity();
    } else if (ptype?.Title === 'BANK TRANSFER') {
      this.isBank = true;
      this.isCard = false;
      selectedFormGroup.get('BankId')?.setValidators([Validators.required]);
      selectedFormGroup.get('BankId')?.updateValueAndValidity();
    } else {
      this.isBank = false;
      this.isCard = false;
      selectedFormGroup.get('CreditCardId')?.clearValidators();
      selectedFormGroup.get('CreditCardId')?.updateValueAndValidity();
    }
  }
  goToListPage() {
    this._router.navigate(['topup']);
  }
  url: any;
  onSubmit(pdfViewerModal) {
    if (!this.topUpForm.valid) {
      return this.alert.error('validation ereor!');
    }

    this.topUpForm
      .get('MemberShipNo')
      .patchValue(this.memberSearchForm.value.MemberShipNo);
    this.topUpForm.get('Status').setValue('Confirm');
    this.topUpForm.get('TopUpDate').patchValue(new Date());
    this.topupService.createTopUp(this.topUpForm.value).subscribe((data) => {
      this.topupService
        .getTopUpsReport(data.Data.Id)
        .subscribe((blobData: Blob) => {
          let documentBlob = new Blob([blobData], {
            type: 'application/pdf',
          });
          this.url = URL.createObjectURL(documentBlob);
          this.cdr.detectChanges();
          this._modalService.open(pdfViewerModal, {
            size: 'lg',
            centered: true,
          });
        });
      this.showAlert(this.alertType.createSuccessAlert);
      this.goToListPage();
    });
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Topup');
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
