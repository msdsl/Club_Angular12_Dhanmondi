import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { MemberActiveStatusService } from 'src/app/modules/setup/services/member-active-status.service';
import { MemberProfessionService } from 'src/app/modules/setup/services/member-profession.service';
import { MemberStatusService } from 'src/app/modules/setup/services/member-status.service';
import { MemberTypeService } from 'src/app/modules/setup/services/member-type.service';
import { MemberService } from 'src/app/modules/setup/services/member.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { MemberbcService } from '../../services/memberbc.service';

@Component({
  selector: 'app-bcpersonal-info',
  standalone: false,
  templateUrl: './bcpersonal-info.component.html',
  styleUrl: './bcpersonal-info.component.scss',
})
export class BcpersonalInfoComponent implements OnInit {
  @Input() memberId: any;
  memberTypes: any;
  memberProfessions: any;
  bloodGroups: any;
  memberActiveStatus: any;
  memberForm: any;
  memberStatus: any;
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  // Modern image upload state
  selectedProfileFile: File | null = null;
  imagePreviewUrl: string | null = null;
  selectedFileName: string = '';
  selectedFileSize: string = '';
  isDragOver: boolean = false;

  constructor(
    private service: MemberbcService,
    private memberTypeService: MemberTypeService,
    private memberActiveStatusService: MemberActiveStatusService,
    private memberProfessionService: MemberProfessionService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private memberStatusService: MemberStatusService,
    private alertType: AlertTypeService
  ) {}

  ngOnInit() {
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
      ProfileFile: data.ProfileFile,
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

    // Handle existing photo preview from server
    if (data.ImgFileUrl && typeof data.ImgFileUrl === 'string' && data.ImgFileUrl.trim() !== '' && data.ImgFileUrl !== 'null') {
      if (!data.ImgFileUrl.startsWith('http')) {
        const base = (this.service['APIUrl'] || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
        this.imagePreviewUrl = `${base}/${data.ImgFileUrl.replace(/^\//, '')}`;
      } else {
        this.imagePreviewUrl = data.ImgFileUrl;
      }
    } else {
      this.imagePreviewUrl = null;
    }
    this.selectedProfileFile = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.cdr.detectChanges();
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
      CollegeId: null,
      MemberProfessionId: null,
      MemberTypeId: [null, Validators.required],
      MemberStatusId: ['', Validators.required],
      BloodGroupId: null,
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
      HscYear: null,
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
          this.memberProfessions = data.Data;
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

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.processSelectedFile(event.dataTransfer.files[0]);
    }
  }

  imageChangeHandler(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processSelectedFile(input.files[0]);
      input.value = '';
    }
  }

  processSelectedFile(file: File) {
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 5MB. Please select a smaller photo.');
      return;
    }

    this.selectedProfileFile = file;
    this.selectedFileName = file.name;
    this.selectedFileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Local preview only (Base64 is NEVER sent to DB)
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedProfileFile = null;
    this.imagePreviewUrl = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.memberForm.get('ImgFileUrl')?.patchValue(null);
    this.memberForm.get('ProfileFile')?.patchValue(null);
    this.cdr.detectChanges();
  }

  prepareToSave() {
    const formData = new FormData();

    formData.append('MemberFullId', this.memberForm.value.MemberFullId || '');
    formData.append('OfficeAddress', this.memberForm.value.OfficeAddress || '');
    formData.append('HscYear', this.memberForm.value.HscYear || '');
    formData.append('Specialization', this.memberForm.value.Specialization || '');
    formData.append('Designation', this.memberForm.value.Designation || '');
    formData.append('Organaization', this.memberForm.value.Organaization || '');
    formData.append('Email', this.memberForm.value.Email || '');
    formData.append('Phone', this.memberForm.value.Phone || '');
    formData.append('CadetName', this.memberForm.value.CadetName || '');
    formData.append('FullName', this.memberForm.value.FullName || '');
    formData.append('QBCusName', this.memberForm.value.QBCusName || '');
    formData.append('PinNo', this.memberForm.value.PinNo || '');
    formData.append('MemberActiveStatusId', this.memberForm.value.MemberActiveStatusId || '');
    formData.append('BloodGroupId', this.memberForm.value.BloodGroupId || '');
    formData.append('MemberStatusId', this.memberForm.value.MemberStatusId || '');
    formData.append('MemberTypeId', this.memberForm.value.MemberTypeId || '');
    formData.append('MemberProfessionId', this.memberForm.value.MemberProfessionId || '');
    formData.append('CollegeId', this.memberForm.value.CollegeId || '');

    // 1. Binary profile image file: Only append if an actual File was selected
    if (this.selectedProfileFile instanceof File) {
      formData.append('ProfileFile', this.selectedProfileFile, this.selectedProfileFile.name);
    }

    // 2. ImgFileUrl: Do NOT send Base64 string! Only pass relative server path if retaining old photo
    const currentImg = this.memberForm.value.ImgFileUrl;
    if (this.imagePreviewUrl && currentImg && typeof currentImg === 'string' && !currentImg.startsWith('data:')) {
      formData.append('ImgFileUrl', currentImg);
    } else {
      formData.append('ImgFileUrl', '');
    }

    formData.append('DeviceId', this.memberForm.value.DeviceId || '');
    formData.append('Dob', this.memberForm.value.Dob || '');
    formData.append('PaidTill', this.memberForm.value.PaidTill || '');
    formData.append('Anniversary', this.memberForm.value.Anniversary || '');
    formData.append('MemberTypeText', this.memberForm.value.MemberTypeText || '');
    formData.append('MemberShipNo', this.memberForm.value.MemberShipNo || '');
    formData.append('CreditLimit', this.memberForm.value.CreditLimit || '');
    formData.append('BatchNo', this.memberForm.value.BatchNo || '');
    formData.append('CadetNo', this.memberForm.value.CadetNo || '');
    formData.append('SpouseCardNo', this.memberForm.value.SpouseCardNo || '');
    formData.append('CardNo', this.memberForm.value.CardNo || '');
    formData.append('Id', this.memberForm.value.Id || 0);
    formData.append('PrvCusID', this.memberForm.value.PrvCusID || '');
    formData.append('PostalAddress', this.memberForm.value.PostalAddress || '');
    formData.append('Nok', this.memberForm.value.Nok || '');
    formData.append('Name', this.memberForm.value.Name || '');
    formData.append('ClubJoinDate', this.memberForm.value.ClubJoinDate || '');
    formData.append('EmergencyContact', this.memberForm.value.EmergencyContact || '');
    formData.append('PermanentAddress', this.memberForm.value.PermanentAddress || '');
    formData.append('NID', this.memberForm.value.NID || '');
    formData.append('LeaveDate', this.memberForm.value.LeaveDate || '');
    formData.append('JoinDate', this.memberForm.value.JoinDate || '');
    formData.append('HasSubscription', this.memberForm.value.HasSubscription ? 'true' : 'false');
    formData.append('CollegeName', this.memberForm.value.CollegeName || '');
    formData.append('HomeAddress', this.memberForm.value.HomeAddress || '');

    return formData;
  }

  onSubmit() {
    var member = this.prepareToSave();
    
    this.service.createMember(member).subscribe(
      (data) => {
        
        this.showAlert(this.alertType.createSuccessAlert);
      },
      (err) => {
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Member');
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
    var memberFullId = this.memberForm.value.MemberShipNo;
    this.memberForm.get('MemberFullId').patchValue(memberFullId);
  }
}
