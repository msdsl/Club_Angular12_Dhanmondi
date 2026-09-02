import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CollegeService } from 'src/app/modules/setup/services/college.service';
import { MemberActiveStatusService } from 'src/app/modules/setup/services/member-active-status.service';
import { MemberProfessionService } from 'src/app/modules/setup/services/member-profession.service';
import { MemberTypeService } from 'src/app/modules/setup/services/member-type.service';
import { MemberService } from '../../services/member.service';
import { MemberStatusService } from 'src/app/modules/setup/services/member-status.service';
import { SweetAlertOptions } from 'sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css'],
})
export class PersonalInfoComponent implements OnInit {
  @Input() memberId: any;
  colleges: any;
  memberTypes: any;
  memberProfessions: any;
  bloodGroups: any;
  memberActiveStatus: any;
  memberForm: any;
  memberStatus: any;
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  constructor(
    private service: MemberService,
    private memberTypeService: MemberTypeService,
    private memberActiveStatusService: MemberActiveStatusService,
    private collegeService: CollegeService,
    private memberProfessionService: MemberProfessionService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private memberStatusService: MemberStatusService,
    private alertType: AlertTypeService
  ) {}

  ngOnInit() {
    this.getCollegeList();
    this.getMemberTypeList();
    this.getMemberActiveStatusList();
    this.getBloodGroupData();
    this.getMemberStatusList();
    this.getMemberProfessionList();
    this.createFilterForm();

    if (this.memberId) {
      this.getMemberInfoById(this.memberId);
    }
  }

  getMemberInfoById(memberId) {
    this.service.getMemberInfoById(memberId).subscribe(
      (data) => {
        console.log(data);
        this.setDataToForm(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setDataToForm(data) {
    this.memberForm.patchValue({
      Id: data.Id,
      FullName: data.FullName,
      Phone: data.Phone,
      Email: data.Email,
      PaidTillText: data.PaidTillText,
      CollegeName: data.CollegeName,
      MemberProfessionText: data.MemberProfessionText,
      BloodGroupText: data.BloodGroupText,
      HasSubscription: data.HasSubscription,
      JoinDate: data.JoinDate.toString().substring(0, 10).replace('T', ' '),
      LeaveDate: data.LeaveDate.toString().substring(0, 10).replace('T', ' '),
      NID: data.NID,
      PermanentAddress: data.PermanentAddress,
      EmergencyContact: data.EmergencyContact,
      ClubJoinDate: data.ClubJoinDate.toString()
        .substring(0, 10)
        .replace('T', ' '),
      Name: data.Name,
      Nok: data.Nok,
      PostalAddress: data.PostalAddress,
      PrvCusID: data.PrvCusID,
      CardNo: data.CardNo,
      SpouseCardNo: data.SpouseCardNo,
      CadetNo: data.CadetNo,
      BatchNo: data.BatchNo,
      CreditLimit: data.CreditLimit,
      MemberShipNo: data.MemberShipNo,
      MemberTypeText: data.MemberTypeText,
      Anniversary: data.Anniversary,
      PaidTill: data.PaidTill,
      Dob: data.Dob.toString().substring(0, 10).replace('T', ' '),
      DeviceId: data.DeviceId,
      ImgFileUrl: data.ImgFileUrl,
      CollegeId: data.CollegeId,
      MemberProfessionId: data.MemberProfessionId,
      MemberTypeId: data.MemberTypeId,
      MemberStatusId: data.MemberStatusId,
      BloodGroupId: data.BloodGroupId,
      MemberActiveStatusId: data.MemberActiveStatusId,
      PinNo: data.PinNo,
      QBCusName: data.QBCusName,
      CadetName: data.CadetName,
      Organaization: data.Organaization,
      Designation: data.Designation,
      Specialization: data.Specialization,
      HscYear: data.HscYear,
      OfficeAddress: data.OfficeAddress,
      HomeAddress: data.HomeAddress,
      MemberFullId: data.MemberFullId,
    });
  }

  createFilterForm() {
    this.memberForm = this.fb.group({
      PaidTillText: '',
      CollegeName: '',
      MemberProfessionText: '',
      BloodGroupText: '',
      HasSubscription: false,
      JoinDate: '',
      LeaveDate: '',
      NID: '',
      PermanentAddress: '',
      EmergencyContact: '',
      ClubJoinDate: '',
      Name: '',
      Nok: 'N/A',
      PostalAddress: '',
      PrvCusID: '',
      Id: 0,
      CardNo: ['', Validators.required],
      CadetNo: ['', Validators.required],
      BatchNo: ['', Validators.required],
      CreditLimit: '',
      MemberShipNo: ['', Validators.required],
      MemberTypeText: '',
      Anniversary: '',
      PaidTill: '',
      Dob: '',
      MemberchildrenReqs: [],
      MemberFeesMapRess: [],
      DeviceId: '',
      ImgFileUrl: null,
      ProfileFile: null,
      CollegeId: ['', Validators.required],
      MemberProfessionId: null,
      MemberTypeId: [null, Validators.required],
      MemberStatusId: ['', Validators.required],
      BloodGroupId: [null, Validators.required],
      MemberActiveStatusId: ['', Validators.required],
      PinNo: ['', Validators.required],
      QBCusName: '',
      FullName: ['', Validators.required],
      CadetName: '',
      Phone: '',
      Email: '',
      Organaization: '',
      Designation: '',
      Specialization: '',
      HscYear: ['', Validators.required],
      OfficeAddress: '',
      HomeAddress: '',
      MemberFullId: ['', Validators.required],
    });
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  getMemberProfessionList() {
    this.memberProfessionService
      .getMemberProfessionPagination(1, 1000)
      .subscribe(
        (data) => {
          this.memberProfessions = data.DataList;
          this.cdr.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getBloodGroupData() {
    this.service.getAllBloodGroupData().subscribe(
      (res) => {
        this.bloodGroups = res.DataList;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  getCollegeList() {
    this.collegeService.getCollegePagination(1, 1000).subscribe(
      (data) => {
        this.colleges = data.Data;
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getMemberTypeList() {
    this.memberTypeService.getMemberTypePagination(1, 1000).subscribe(
      (data) => {
        this.memberTypes = data.Data;
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getMemberActiveStatusList() {
    this.memberActiveStatusService
      .getMemberActiveStatusPagination(1, 100)
      .subscribe(
        (data) => {
          this.memberActiveStatus = data.Data;
          this.cdr.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getMemberStatusList() {
    this.memberStatusService.getMemberStatusPagination(1, 1000).subscribe(
      (data) => {
        this.memberStatus = data.Data;
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  imageChangeHandler(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.memberForm.get('ProfileFile').patchValue(file);
    reader.onload = (e: any) => {
      this.memberForm.get('ImgFileUrl').patchValue(e.target.result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    const inputElement = event.target as HTMLInputElement;
    // this.updateProfilePicture(inputElement.files as any);

    console.log(this.memberForm.value);
  }
  removeImage() {
    this.memberForm.get('ImgFileUrl').patchValue(null);
    this.memberForm.get('ProfileFile').patchValue(null);
    this.cdr.detectChanges();
  }

  prepareToSave() {
    const formData = new FormData();

    formData.append('MemberFullId', this.memberForm.value.MemberFullId);
    formData.append('OfficeAddress', this.memberForm.value.OfficeAddress);
    formData.append('HscYear', this.memberForm.value.HscYear);
    formData.append('Specialization', this.memberForm.value.Specialization);
    formData.append('Designation', this.memberForm.value.Designation);
    formData.append('Organaization', this.memberForm.value.Organaization);
    formData.append('Email', this.memberForm.value.Email);
    formData.append('Phone', this.memberForm.value.Phone);
    formData.append('CadetName', this.memberForm.value.CadetName);
    formData.append('FullName', this.memberForm.value.FullName);
    formData.append('QBCusName', this.memberForm.value.QBCusName);
    formData.append('PinNo', this.memberForm.value.PinNo);
    formData.append(
      'MemberActiveStatusId',
      this.memberForm.value.MemberActiveStatusId
    );
    formData.append('BloodGroupId', this.memberForm.value.BloodGroupId);
    formData.append('MemberStatusId', this.memberForm.value.MemberStatusId);
    formData.append('MemberTypeId', this.memberForm.value.MemberTypeId);
    formData.append(
      'MemberProfessionId',
      this.memberForm.value.MemberProfessionId
    );
    formData.append('CollegeId', this.memberForm.value.CollegeId);
    formData.append('ProfileFile', this.memberForm.value.ProfileFile);
    formData.append('ImgFileUrl', this.memberForm.value.ImgFileUrl);
    formData.append('ImgFileUrl', this.memberForm.value.ImgFileUrl);
    formData.append('DeviceId', this.memberForm.value.DeviceId);
    formData.append('Dob', this.memberForm.value.Dob);
    formData.append('PaidTill', this.memberForm.value.PaidTill);
    formData.append('Anniversary', this.memberForm.value.Anniversary);
    formData.append('MemberTypeText', this.memberForm.value.MemberTypeText);
    formData.append('MemberShipNo', this.memberForm.value.MemberShipNo);
    formData.append('CreditLimit', this.memberForm.value.CreditLimit);
    formData.append('BatchNo', this.memberForm.value.BatchNo);
    formData.append('CadetNo', this.memberForm.value.CadetNo);
    formData.append('SpouseCardNo', this.memberForm.value.SpouseCardNo);
    formData.append('CardNo', this.memberForm.value.CardNo);
    formData.append('Id', this.memberForm.value.Id);
    formData.append('PrvCusID', this.memberForm.value.PrvCusID);
    formData.append('PostalAddress', this.memberForm.value.PostalAddress);
    formData.append('Nok', this.memberForm.value.Nok);
    formData.append('Name', this.memberForm.value.Name);
    formData.append('ClubJoinDate', this.memberForm.value.ClubJoinDate);
    formData.append('EmergencyContact', this.memberForm.value.EmergencyContact);
    formData.append('PermanentAddress', this.memberForm.value.PermanentAddress);
    formData.append('NID', this.memberForm.value.NID);
    formData.append('LeaveDate', this.memberForm.value.LeaveDate);
    formData.append('JoinDate', this.memberForm.value.JoinDate);
    formData.append('HasSubscription', this.memberForm.value.HasSubscription);
    formData.append('CollegeName', this.memberForm.value.CollegeName);
    formData.append('HomeAddress', this.memberForm.value.HomeAddress);

    return formData;
  }

  onSubmit() {
    var member = this.prepareToSave();

    console.log(this.memberForm.value);
    this.service.createMember(member).subscribe(
      (data) => {
        console.log(data);

        this.showAlert(this.alertType.createSuccessAlert);
      },
      (err) => {
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('College');
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

  createMemberFullId() {
    // if(this.memberForm.value.CollegeId){

    // }

    var memberFullId =
      (this.memberForm.value.CollegeId ? this.memberForm.value.CollegeId : '') +
      '-' +
      this.memberForm.value.BatchNo +
      '-' +
      this.memberForm.value.CadetNo +
      '-' +
      (this.memberForm.value.MemberTypeId
        ? this.memberForm.value.MemberTypeId
        : '') +
      '-' +
      this.memberForm.value.MemberShipNo;
    this.memberForm.get('MemberFullId').patchValue(memberFullId);
  }
}
