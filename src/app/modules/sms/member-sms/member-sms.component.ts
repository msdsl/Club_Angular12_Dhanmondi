import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SmsService } from '../sms.service';
import { MemberSMS } from './memberSms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-member-sms',
  standalone: false,
  templateUrl: './member-sms.component.html',
  styleUrl: './member-sms.component.scss',
})
export class MemberSmsComponent implements OnInit {
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
  memberSmsForm: FormGroup;
  constructor(
    private _service: SmsService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService
  ) {}
  ngOnInit(): void {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.createMemberSmsForm();
    this.createFilterForm();
    this.getBloodGroupData();
    this.getMemberProfessionList();
    this.getMemberTypeList();
    this.getMemberActiveStatusList();
    this.getMemberList();
  }
  createMemberSmsForm() {
    this.memberSmsForm = this.fb.group({
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
    console.log(this.selectedMembers, this.memberSmsForm.value);
    debugger;
    if (this.selectedMembers.length === 0) {
      return this._alert.error('Phone no is required');
    }

    if (!this.memberSmsForm.valid) {
      return this._alert.error('Message body is required');
    }

    const body = this.memberSmsForm.value;
    body.SmsReqList = this.selectedMembers;
    body.LanType = 'English';

    Swal.fire({
      text: 'Are you sure you want to send bulk SMS?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4255b5',
      cancelButtonColor: '#333',
      width: '20rem',
      confirmButtonText: 'Send',
    }).then((result) => {
      if (result.isConfirmed) {
        this._service.sendBulkSms(body).subscribe({
          next: (res: any) => {
            this._alert.success('Bulk SMS sent successfully');
            this.memberSmsForm.reset();
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
