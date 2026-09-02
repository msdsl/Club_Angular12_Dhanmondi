import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { MemberSMS } from '../../sms/member-sms/memberSms';
import { SmsService } from '../../sms/sms.service';
import { EmailService } from '../email.service';

@Component({
  selector: 'app-member-email',
  standalone: false,
  templateUrl: './member-email.component.html',
  styleUrl: './member-email.component.scss',
})
export class MemberEmailComponent implements OnInit {
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  bloodGroups: any[] = [];
  memberProfessions: any[] = [];
  memberTypes: any[] = [];
  memberActiveStatus: any[] = [];
  selectedMembers: MemberSMS[] = [];
  pagedMembers: any[] = [];
  spin = false;
  memberSMSInfoList: any[] = [];
  hasData: any;
  filterForm: any;
  memberEmailForm: FormGroup;
  constructor(
    private _service: SmsService,
    private _emailService: EmailService,

    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService
  ) {}
  ngOnInit(): void {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.creatememberEmailForm();
    this.createFilterForm();
    this.getBloodGroupData();
    this.getMemberProfessionList();
    this.getMemberTypeList();
    this.getMemberActiveStatusList();
    this.getMemberList();
  }
  creatememberEmailForm() {
    this.memberEmailForm = this.fb.group({
      subject: [null, Validators.required],

      Message: [''],
      SmsReqList: [''],
    });
  }
  createFilterForm() {
    this.filterForm = this.fb.group({
      MemberShipNo: null,
      FullName: null,
      CadetName: null,
      MemberTypeId: null,
      MemberActiveStatusId: null,
      Phone: null,
      Email: null,
      CollegeId: null,
      BatchNo: null,
      BloodGroupId: null,
      MemberProfessionId: null,
      Organaization: null,
      Designation: null,
      Specialization: null,
      HscYear: null,
      CadetNo: null,
      memFullId: null,
    });
  }
  getMemberInfomodal(x: any) {
    this.modalService.open(x, { size: 'xl' });
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }
  filterData() {}
  removeMemberSMS(x: any) {
    const index = this.selectedMembers?.indexOf(x);
    if (index! > -1) {
      this.selectedMembers?.splice(index!, 1);
      x.isChecked = false;
    }

    this.memberSMSInfoList.map((x) => {
      if (
        this.selectedMembers.filter((c) => c.MemberShipNo == x.MemberShipNo)
          .length > 0
      ) {
        x.isChecked = true;
      } else {
        x.isChecked = false;
      }
    });
  }
  getMemberList() {
    this.spin = true;
    this._service.getAllSMSMemberInfo(this.filterForm.value).subscribe(
      (data) => {
        if (data.DataList) {
          this.memberSMSInfoList = data.DataList;
          this.hasData = this.memberSMSInfoList?.length > 0;
          this.numberOfEntries = data.DataCount;

          if (this.selectedMembers.length > 0) {
            this.memberSMSInfoList.map((x) => {
              if (
                this.selectedMembers.filter(
                  (c) => c.MemberShipNo == x.MemberShipNo
                ).length > 0
              ) {
                x.isChecked = true;
              }
            });
          }
          this.updatePageWiseTableData(this.currentPage);
          this.cdr.detectChanges();
        }
      },
      (err) => {
        this.spin = false;
        this.hasData = false;
      }
    );
  }

  resetFilterForm() {
    this.filterForm.reset();
  }
  getCheckedMember(x: MemberSMS) {
    if (x.isChecked) {
      this.selectedMembers.push(x);
    } else {
      this.selectedMembers = this.selectedMembers.filter(
        (member) => member.Id !== x.Id
      );
    }
  }
  checkUncheckAllMember(event: any) {
    if (event.target.checked) {
      this.memberSMSInfoList.map((x) => (x.isChecked = true));
      this.selectedMembers = this.memberSMSInfoList;
    } else {
      this.memberSMSInfoList.map((x) => (x.isChecked = false));
      this.selectedMembers = [];
    }
  }
  updatePageWiseTableData(page: number) {
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedMembers = this.memberSMSInfoList.slice(startIndex, endIndex);
  }
  onSubmit() {
    console.log(this.selectedMembers, this.memberEmailForm.value);
    debugger;
    if (this.selectedMembers.length === 0) {
      return this._alert.error('Phone no is required');
    }

    if (!this.memberEmailForm.valid) {
      return this._alert.error('Message body is required');
    }

    const body = this.memberEmailForm.value;
    body.SmsReqList = this.selectedMembers;
    body.LanType = 'English';

    Swal.fire({
      text: 'Are you sure you want to send bulk Email?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4255b5',
      cancelButtonColor: '#333',
      width: '20rem',
      confirmButtonText: 'Send',
    }).then((result) => {
      if (result.isConfirmed) {
        this._emailService.sendBulkEmail(body).subscribe({
          next: (res: any) => {
            this._alert.success('Bulk Email sent successfully');
            this.memberEmailForm.reset();
            this.selectedMembers = [];
          },
          error: (error: any) => {
            if (error?.Messages) {
              error.Messages.forEach((msg: any) => {
                this._alert.error(msg);
              });
            }
          },
        });
      }
    });
  }
  onProcess() {}
  resetData() {
    this.selectedMembers = [];
  }

  getMemberActiveStatusList() {
    this._service.getMemberActiveStatusPagination(1, 100).subscribe(
      (data) => {
        this.memberActiveStatus = data.Data;
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getMemberTypeList() {
    this._service.getMemberTypePagination(1, 1000).subscribe(
      (data) => {
        this.memberTypes = data.Data;
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getMemberProfessionList() {
    this._service.getMemberProfessionPagination(1, 1000).subscribe(
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
    this._service.getAllBloodGroupData().subscribe(
      (res) => {
        this.bloodGroups = res.DataList;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
}
