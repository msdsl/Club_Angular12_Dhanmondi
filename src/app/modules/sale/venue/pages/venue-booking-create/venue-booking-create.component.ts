import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { VenueService } from '../../services/venue.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { Router } from '@angular/router';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { environment } from 'src/environments/environment';
import { AddonsItemService } from 'src/app/modules/setup/services/addons-item.service';
import { AlertService } from 'src/app/@shared/AlertService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TopupService } from 'src/app/modules/topup/services/topup.service';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';

@Component({
  selector: 'app-venue-booking-create',
  templateUrl: './venue-booking-create.component.html',
  styleUrls: ['./venue-booking-create.component.css'],
})
export class VenueBookingCreateComponent implements OnInit {
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  venueBookingForm: FormGroup;
  paymentInfoForm: FormGroup;
  member: any;
  venueList: any;
  selected: any;
  venue: any;
  baseUrl = environment.imgUrl;
  VenueBookingDetailReqs: any = [];
  VenueBookingAddOnsItemReqs: any = [];
  addonList: any;
  selectedCriteria: any;
  termsAndCondition: any;
  addOnsTotalAmount: any;
  paymentMethodList: any;
  bankInfoList: any;
  creditCardList: any;
  bookingInfo: any;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private service: VenueService,
    private alertType: AlertTypeService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private addonsItemService: AddonsItemService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private topupService: TopupService,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.createVenueBookingForm();
    this.createPaymentInfoForm();
    this.loadAllAddonsItems();
    this.getTermsAndCondition();
    this.loadAllPaymentMethod();
    this.getAllBank();
    this.getAllCreditCard();
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

  getTermsAndCondition() {
    this.service.getTermsAndCandition().subscribe(
      (data) => {
        this.termsAndCondition = data;
      },
      (err) => {
        console.log(err);
      }
    );
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
      Note:''
    });
  }

  onSubmitPaymentInfoForm() {
    
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

    this.venueBookingForm.get('TopUpReq').patchValue(TopUpReq);
    this.saveVenuBookingHandelar();
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  createVenueBookingForm() {
    this.venueBookingForm = this.fb.group({
      Id: 0,
      MemberName: '',
      BookingCriteria: '',
      BookingCriteriaId: 0,
      BookingPrice: 0,
      OrderFrom: 'WEBAPP',
      RefName: '',
      RefRelation: '',
      Note: '',
      BookingPurpose: '',
      RefPhoneNo: '',
      TotalAmount: 0,
      VatAmount: 0,
      ServiceAmount: 0,
      DiscountPercent: null,
      DiscountAmount: 0,
      RefundAmount: 0,
      CreatedDate: '',
      VatPercentage: 0,
      ServicePercent: 0,
      AdditionalFee: 0,
      IsTramsAndCondition: false,
      BookedNo: '',
      BookedDate: this.formatDate(new Date()),
      BookingDate: this.formatDate(new Date()),
      BookingStatus: 'Pending',
      MemberId: null,
      MemberShipNo: '',
      Amount: 0,
      PaymentAmount: 0,
      PaymentDate: this.formatDate(new Date()),
      CurrentBalance: null,
      VenueBookingDetailReqs: [],
      TopUpReq: null,
    });
  }
  updateIsTramsAndCondition(event) {
    this.venueBookingForm
      .get('IsTramsAndCondition')
      .patchValue(event.target.checked);
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  showMemberInfo() {
    if (this.venueBookingForm.value.MemberShipNo) {
      const memberShipNo = this.venueBookingForm.value.MemberShipNo.padStart(
        5,
        '0'
      );
      this.subscriptionService
        .getMemberInfoByMemberShipNo(memberShipNo)
        .subscribe((res) => {
          
          this.member = res.Data;
          if(!res.Data){

            this.alert.warning(res.Messages[0])
          }
            console.log(this.member);
            this.venueBookingForm.get('MemberId').patchValue(this.member.Id);
            this.venueBookingForm
              .get('CurrentBalance')
              .patchValue(this.member.CurrentBalance);
            this.member.ImgFileUrl =
              environment.imgUrl + '' + this.member.ImgFileUrl;
            this.getAllVenues();
            this.cdr.detectChanges();
          
          (error: any) => {
            console.log(error);
          };
        });
    }
  }

  getAllVenues() {
    this.service.getVenuList(this.venueBookingForm.value.BookedDate).subscribe(
      (data) => {
        this.venueList = data.DataList;
        console.log(this.venueList);
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }
  loadAllAddonsItems() {
    this.addonsItemService.getAddonsItemPagination(1, 1000).subscribe(
      (data) => {
        this.addonList = data.Data;
      },
      (error: any) => {
        error.Messages.forEach((element: any) => {});
      }
    );
  }

  showSelectedVenue(item, i) {
    this.selected = i;

    this.venue = this.venueList.find((x) => x.Id == item.Id)!;
    // this.venueBookingForm.get("VatPercentage").value(this.venue.VatPercent)
    this.venue.BookingCriterias = this.venue.BookingCriterias.map(
      (criteria) => ({
        ...criteria,
        displayLabel: `${criteria.Title} - Price ${criteria.Price}`,
      })
    );
  }

  isCheked(availability) {
    if (
      this.VenueBookingDetailReqs.find(
        (c) => c.AvailabilityId == availability.Id
      )
    ) {
      return true;
    } else {
      return false;
    }
  }
  selectCriteria(event) {
    this.selectedCriteria = event;
    this.calculate();
  }

  bookingInfoByDate(venueId: number, availabilityId: number, bookedDate: any) {
    
    this.service
      .bookingInfoByDate(
        venueId,
        availabilityId,

        new DateConverter().dateModal(bookedDate).split('T')[0] as any
      )
      .subscribe((res) => {
        if (!res.HasError) {
          this.bookingInfo = res;
          console.log(this.bookingInfo);
        }
        (error: any) => {
          error.Messages.forEach((element: string) => {
            this.alertService.error(element);
          });
        };
      });
  }

  setAmount(event, availability) {
    if (event.target.checked) {
      var VenueBookingDetail = {
        BookingDate: this.venueBookingForm.value.BookingDate,
        AvailabilityId: availability.Id,
        VenueId: this.venue.Id,
        VenueTitle: this.venue.Title,
        StartTime: availability.StartTime,
        EndTime: availability.EndTime,
        AvailabilityTitle: availability.Title,
      };

      this.VenueBookingDetailReqs.push(VenueBookingDetail);
      this.calculate();
    } else {
      var index = this.VenueBookingDetailReqs.findIndex(
        (c) => c.AvailabilityId == availability.Id
      );
      if (index != -1) {
        this.VenueBookingDetailReqs.splice(index, 1);
        this.calculate();
      }
    }
  }

  calculateOnEnterDiscount() {
    this.venueBookingForm
      .get('DiscountAmount')
      .patchValue(
        (this.venueBookingForm.value.Amount *
          this.venueBookingForm.value.DiscountPercent) /
          100
      );

    this.venueBookingForm
      .get('VatAmount')
      .patchValue(
        ((this.venueBookingForm.value.Amount -
          this.venueBookingForm.value.DiscountAmount) *
          this.venue.VatPercent) /
          100
      );
    this.venueBookingForm
      .get('TotalAmount')
      .patchValue(
        (this.venueBookingForm.value.Amount +
          this.venueBookingForm.value.VatAmount +
          this.venueBookingForm.value.ServiceAmount).toFixed(2)
      );
  }

  calculate() {
    var amount = 0;
    if (this.VenueBookingDetailReqs?.length > 0) {
      this.VenueBookingDetailReqs.forEach((element) => {
        amount += this.selectedCriteria.Price;
        if (element.VenueBookingAddOnsItemReqs?.length > 0) {
          element.VenueBookingAddOnsItemReqs.forEach((addonElement) => {
            amount += addonElement.Price;
          });
        }
      });
      this.venueBookingForm.get('Amount').patchValue(amount);
      this.venueBookingForm
        .get('VatAmount')
        .patchValue(
          ((amount * this.venue.VatPercent) / 100) *
            this.VenueBookingDetailReqs.length
        );
      this.venueBookingForm
        .get('ServiceAmount')
        .patchValue(
          ((amount * this.venue.ServicePercent) / 100) *
            this.VenueBookingDetailReqs.length
        );
      this.venueBookingForm
        .get('TotalAmount')
        .patchValue(
          amount +
            this.venueBookingForm.value.VatAmount +
            this.venueBookingForm.value.ServiceAmount
        );
    }

    // this.venueBookingForm.get("Amount").patchValue(this.selectedCriteria.Price * this.VenueBookingDetailReqs.length)
    // this.venueBookingForm.get("VatAmount").patchValue(((this.selectedCriteria.Price * this.venue.VatPercent) / 100) * this.VenueBookingDetailReqs.length)
    // this.venueBookingForm.get("ServiceAmount").patchValue(((this.selectedCriteria.Price * this.venue.ServicePercent) / 100) * this.VenueBookingDetailReqs.length)

    // this.venueBookingForm.get("TotalAmount").patchValue(this.venueBookingForm.value.Amount + this.venueBookingForm.value.VatAmount + this.venueBookingForm.value.ServiceAmount)
  }

  selectAddonWithDetail(event, detailsId) {
    if (
      this.VenueBookingDetailReqs.find(
        (p) => p.AvailabilityId === detailsId
      )?.VenueBookingAddOnsItemReqs?.some((c) => c.AddOnsItemId === event.Id) ??
      false
    ) {
      this.alertService.warning('Already added!');
      return;
    }
    var addon = event;

    var VenueBookingAddOnsItem = {
      AddOnsItemId: addon.Id,
      Price: addon.Price,
      PriceDate: addon.PriceDate,
      Title: addon.Title,
      Description: addon.Description,
      AvailabilityId: detailsId,
    };
    var VenueBookingDetail = this.VenueBookingDetailReqs.find(
      (c) => c.AvailabilityId == detailsId
    );

    if (!VenueBookingDetail.VenueBookingAddOnsItemReqs) {
      VenueBookingDetail.VenueBookingAddOnsItemReqs = [];
    }

    // Now push the item into the array
    VenueBookingDetail.VenueBookingAddOnsItemReqs.push(VenueBookingAddOnsItem);
    // this.venueBooking.VenueBookingAddOnsItemReqs.push(addonmodel);
    this.calculate();
  }

  deleteSelectedAddons(availabilityId, addon) {
    var VenueBookingDetail = this.VenueBookingDetailReqs.find(
      (c) => c.AvailabilityId == availabilityId
    );
    var index = VenueBookingDetail.VenueBookingAddOnsItemReqs.findIndex(
      (c) => c.AddOnsItemId == addon.AddOnsItemId
    );

    if (index != -1) {
      VenueBookingDetail.VenueBookingAddOnsItemReqs.splice(index, 1);
      // this.calculateAddonAmount()
      this.calculate();
    }
  }

  onSubmit(termsModal) {
    if (!this.venueBookingForm.value.BookingCriteriaId) {
      this.alertService.warning('Please select a venue fee category');
      return;
    }
    this.addOnsTotalAmount = 0;
    if (this.VenueBookingDetailReqs?.length > 0) {
      this.VenueBookingDetailReqs.forEach((element) => {
        if (element.VenueBookingAddOnsItemReqs?.length > 0) {
          element.VenueBookingAddOnsItemReqs.forEach((addonElement) => {
            this.addOnsTotalAmount += addonElement.Price;
          });
        }
      });
    }

    this.modalService.open(termsModal, {});
    console.log('submit');
  }

  getVenueBookingAddOnsItemReqs(availabilityId) {
    this.VenueBookingDetailReqs;
    return this.VenueBookingDetailReqs?.find(
      (c) => c.AvailabilityId == availabilityId
    )?.VenueBookingAddOnsItemReqs;
  }

  saveWithTopUp(paymentModal: any) {
    if (this.venueBookingForm.value.IsTramsAndCondition == false) {
      return this.alertService.error(
        'Please accept terms and condition to book the venue'
      );
    }
    if (
      (this.member.CurrentBalance+(this.member.CreditLimit?this.member.CreditLimit:0)) < this.venueBookingForm.value.PaymentAmount
    ) {
      this.modalService.open(paymentModal);
    } else {
      this.saveVenuBookingHandelar();
    }
  }
  saveVenuBookingHandelar() {
    if (
      this.venueBookingForm.value.PaymentAmount <
      this.venueBookingForm.value.Amount
    ) {
      this.venueBookingForm.get('BookingStatus').patchValue('Pending');
    } else {
      this.venueBookingForm.get('BookingStatus').patchValue('Success');
    }

    this.venueBookingForm
      .get('VenueBookingDetailReqs')
      .patchValue(this.VenueBookingDetailReqs);

    this.service.createVenueBooking(this.venueBookingForm.value).subscribe(
      (data) => {
        console.log(data);
        this.modalService.dismissAll();
        this.alertService.success('Venue booking created successfully');
        this.router.navigate(['sale/venue-booking/list']);
      },
      (err) => {
        console.log(err);
        this.modalService.dismissAll();
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }
  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Venue');
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
    this.router.navigate(['sale/venue-booking/list']);
  }
}
